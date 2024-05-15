"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import useAudioAnalyzer from "@/lib/hooks/useAudioAnalyzer";
import VideoChatContainer from "./VideoChatContainer";
import { useMediaStream } from "@/lib/hooks/useMediaStream";
import useMediaPermissions from "@/lib/hooks/useMediaPermissions";

interface PeerStream {
  videoStream: MediaStream;
  screenStream: MediaStream;
  audioStream: MediaStream;
  isMuted: boolean;
  isSpeaking: boolean;
  isCameraActive: boolean;
  isScreenSharing: boolean;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannels: {
    muteStatus: RTCDataChannel;
    speakingStatus: RTCDataChannel;
    cameraStatus: RTCDataChannel;
    screenShareStatus: RTCDataChannel;
  };
}

const peerConnections = new Map<string, PeerConnection>();

const VideoChat = () => {
  const currentUser = useAppSelector((state) => state.user);
  const { isCameraActive, isMicrophoneActive, isScreenSharingActive } =
    useAppSelector((state) => state.videoChat);

  const permissionsGranted = useMediaPermissions();

  const { cameraStream, microphoneStream, screenShareStream } =
    useMediaStream();

  const isSpeaking = useAudioAnalyzer(microphoneStream);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (cameraStream) {
      console.log("cameraStream:", cameraStream, cameraStream.getVideoTracks());
      sendStatusUpdate("cameraStatus", true);
      peerConnections.forEach((peerConnection) => {
        cameraStream.getTracks().forEach((track) => {
          const sender = peerConnection.connection
            .getSenders()
            .find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peerConnection.connection.addTrack(track, cameraStream);
          }
        });
      });

      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
    } else {
      sendStatusUpdate("cameraStatus", false);
    }
  }, [cameraStream]);

  useEffect(() => {
    if (microphoneStream) {
      console.log(microphoneStream);
      sendStatusUpdate("muteStatus", false);
      peerConnections.forEach((peerConnection) => {
        microphoneStream.getTracks().forEach((track) => {
          const sender = peerConnection.connection
            .getSenders()
            .find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peerConnection.connection.addTrack(track, microphoneStream);
          }
        });
      });

      if (audioRef.current) {
        audioRef.current.srcObject = microphoneStream;
      }
    } else {
      sendStatusUpdate("muteStatus", true);
    }
  }, [microphoneStream]);

  useEffect(() => {
    if (screenShareStream) {
      console.log(screenShareStream);
      sendStatusUpdate("screenShareStatus", true);
      peerConnections.forEach((peerConnection) => {
        screenShareStream.getTracks().forEach((track) => {
          const sender = peerConnection.connection
            .getSenders()
            .find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peerConnection.connection.addTrack(track, screenShareStream);
          }
        });
      });

      if (screenShareRef.current) {
        screenShareRef.current.srcObject = screenShareStream;
      }
    } else {
      sendStatusUpdate("screenShareStatus", false);
    }
  }, [screenShareStream]);

  const [peerStreams, setPeerStreams] = useState<{ [key: string]: PeerStream }>(
    {}
  );

  const handleSpeakingStatusMessage = (event: MessageEvent, peerId: string) => {
    console.log("received speaking", event);

    const isSpeaking = event.data === "true";
    setPeerStreams((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        isSpeaking,
      },
    }));
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
      dataChannel.onclose = () =>
        console.log("channel " + dataChannel.label + " closed");

      if (dataChannel.label === "muteStatus") {
        dataChannel.onmessage = (event) =>
          handleMuteStatusMessage(event, peerId);
      } else if (dataChannel.label === "speakingStatus") {
        dataChannel.onmessage = (event) =>
          handleSpeakingStatusMessage(event, peerId);
      } else if (dataChannel.label === "cameraStatus") {
        dataChannel.onmessage = (event) =>
          handleCameraStatusMessage(event, peerId);
      } else if (dataChannel.label === "screenShareStatus") {
        dataChannel.onmessage = (event) =>
          handleScreenShareStatusMessage(event, peerId);
      }
    };

    const muteStatusChannel = peerConnection.createDataChannel("muteStatus");
    const speakingStatusChannel =
      peerConnection.createDataChannel("speakingStatus");
    const cameraStatusChannel =
      peerConnection.createDataChannel("cameraStatus");
    const screenShareStatusChannel =
      peerConnection.createDataChannel("screenShareStatus");

    peerConnection.ontrack = (event) => {
      console.log("Track received:", event.track);
      onTrack(event, peerId);
    };
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate);
        onICECandidate(event, peerId);
      } else {
        console.log("All ICE candidates have been sent");
      }
    };
    peerConnection.onicecandidateerror = (event) => {
      console.error("ICE Candidate Error:", event);
    };

    peerConnection.onconnectionstatechange = (event) => {
      console.log("Peer Connection State Change:", event);
    };

    const addTracks = (stream: MediaStream, label: string) => {
      console.log(`Adding ${label} tracks:`, stream.getTracks());
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
    };

    if (cameraStream) {
      addTracks(cameraStream, "camera");
    }

    if (microphoneStream) {
      addTracks(microphoneStream, "microphone");
    }

    if (screenShareStream) {
      addTracks(screenShareStream, "screen share");
    }

    const peerConnectionData = {
      connection: peerConnection,
      dataChannels: {
        muteStatus: muteStatusChannel,
        speakingStatus: speakingStatusChannel,
        cameraStatus: cameraStatusChannel,
        screenShareStatus: screenShareStatusChannel,
      },
    };

    peerConnections.set(peerId, peerConnectionData);

    return peerConnectionData;
  };

  const onTrack = (event: RTCTrackEvent, peerId: string) => {
    const track = event.track;

    console.dir({ track });

    setPeerStreams((prev) => {
      const peerStream = prev[peerId] || {
        videoStream: new MediaStream(),
        screenStream: new MediaStream(),
        audioStream: new MediaStream(),
        isCameraActive: false,
        isScreenSharing: false,
        isMuted: true,
        isSpeaking: false,
      };

      if (track.kind === "video" && track.label.includes("screen")) {
        peerStream.screenStream.addTrack(track);
        peerStream.isScreenSharing = true;
      } else if (track.kind === "video") {
        peerStream.videoStream.addTrack(track);
        peerStream.isCameraActive = true;
      } else if (track.kind === "audio") {
        peerStream.audioStream.addTrack(track);
        peerStream.isMuted = false;
      }

      return {
        ...prev,
        [peerId]: peerStream,
      };
    });
  };

  const onICECandidate = (event: RTCPeerConnectionIceEvent, peerId: string) => {
    if (event.candidate) {
      console.log("Sending ICE candidate:", event.candidate);
      sendMessage({
        operation_type: "ice-candidate",
        payload: {
          candidate: event.candidate,
          user_name: peerId,
        },
      });
    }
  };

  const handleWebSocketMessage = useCallback(async (message: any) => {
    const {
      user: { user_name: peerId },
      type,
      offer,
      answer,
      candidate,
    } = message;

    console.log("Received WebSocket message:", message);

    switch (type) {
      case "new_user_joined_to_live_chat":
        await handleUserJoined(peerId);
        break;

      case "user_left_from_live_chat":
        await handleUserLeft(peerId);
        break;

      case "offer_live_chat":
        await handleOffer(peerId, offer);
        break;

      case "answer_live_chat":
        await handleAnswer(peerId, answer);
        break;

      case "ice_candidate_live_chat":
        await handleIceCandidate(peerId, candidate);
        break;

      default:
        console.error(`Unhandled message type: ${type}`);
    }
  }, []);

  const { sendMessage } = useWebSocket(handleWebSocketMessage);

  const handleUserJoined = async (peerId: string) => {
    const { connection } = await createPeerConnection(peerId);

    const offer = await connection.createOffer();
    await connection.setLocalDescription(new RTCSessionDescription(offer));

    sendMessage({
      operation_type: "offer",
      payload: {
        user_name: peerId,
        offer,
      },
    });
  };

  const handleOffer = async (
    peerId: string,
    offer: RTCSessionDescriptionInit
  ) => {
    const { connection } = await createPeerConnection(peerId);
    await connection.setRemoteDescription(offer);

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(new RTCSessionDescription(answer));

    sendMessage({
      operation_type: "answer",
      payload: {
        user_name: peerId,
        answer,
      },
    });
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
    const initialize = async () => {
      sendMessage({
        operation_type: "ready",
        payload: {},
      });
    };

    if (permissionsGranted) {
      initialize();
    }
  }, [permissionsGranted]);

  useEffect(() => {
    return () => {
      peerConnections.forEach((peerConnection) =>
        peerConnection.connection.close()
      );
      peerConnections.clear();
    };
  }, []);

  useEffect(() => {
    console.log(peerStreams);
  }, [peerStreams]);

  return (
    <VideoChatContainer containerType="live_chat">
      <div className={`video ${isSpeaking ? "speaking" : ""}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ display: isCameraActive ? "block" : "none" }}
        ></video>
        <audio
          ref={audioRef}
          autoPlay
          style={{ display: isMicrophoneActive ? "block" : "none" }}
          muted
        ></audio>
        <video
          ref={screenShareRef}
          autoPlay
          playsInline
          style={{ display: isScreenSharingActive ? "block" : "none" }}
        ></video>
        <div className="name">{currentUser.user_name} (you)</div>
        {!isMicrophoneActive && <div className="muted-icon">🔇</div>}
      </div>
      {Object.keys(peerStreams).map((peerId) => (
        <div
          className={`video ${
            peerStreams[peerId].isSpeaking ? "speaking" : ""
          }`}
          key={peerId}
        >
          {peerStreams[peerId].isCameraActive && (
            <video
              ref={(videoElement) => {
                if (videoElement) {
                  videoElement.srcObject = peerStreams[peerId].videoStream;
                }
              }}
              autoPlay
              playsInline
            />
          )}
          {peerStreams[peerId].isScreenSharing && (
            <video
              ref={(screenElement) => {
                if (screenElement) {
                  screenElement.srcObject = peerStreams[peerId].screenStream;
                }
              }}
              autoPlay
              playsInline
            />
          )}
          <audio
            ref={(audioElement) => {
              if (audioElement) {
                audioElement.srcObject = peerStreams[peerId].audioStream;
              }
            }}
            autoPlay
            playsInline
          />
          <div className="name">{peerId}</div>
          {peerStreams[peerId].isMuted && <div className="muted-icon">🔇</div>}
        </div>
      ))}
    </VideoChatContainer>
  );
};

export default VideoChat;
