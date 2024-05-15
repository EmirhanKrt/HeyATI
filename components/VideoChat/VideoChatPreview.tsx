import { useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import useMediaPermissions from "@/lib/hooks/useMediaPermissions";
import { useMediaStream } from "@/lib/hooks/useMediaStream";
import VideoChatContainer from "./VideoChatContainer";
import useAudioAnalyzer from "@/lib/hooks/useAudioAnalyzer";
import { LoadingCircle } from "../LoadingCircle";

type CreateVideoChatContainerType = {
  containerType: "create_live_chat";
  user_name: string;
};

type JoinVideoChatContainerType = {
  containerType: "join_live_chat";
};

type VideoChatContainerType =
  | CreateVideoChatContainerType
  | JoinVideoChatContainerType;

const VideoChatPreview = (props: VideoChatContainerType) => {
  const permissionsGranted = useMediaPermissions();
  const { cameraStream, microphoneStream } = useMediaStream();
  const isSpeaking = useAudioAnalyzer(microphoneStream);

  const { user_name } = useAppSelector((state) => state.user);
  const { isMicrophoneActive, isCameraActive, calledRoomId, callerUser } =
    useAppSelector((state) => state.videoChat);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream as MediaStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    if (microphoneStream && audioRef.current) {
      audioRef.current.srcObject = microphoneStream;
    }
  }, [microphoneStream]);

  if (permissionsGranted === null) {
    return <LoadingCircle width={28} height={28} isPrimary={false} />;
  }

  if (!permissionsGranted) {
    return <div>Permission required</div>;
  }

  let content = <></>;

  if (props.containerType === "create_live_chat")
    content = (
      <VideoChatContainer
        containerType="create_live_chat"
        user_name={props.user_name}
      >
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
          ></audio>
          {!isMicrophoneActive && <div className="muted-icon">🔇</div>}
        </div>
      </VideoChatContainer>
    );

  if (props.containerType === "join_live_chat")
    content = (
      <VideoChatContainer
        containerType="join_live_chat"
        user_name={callerUser!.user_name}
        room_id={calledRoomId}
      >
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
          ></audio>
          {!isMicrophoneActive && <div className="muted-icon">🔇</div>}
        </div>
      </VideoChatContainer>
    );

  return content;
};

export default VideoChatPreview;
