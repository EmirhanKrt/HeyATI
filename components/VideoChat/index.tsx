"use client";

import { useRef, useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import useAudioAnalyzer from "@/lib/hooks/useAudioAnalyzer";
import { useMediaStream } from "@/lib/hooks/useMediaStream";
import VideoChatContainer from "./VideoChatContainer";

interface PeerStream {
  cameraStream: MediaStream | null;
  microphoneStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMuted: boolean;
  isCameraActive: boolean;
  isScreenSharing: boolean;
}

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannels: {
    muteStatus: RTCDataChannel;
    cameraStatus: RTCDataChannel;
    screenShareStatus: RTCDataChannel;
  };
}

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const peerConnections = new Map<string, PeerConnection>();

const emptyStreamTrackIdPeerConnectionMapped: Record<
  string,
  { camera: string; microphone: string; screen: string }
> = {};

const Video = ({
  peerStream,
  peerId,
}: {
  peerStream: PeerStream;
  peerId: string;
}) => {
  const isSpeaking = useAudioAnalyzer(peerStream.microphoneStream);

  return (
    <div className={`video ${isSpeaking ? "speaking" : ""}`}>
      {peerStream.cameraStream && peerStream.isCameraActive ? (
        <video
          ref={(videoElement) => {
            if (videoElement) {
              videoElement.srcObject = new MediaStream([
                peerStream.cameraStream!.getVideoTracks()[0],
              ]);
            }
          }}
          autoPlay
          playsInline
        />
      ) : (
        <>asdads</>
      )}
      {peerStream.microphoneStream && !peerStream.isMuted && (
        <audio
          ref={(audioElement) => {
            if (audioElement) {
              audioElement.srcObject = new MediaStream([
                peerStream.microphoneStream!.getAudioTracks()[0],
              ]);
            }
          }}
          autoPlay
          playsInline
        />
      )}

      <div className="name">{peerId}</div>
      {peerStream.isMuted && <div className="muted-icon">🔇</div>}
    </div>
  );
};

