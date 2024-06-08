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

type CreateChannelVideoChatContainerType = {
  containerType: "create_channel_live_chat";
  server_id: number;
  channel_id: number;
  channel_name: string;
};

type JoinVideoChatContainerType = {
  containerType: "join_live_chat";
};

type JoinChannelVideoChatContainerType = {
  containerType: "join_channel_live_chat";
};

type VideoChatContainerType =
  | CreateVideoChatContainerType
  | CreateChannelVideoChatContainerType
  | JoinVideoChatContainerType
  | JoinChannelVideoChatContainerType;

const VideoChatPreview = (props: VideoChatContainerType) => {
  const permissionsGranted = useMediaPermissions();
  const { cameraStream, microphoneStream } = useMediaStream();

  const { calledRoomId, callerUser, calledChannelName } = useAppSelector(
    (state) => state.videoChat.showPreviewPayload
  );
  const { isMicrophoneActive } = useAppSelector(
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
      <div className="video-chat">
        <LoadingCircle width={28} height={28} isPrimary={false} />
      </div>
    );
  }

  if (!permissionsGranted) {
    return (
      <div className="video-chat">
        <h4>Permission required</h4>
      </div>
    );
  }

  let content = <></>;

  const defaultContent = (
    <div
      id="video-container"
      style={{
        width: "30vw",
        height: "30vh",
      }}
    >
      <div className={"video"}>
        <video ref={videoRef} autoPlay playsInline></video>
        <audio ref={audioRef} autoPlay></audio>
        {!isMicrophoneActive && <div className="muted-icon">🔇</div>}
      </div>
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

  if (props.containerType === "create_channel_live_chat")
    content = (
      <VideoChatContainer
        containerType="create_channel_live_chat"
        server_id={props.server_id}
        channel_id={props.channel_id}
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
          <h4>You are going to call {props.channel_name}</h4>
          {defaultContent}
        </div>
      </VideoChatContainer>
    );

  if (props.containerType === "join_live_chat")
    content = (
      <VideoChatContainer containerType="join_live_chat" room_id={calledRoomId}>
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

  if (props.containerType === "join_channel_live_chat")
    content = (
      <VideoChatContainer
        containerType="join_channel_live_chat"
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
          <h4>You called from {calledChannelName}</h4>
          {defaultContent}
        </div>
      </VideoChatContainer>
    );

  return content;
};

export default VideoChatPreview;
