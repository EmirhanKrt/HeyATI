"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/store/hooks";

import VideoChatContainer from "./VideoChatContainer";

import "./videoChat.global.css";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const peers = new Map<string, RTCPeerConnection>();

const VideoChat = () => {
  const videoChat = useAppSelector((state) => state.videoChat);
  const currentUser = useAppSelector((state) => state.user);

  const webSocketRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = mediaStream;

      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = videoChat.isMicrophoneActive;
      });

      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = videoChat.isCameraActive;
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const createOrUpdateVideoElement = (
    userName: string,
    stream: MediaStream
  ) => {
    if (userName === currentUser.user_name) return;

    let videoContainer = document.getElementById(`video-container-${userName}`);
    if (!videoContainer) {
      videoContainer = document.createElement("div");
      videoContainer.id = `video-container-${userName}`;
      videoContainer.className = "video";

      const video = document.createElement("video");
      video.id = `video-${userName}`;
      video.autoplay = true;
      video.playsInline = true;
      if (stream) {
        video.srcObject = stream;
      }

      const mutedIcon = document.createElement("div");
      mutedIcon.className = "muted-icon";
      mutedIcon.textContent = "🔇";

      videoContainer.appendChild(video);

      const nameDiv = document.createElement("div");
      nameDiv.className = "name";
      nameDiv.textContent = userName;

      videoContainer.appendChild(nameDiv);
      videoContainer.appendChild(mutedIcon);

      if (videoContainerRef.current) {
        videoContainerRef.current.appendChild(videoContainer);
      }
    } else if (stream) {
      const video = videoContainer.querySelector(
        `#video-${userName}`
      ) as HTMLVideoElement;
      if (video) {
        video.srcObject = stream;
      }
    }
  };

  const createOrUpdateScreenShareElement = (
    userName: string,
    stream: MediaStream
  ) => {
    let videoContainer = document.getElementById(`video-container-${userName}`);
    if (!videoContainer) {
      videoContainer = document.createElement("div");
      videoContainer.id = `video-container-${userName}`;
      videoContainer.className = "video";

      const video = document.createElement("video");
      video.id = `screen-${userName}`;
      video.autoplay = true;
      video.playsInline = true;
      if (stream) {
        video.srcObject = stream;
      }

      videoContainer.appendChild(video);

      const nameDiv = document.createElement("div");
      nameDiv.className = "name";
      nameDiv.textContent = "Screen (" + userName + ")";

      videoContainer.appendChild(nameDiv);

      if (videoContainerRef.current) {
        videoContainerRef.current.appendChild(videoContainer);
      }
    } else if (stream) {
      const video = videoContainer.querySelector(
        `#screen-${userName}`
      ) as HTMLVideoElement;
      if (video) {
        video.srcObject = stream;
      }
    }
  };

  const createNewPeerConnection = async (
    userName: string
  ): Promise<RTCPeerConnection> => {
    console.log(`Creating new peer connection for ${userName}`);
    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (streamRef.current) {
      console.log(`Adding local tracks to peer connection for ${userName}`);
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current as MediaStream);
      });
    } else {
      console.error("Local stream not found");
    }

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      console.log(`Received track from ${userName}`);

      console.log(stream.getVideoTracks());

      if (
        stream.getVideoTracks().some((track) => track.label.includes("screen"))
      ) {
        createOrUpdateScreenShareElement(userName, stream);
      } else {
        createOrUpdateVideoElement(userName, stream);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && webSocketRef.current) {
        console.log(`Sending ICE candidate from ${userName}`);
        webSocketRef.current.send(
          JSON.stringify({
            operation_type: "ice-candidate",
            payload: {
              candidate: event.candidate,
              user_name: userName,
            },
          })
        );
      }
    };

    return pc;
  };

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    from: string
  ) => {
    console.log(`Received offer from ${from}`);
    const pc = await createNewPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(new RTCSessionDescription(answer));

    if (webSocketRef.current) {
      console.log(`Sending answer to ${from}`);
      webSocketRef.current.send(
        JSON.stringify({
          operation_type: "answer",
          payload: {
            user_name: from,
            answer,
          },
        })
      );
    }

    peers.set(from, pc);
  };

  const handleAnswer = async (
    answer: RTCSessionDescriptionInit,
    from: string
  ) => {
    console.log(`Received answer from ${from}`);
    const peer = peers.get(from);
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    } else {
      console.error(`Peer connection not found for ${from}`);
    }
  };

  const handleIceCandidate = async (
    candidate: RTCIceCandidate,
    from: string
  ) => {
    console.log(`Received ICE candidate from ${from}`);
    const peer = peers.get(from);
    if (peer) {
      await peer.addIceCandidate(candidate);
    } else {
      console.error(`Peer connection not found for ${from}`);
    }
  };

  const handleUserJoined = async (userName: string) => {
    console.log(`User ${userName} joined`);
    const pc = await createNewPeerConnection(userName);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(new RTCSessionDescription(offer));

    if (webSocketRef.current) {
      console.log(`Sending offer to ${userName}`);
      webSocketRef.current.send(
        JSON.stringify({
          operation_type: "offer",
          payload: {
            user_name: userName,
            offer,
          },
        })
      );
    }

    peers.set(userName, pc);
  };

  const handleUserLeft = (userName: string) => {
    console.log(`User ${userName} left`);
    const peer = peers.get(userName);
    if (peer) {
      const videoToRemove = document.getElementById(`video-${userName}`);
      if (videoToRemove && videoContainerRef.current) {
        videoContainerRef.current.removeChild(videoToRemove);
      }
      peer.close();
      peers.delete(userName);
    }
  };

  useEffect(() => {
    getPermissions().then(() => {
      if (!webSocketRef.current) {
        const webSocket = new WebSocket(
          `ws://localhost:3001/ws/${videoChat.roomId}`
        );
        webSocketRef.current = webSocket;

        webSocket.onopen = () => {};

        webSocket.onmessage = (event: MessageEvent) => {
          const message = JSON.parse(event.data);
          const data = message.data;

          switch (data.type) {
            case "new_user_joined_to_live_chat":
              handleUserJoined(data.user.user_name);
              break;

            case "user_left_from_live_chat":
              handleUserLeft(data.user.user_name);
              break;

            case "offer_live_chat":
              handleOffer(data.offer, data.user.user_name);
              break;

            case "answer_live_chat":
              handleAnswer(data.answer, data.user.user_name);
              break;

            case "ice_candidate_live_chat":
              handleIceCandidate(data.candidate, data.user.user_name);
              break;

            default:
              break;
          }
        };

        webSocket.onclose = () => {
          peers.forEach((peer) => peer.close());
          peers.clear();
          if (videoContainerRef.current) {
            videoContainerRef.current.innerHTML = "";
          }
        };
      }
    });

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = videoChat.isMicrophoneActive;
      });

      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = videoChat.isCameraActive;
      });
    }

    peers.forEach((peer) => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          const sender = peer
            .getSenders()
            .find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peer.addTrack(track, streamRef.current as MediaStream);
          }
        });

        createOrUpdateVideoElement(currentUser.user_name, streamRef.current);
      }
    });
  }, [videoChat.isMicrophoneActive, videoChat.isCameraActive]);

  return (
    <VideoChatContainer>
      <div ref={videoContainerRef} id="video-container">
        <div className="video" id="localVideoContainer">
          <video
            id="localVideo"
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
          ></video>
          {!videoChat.isMicrophoneActive && (
            <div className="muted-icon">🔇</div>
          )}
          <div className="name">{currentUser.user_name}</div>
        </div>
      </div>
    </VideoChatContainer>
  );
};

export default VideoChat;
