"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { MouseEventHandler, useEffect, useRef, useState } from "react";

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

  const [isFullscreen, setIsFullscreen] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isFullscreen && videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDragging && videoContainerRef.current) {
      const newLeft = e.clientX - offset.x;
      const newTop = e.clientY - offset.y;
      const containerWidth = videoContainerRef.current.offsetWidth;
      const containerHeight = videoContainerRef.current.offsetHeight;
      const maxLeft = window.innerWidth - containerWidth;
      const maxTop = window.innerHeight - containerHeight;

      if (newLeft >= 0 && newLeft <= maxLeft) {
        videoContainerRef.current.style.left = `${newLeft}px`;
      }
      if (newTop >= 0 && newTop <= maxTop) {
        videoContainerRef.current.style.top = `${newTop}px`;
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const getPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = mediaStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
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

      const existingVideoElement = document.getElementById(
        `video-${userName}`
      ) as HTMLVideoElement;
      if (existingVideoElement) {
        existingVideoElement.srcObject = stream;
      } else {
        const videoContainer = document.createElement("div");
        videoContainer.className = "video";

        const span = document.createElement("span");

        const video = document.createElement("video");
        video.id = `video-${userName}`;
        video.autoplay = true;
        video.playsInline = true;
        video.srcObject = stream;

        span.appendChild(video);
        videoContainer.appendChild(span);

        const nameDiv = document.createElement("div");
        nameDiv.className = "name";
        nameDiv.textContent = userName;

        videoContainer.appendChild(nameDiv);

        if (videoContainerRef.current) {
          videoContainerRef.current.appendChild(videoContainer);
        }
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
    if (videoChat.roomId) {
      getPermissions().then(() => {
        if (!webSocketRef.current) {
          const webSocket = new WebSocket(
            `ws://localhost:3001/ws/${videoChat.roomId}`
          );
          webSocketRef.current = webSocket;

          webSocket.onopen = () => {
            // Do nothing, permissions are already handled
          };

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
    }

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, [videoChat.roomId]);

  useEffect(() => {
    console.log(videoChat.roomId);
  }, [videoChat.roomId]);

  return (
    videoChat.roomId && (
      <div className="video-chat-container">
        {isFullscreen ? (
          <div>
            <div ref={videoContainerRef} id="video-container">
              <div className="video" id="localVideoContainer">
                <span>
                  <video
                    id="localVideo"
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                  ></video>
                </span>
                <div className="name">{currentUser.user_name}</div>
              </div>
            </div>

            <div className="video-action-button-container">
              <button>Sustur</button>
              <button>Kamera Kapat</button>
              <button>Ekran Paylaş</button>
              <button onClick={handleToggle}>▲</button>
            </div>
          </div>
        ) : (
          <div
            ref={videoContainerRef}
            id="video-container"
            onMouseDown={handleMouseDown}
          >
            <div>
              <button>Sustur</button>
              <button>Kamera Kapat</button>
              <button>Ekran Paylaş</button>
              <button onClick={handleToggle}>▲</button>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default VideoChat;