const VideoChat = ({ roomId }: { roomId: string }) => {
  const currentUser = useAppSelector((state) => state.user);
  const { isCameraActive, isMicrophoneActive, isScreenSharingActive } =
    useAppSelector((state) => state.mediaPreferences);

  const { cameraStream, microphoneStream, screenShareStream } =
    useMediaStream();

  const [peerStreams, setPeerStreams] = useState<Record<string, PeerStream>>(
    {}
  );

  const isSpeaking = useAudioAnalyzer(microphoneStream);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectInterval: number | null = null;

    const connectWebSocket = () => {
      ws = new WebSocket(`ws://localhost:3001/ws/${roomId}`);

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

  const addTrack = (
    peerId: string,
    stream: MediaStream,
    type: "camera" | "microphone" | "screen",
    isVideo: boolean = true
  ) => {
    const peerConnection = peerConnections.get(peerId);

    if (!peerConnection || !peerConnection.connection) return;

    switch (type) {
      case "camera":
        sendStatusUpdate("cameraStatus", isCameraActive);
        break;

      case "microphone":
        sendStatusUpdate("muteStatus", !isMicrophoneActive);
        break;

      case "screen":
        sendStatusUpdate("screenShareStatus", isScreenSharingActive);
        break;
      default:
        break;
    }

    let streamTrack;
    if (isVideo) streamTrack = stream.getVideoTracks()[0];
    else streamTrack = stream.getAudioTracks()[0];

    let replaceTrackId = emptyStreamTrackIdPeerConnectionMapped[peerId][type];

    console.log(
      `type ${type}\n`,
      `streamTrack ${streamTrack.id}\n`,
      `replaceTrackId ${replaceTrackId}\n`,
      `senders ${peerConnection.connection
        .getSenders()
        .map((s) => s.track?.id)
        .join(" - ")}`
    );

    const sender = peerConnection.connection
      .getSenders()
      .find((s) => s.track?.id === replaceTrackId);

    if (sender) {
      sender.replaceTrack(streamTrack);
      emptyStreamTrackIdPeerConnectionMapped[peerId][type] = streamTrack.id;
    } else {
      peerConnection.connection.addTrack(streamTrack, stream);
    }
  };

  const handleMuteStatusMessage = (event: MessageEvent, peerId: string) => {
    console.log("received isMuted", event);

    const isMuted = event.data === "true";
    setPeerStreams((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        isMuted,
      },
    }));
  };

  const handleCameraStatusMessage = (event: MessageEvent, peerId: string) => {
    console.log("received camera", event);

    const isCameraActive = event.data === "true";
    setPeerStreams((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        isCameraActive,
      },
    }));
  };

  const handleScreenShareStatusMessage = (
    event: MessageEvent,
    peerId: string
  ) => {
    console.log("received screen sharing", event);

    const isScreenSharing = event.data === "true";
    setPeerStreams((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        isScreenSharing,
      },
    }));
  };

  const createPeerConnection = async (peerId: string) => {
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;

      dataChannel.onopen = () => {
        console.log("channel " + dataChannel.label + " open");
        sendStatusUpdate("muteStatus", !isMicrophoneActive);
        sendStatusUpdate("cameraStatus", isCameraActive);
        sendStatusUpdate("screenShareStatus", isScreenSharingActive);
      };

      dataChannel.onclose = () => {
        console.log("channel " + dataChannel.label + " closed");
      };

      if (dataChannel.label === "muteStatus") {
        dataChannel.onmessage = (event) => {
          handleMuteStatusMessage(event, peerId);
        };
      } else if (dataChannel.label === "cameraStatus") {
        {
          dataChannel.onmessage = (event) =>
            handleCameraStatusMessage(event, peerId);
        }
      } else if (dataChannel.label === "screenShareStatus") {
        {
          dataChannel.onmessage = (event) =>
            handleScreenShareStatusMessage(event, peerId);
        }
      }
    };

    const muteStatusChannel = peerConnection.createDataChannel("muteStatus");
    const cameraStatusChannel =
      peerConnection.createDataChannel("cameraStatus");
    const screenShareStatusChannel =
      peerConnection.createDataChannel("screenShareStatus");

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

    const peerConnectionData = {
      connection: peerConnection,
      dataChannels: {
        muteStatus: muteStatusChannel,
        cameraStatus: cameraStatusChannel,
        screenShareStatus: screenShareStatusChannel,
      },
    };

    peerConnections.set(peerId, peerConnectionData);

    /*     addTrack(peerId, cameraStream, "camera");
    addTrack(peerId, microphoneStream, "microphone", false);
    addTrack(peerId, screenShareStream, "screen"); */

    setPeerStreams((prev) => {
      const peerStream = prev[peerId] || {
        videoStream: null,
        screenStream: null,
        audioStream: null,
        isCameraActive: false,
        isScreenSharing: false,
        isMuted: true,
      };

      return {
        ...prev,
        [peerId]: { ...prev[peerId], ...peerStream },
      };
    });

    return peerConnectionData;
  };

  const onTrack = (event: RTCTrackEvent, peerId: string) => {
    const track = event.track;
    const stream = event.streams[0];

    setPeerStreams((prev) => {
      const peerStream = prev[peerId] || {
        videoStream: null,
        screenStream: null,
        audioStream: null,
        isCameraActive: false,
        isScreenSharing: false,
        isMuted: true,
      };

      if (track.kind === "video" && track.label.includes("screen")) {
        peerStream.screenStream = stream;
      } else if (track.kind === "video") {
        peerStream.cameraStream = stream;
      } else if (track.kind === "audio") {
        peerStream.microphoneStream = stream;
      }

      return {
        ...prev,
        [peerId]: peerStream,
      };
    });
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
    const { connection } = await createPeerConnection(peerId);

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
    const { connection } = await createPeerConnection(peerId);
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
      await peerConnection.connection.setRemoteDescription(
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
      await peerConnection.connection.addIceCandidate(candidate);
    }
  };

  const handleUserLeft = async (peerId: string) => {
    const peerConnection = peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.connection.close();
      peerConnections.delete(peerId);
      setPeerStreams((prev) => {
        const updatedStreams = { ...prev };
        delete updatedStreams[peerId];
        return updatedStreams;
      });
    }
  };

  const sendStatusUpdate = (
    channelName: keyof PeerConnection["dataChannels"],
    status: boolean
  ) => {
    peerConnections.forEach(({ dataChannels }) => {
      const dataChannel = dataChannels[channelName];
      if (dataChannel.readyState === "open") {
        dataChannel.send(status.toString());
      }
    });
  };

  useEffect(() => {
    return () => {
      peerConnections.forEach((peerConnection) =>
        peerConnection.connection.close()
      );
      peerConnections.clear();
    };
  }, []);

  return (
    <VideoChatContainer containerType="live_chat">
      <div className={`video ${isSpeaking ? "speaking" : ""}`}>
        <video ref={videoRef} autoPlay playsInline muted></video>
        <audio ref={audioRef} muted></audio>
        <div className="name">{currentUser.user_name} (you)</div>
        {!microphoneStream && <div className="muted-icon">🔇</div>}
      </div>
      {Object.entries(peerStreams).map(([peerId, peerStream]) => (
        <Video peerStream={peerStream} peerId={peerId} key={peerId} />
      ))}
    </VideoChatContainer>
  );
};

export default VideoChat;
