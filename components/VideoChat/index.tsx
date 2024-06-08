"use client";

import { useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import useAudioAnalyzer from "@/lib/hooks/useAudioAnalyzer";
import { useMediaStream } from "@/lib/hooks/useMediaStream";
import VideoChatContainer from "./VideoChatContainer";
import {
  initializePeerConnectionState,
  removePeerConnectionState,
  updatePeerConnectionState,
} from "@/lib/store/features/peer/peerSlice";
import { setFullScreen } from "@/lib/store/features/videoChat/videoChatSlice";
import { getHostForWS } from "@/lib/api";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const peerConnections = new Map<string, RTCPeerConnection>();

const emptyStreamTrackIdPeerConnectionMapped: Record<
  string,
  { camera: string; microphone: string; screen: string }
> = {};

let onTrackCounter = 0;

const VideoChat = ({ roomId }: { roomId: string }) => {
  const currentUser = useAppSelector((state) => state.user);
  const { isCameraActive, isMicrophoneActive, isScreenSharingActive } =
    useAppSelector((state) => state.mediaPreferences);
  const peerConnectionStates = useAppSelector(
    (state) => state.peerConnectionState.peerConnectionStates
  );

  const dispatch = useAppDispatch();

  const { cameraStream, microphoneStream, screenShareStream } =
    useMediaStream();

  const isSpeaking = useAudioAnalyzer(microphoneStream);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const screenShareVideoContainerRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectInterval: number | null = null;

    const connectWebSocket = () => {
      ws = new WebSocket(`${getHostForWS()}/ws/${roomId}`);

      ws.onopen = () => {
        console.log("WebSocket connected");

        ws.send(
          JSON.stringify({
            operation_type: "ready",
            payload: {
              room_id: roomId,
            },
          })
        );

        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };

      ws.onclose = (event: CloseEvent) => {
        console.log("WebSocket disconnected", event);
        if (event.wasClean) {
          console.log(
            `Closed cleanly, code=${event.code} reason=${event.reason}`
          );
        } else {
          console.log("Connection died, attempting to reconnect...");
          if (!reconnectInterval) {
            reconnectInterval = window.setInterval(connectWebSocket, 1000);
          }
        }
      };

      ws.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
      };

      ws.onmessage = async (event: MessageEvent) => {
        const { data } = JSON.parse(event.data);
        const {
          user: { user_name: peerId },
          type,
          offer,
          answer,
          candidate,
        } = data;

        switch (type) {
          case "new_user_joined_to_live_chat":
            await handleUserJoined(peerId);
            return;

          case "user_left_from_live_chat":
            await handleUserLeft(peerId);
            return;

          case "offer_live_chat":
            await handleOffer(peerId, offer);
            return;

          case "answer_live_chat":
            await handleAnswer(peerId, answer);
            return;

          case "ice_candidate_live_chat":
            await handleIceCandidate(peerId, candidate);
            return;

          case "media_update_live_chat":
            handleMediaStreamUpdate(peerId, data.media_type, data.media_status);
            return;

          default:
            console.error(`Unhandled message type: ${type}`);
        }

        return;
      };

      socketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }

    peerConnections.forEach((_, peerId) => {
      addTrack(peerId, cameraStream, "camera");
    });
  }, [cameraStream]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = microphoneStream;
    }

    peerConnections.forEach((_, peerId) => {
      addTrack(peerId, microphoneStream, "microphone", false);
    });
  }, [microphoneStream]);

  useEffect(() => {
    if (screenShareRef.current) {
      screenShareRef.current.srcObject = screenShareStream;
    }

    peerConnections.forEach((_, peerId) => {
      addTrack(peerId, screenShareStream, "screen");
    });
  }, [screenShareStream]);

  useEffect(() => {
    Object.entries(peerConnectionStates).forEach(
      ([peerId, { isScreenActive }]) => {
        if (screenShareVideoContainerRef.current) {
          const peerScreenShareVideoContainer =
            screenShareVideoContainerRef.current.querySelector(
              "#screen-share-video-element-" + peerId
            );

          if (peerScreenShareVideoContainer) {
            if (isScreenActive) {
              peerScreenShareVideoContainer.classList.add("active");
              dispatch(setFullScreen(true));
            } else {
              peerScreenShareVideoContainer.classList.remove("active");
            }
          }
        }
      }
    );
  }, [peerConnectionStates]);

  const addTrack = (
    peerId: string,
    stream: MediaStream,
    type: "camera" | "microphone" | "screen",
    isVideo: boolean = true
  ) => {
    const peerConnection = peerConnections.get(peerId);

    if (!peerConnection) return;

    let streamTrack;
    if (isVideo) streamTrack = stream.getVideoTracks()[0];
    else streamTrack = stream.getAudioTracks()[0];

    let replaceTrackId = emptyStreamTrackIdPeerConnectionMapped[peerId][type];

    console.log(
      `type ${type}\n`,
      `streamTrack ${streamTrack.id}\n`,
      `replaceTrackId ${replaceTrackId}\n`,
      `senders ${peerConnection
        .getSenders()
        .map((s) => s.track?.id)
        .join(" - ")}`
    );

    switch (type) {
      case "camera":
        sendStatusUpdate(peerId, "camera", isCameraActive);
        break;

      case "microphone":
        sendStatusUpdate(peerId, "microphone", isMicrophoneActive);
        break;

      case "screen":
        sendStatusUpdate(peerId, "screen", isScreenSharingActive);
        break;

      default:
        break;
    }

    const sender = peerConnection
      .getSenders()
      .find((s) => s.track?.id === replaceTrackId);

    if (sender) {
      sender.replaceTrack(streamTrack);
    } else {
      peerConnection.addTrack(streamTrack, stream);
    }

    emptyStreamTrackIdPeerConnectionMapped[peerId][type] = streamTrack.id;
  };

  const createPeerConnection = async (peerId: string) => {
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    peerConnection.ontrack = (event) => onTrack(event, peerId);

    peerConnection.onicecandidate = (event) => onICECandidate(event, peerId);

    peerConnection.onnegotiationneeded = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current?.send(
        JSON.stringify({
          operation_type: "offer",
          payload: {
            user_name: peerId,
            offer,
          },
        })
      );

      return;
    };

    emptyStreamTrackIdPeerConnectionMapped[peerId] = {
      camera: cameraStream.getVideoTracks()[0].id,
      microphone: microphoneStream.getAudioTracks()[0].id,
      screen: screenShareStream.getVideoTracks()[0].id,
    };

    peerConnections.set(peerId, peerConnection);

    if (videoContainerRef.current) {
      const peerVideoContainer = videoContainerRef.current.querySelector(
        "#video-element-" + peerId
      );

      if (!peerVideoContainer) {
        const peerVideoContainerElement = document.createElement("div");
        peerVideoContainerElement.classList.add("video");
        peerVideoContainerElement.id = "video-element-" + peerId;

        const peerNameElement = document.createElement("span");
        peerNameElement.classList.add("name");
        peerNameElement.innerText = peerId;

        const peerVideoElement = document.createElement("video");
        peerVideoElement.id = "camera-" + peerId;
        peerVideoElement.autoplay = true;
        peerVideoElement.playsInline = true;

        const peerAudioElement = document.createElement("audio");
        peerAudioElement.id = "audio-" + peerId;
        peerAudioElement.autoplay = true;

        peerVideoContainerElement.appendChild(peerVideoElement);
        peerVideoContainerElement.appendChild(peerAudioElement);
        peerVideoContainerElement.appendChild(peerNameElement);
        videoContainerRef.current.appendChild(peerVideoContainerElement);
      }
    }

    if (screenShareVideoContainerRef.current) {
      const peerScreenShareVideoContainer =
        screenShareVideoContainerRef.current.querySelector(
          "#screen-share-video-element-" + peerId
        );

      if (!peerScreenShareVideoContainer) {
        const peerScreenShareVideoContainerElement =
          document.createElement("div");

        peerScreenShareVideoContainerElement.classList.add("video");
        peerScreenShareVideoContainerElement.id =
          "screen-share-video-element-" + peerId;

        const peerNameElement = document.createElement("span");
        peerNameElement.classList.add("name");
        peerNameElement.innerText = peerId + "'s screen";

        const peerScreenShareVideoElement = document.createElement("video");
        peerScreenShareVideoElement.id = "screen-share-" + peerId;
        peerScreenShareVideoElement.autoplay = true;
        peerScreenShareVideoElement.playsInline = true;

        peerScreenShareVideoContainerElement.appendChild(
          peerScreenShareVideoElement
        );
        screenShareVideoContainerRef.current.appendChild(
          peerScreenShareVideoContainerElement
        );
        peerScreenShareVideoContainerElement.appendChild(peerNameElement);
      }
    }

    dispatch(initializePeerConnectionState({ peerId }));

    addTrack(peerId, cameraStream, "camera");
    addTrack(peerId, microphoneStream, "microphone", false);
    addTrack(peerId, screenShareStream, "screen");

    return peerConnection;
  };

  const onTrack = (event: RTCTrackEvent, peerId: string) => {
    onTrackCounter++;

    const track = event.track;
    const stream = event.streams[0];

    console.log(new Date().toString(), "ontrack worked", track, stream);

    if (!videoContainerRef.current || !screenShareVideoContainerRef.current) {
      return;
    }

    const peerVideoContainer = videoContainerRef.current.querySelector(
      "#video-element-" + peerId
    );

    const peerScreenShareVideoContainer =
      screenShareVideoContainerRef.current.querySelector(
        "#screen-share-video-element-" + peerId
      );

    if (!peerVideoContainer || !peerScreenShareVideoContainer) {
      return;
    }

    if (track.kind === "video") {
      if (onTrackCounter === 3) {
        console.log("screen share received");
        const video = peerScreenShareVideoContainer.querySelector("video");
        if (!video) return;

        video.pause();

        const mediaStream =
          (video.srcObject as MediaStream) || new MediaStream();

        mediaStream.addTrack(track);
        video.srcObject = mediaStream;
        video.load();
        video.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      } else {
        const video = peerVideoContainer.querySelector("video");
        if (!video) return;

        video.pause();

        const mediaStream =
          (video.srcObject as MediaStream) || new MediaStream();

        mediaStream.addTrack(track);
        video.srcObject = mediaStream;
        video.load();
        video.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    } else if (track.kind === "audio") {
      const audio = peerVideoContainer.querySelector("audio");
      if (!audio) return;

      audio.pause();

      const mediaStream = (audio.srcObject as MediaStream) || new MediaStream();
      mediaStream.addTrack(track);
      audio.srcObject = mediaStream;
      audio.load();
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  const onICECandidate = (event: RTCPeerConnectionIceEvent, peerId: string) => {
    if (event.candidate) {
      socketRef.current?.send(
        JSON.stringify({
          operation_type: "ice-candidate",
          payload: {
            candidate: event.candidate,
            user_name: peerId,
          },
        })
      );
    }
  };

  const handleUserJoined = async (peerId: string) => {
    const connection = await createPeerConnection(peerId);

    const offer = await connection.createOffer();
    await connection.setLocalDescription(new RTCSessionDescription(offer));

    socketRef.current?.send(
      JSON.stringify({
        operation_type: "offer",
        payload: {
          user_name: peerId,
          offer,
        },
      })
    );
  };

  const handleOffer = async (
    peerId: string,
    offer: RTCSessionDescriptionInit
  ) => {
    const connection = await createPeerConnection(peerId);
    await connection.setRemoteDescription(offer);

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(new RTCSessionDescription(answer));

    socketRef.current?.send(
      JSON.stringify({
        operation_type: "answer",
        payload: {
          user_name: peerId,
          answer,
        },
      })
    );
  };

  const handleAnswer = async (
    peerId: string,
    answer: RTCSessionDescriptionInit
  ) => {
    const peerConnection = peerConnections.get(peerId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  };

  const handleIceCandidate = async (
    peerId: string,
    candidate: RTCIceCandidateInit
  ) => {
    const peerConnection = peerConnections.get(peerId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  };

  const handleUserLeft = async (peerId: string) => {
    const peerConnection = peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      peerConnections.delete(peerId);
      dispatch(removePeerConnectionState({ peerId }));

      if (videoContainerRef.current) {
        const peerVideoContainer = videoContainerRef.current.querySelector(
          "#video-element-" + peerId
        );

        if (peerVideoContainer)
          videoContainerRef.current.removeChild(peerVideoContainer);
      }

      if (screenShareVideoContainerRef.current) {
        const peerScreenShareVideoContainer =
          screenShareVideoContainerRef.current.querySelector(
            "#screen-share-video-element-" + peerId
          );

        if (peerScreenShareVideoContainer) {
          screenShareVideoContainerRef.current.removeChild(
            peerScreenShareVideoContainer
          );
        }
      }
    }
  };

  const handleMediaStreamUpdate = (
    peerId: string,
    mediaType: "camera" | "microphone" | "screen",
    mediaStatus: boolean
  ) => {
    dispatch(
      updatePeerConnectionState({
        peerId,
        mediaType,
        mediaStatus,
      })
    );
  };

  const sendStatusUpdate = (
    peerId: string,
    mediaType: "camera" | "microphone" | "screen",
    mediaStatus: boolean
  ) => {
    let wsMessage: any = {
      operation_type: "media-update",
      payload: {
        user_name: peerId,
        media_type: mediaType,
        media_status: mediaStatus,
      },
    };

    socketRef.current?.send(JSON.stringify(wsMessage));
  };

  useEffect(() => {
    return () => {
      peerConnections.forEach((peerConnection) => peerConnection.close());
      peerConnections.clear();
    };
  }, []);

  return (
    <VideoChatContainer containerType="live_chat">
      <div id="screen-share-video-container" ref={screenShareVideoContainerRef}>
        <div className={`video ${isScreenSharingActive ? "active" : ""}`}>
          <video ref={screenShareRef} autoPlay playsInline muted></video>
          <span className="name">Your screen</span>
        </div>
      </div>
      <div id="video-container" ref={videoContainerRef}>
        <div className={`video ${isSpeaking ? "speaking" : ""}`}>
          <video ref={videoRef} autoPlay playsInline muted></video>
          <audio ref={audioRef} muted></audio>
          <span className="name">{currentUser.user_name} (you)</span>
          {!microphoneStream && <div className="muted-icon">🔇</div>}
        </div>
      </div>
    </VideoChatContainer>
  );
};

export default VideoChat;
