import { useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import useMediaPermissions from "@/lib/hooks/useMediaPermissions";
import { useMediaStream } from "@/lib/hooks/useMediaStream";
import VideoChatContainer from "./VideoChatContainer";
import { LoadingCircle } from "../LoadingCircle";

type CreateVideoChatContainerType = {
  containerType: "create_live_chat";
  userName: string;
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

  const { calledRoomId, callerUser } = useAppSelector(
    (state) => state.videoChat.showPreviewPayload
  );
  const { isMicrophoneActive, isCameraActive } = useAppSelector(
    (state) => state.mediaPreferences
  );

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
    return (
      <div className="video-chat-container">
        <LoadingCircle width={28} height={28} isPrimary={false} />
      </div>
    );
  }

  if (!permissionsGranted) {
    return (
      <div className="video-chat-container">
        <h4>Permission required</h4>
      </div>
    );
  }

  let content = <></>;

  const defaultContent = (
    <div className={"video"}>
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
  );

  if (props.containerType === "create_live_chat")
    content = (
      <VideoChatContainer
        containerType="create_live_chat"
        userName={props.userName}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <h4>You are going to call {props.userName}</h4>
          {defaultContent}
        </div>
      </VideoChatContainer>
    );

  if (props.containerType === "join_live_chat")
    content = (
      <VideoChatContainer
        containerType="join_live_chat"
        userName={callerUser.user_name}
        room_id={calledRoomId}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <h4>{callerUser.user_name} is calling</h4>
          {defaultContent}
        </div>
      </VideoChatContainer>
    );

  return content;
};

export default VideoChatPreview;
