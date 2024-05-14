import { useState, useEffect, useRef, SetStateAction, Dispatch } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import useMediaPermissions from "@/lib/hooks/useMediaPermissions";
import {
  toggleCamera,
  toggleMicrophone,
} from "@/lib/store/features/videoChat/videoChatSlice";

type UserPrivateVideoChatCreatePreviewType = {
  type: "create_live_chat";
  user_name: string;
};

type UserPrivateVideoChatRequestUserToJoinPreviewType = {
  type: "request_user_to_join_live_chat";
  user_name: string;
  room_id: string;
};

type VideoChatPreviewType = {
  setOpenState: Dispatch<SetStateAction<boolean>>;
} & (
  | UserPrivateVideoChatCreatePreviewType
  | UserPrivateVideoChatRequestUserToJoinPreviewType
);

const VideoChatPreview = (props: VideoChatPreviewType) => {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { isMicrophoneActive, isCameraActive } = useAppSelector(
    (state) => state.videoChat
  );

  const permissions = useMediaPermissions();

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setCameraStream(stream);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Permissions denied");
      }
    };

    if (permissions.camera && permissions.microphone) {
      requestPermissions();
    }
  }, [permissions]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    if (cameraStream) {
      cameraStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = isCameraActive));
      cameraStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = isMicrophoneActive));
    }
  }, [isCameraActive, isMicrophoneActive, cameraStream]);

  const handleToggleCamera = () => {
    dispatch(toggleCamera());
  };

  const handleToggleMicrophone = () => {
    dispatch(toggleMicrophone());
  };

  const startCall = () => {
    if (props.type === "create_live_chat") {
      const wsMessagePayload = {
        operation_type: "create",
        payload: {
          user_name: props.user_name,
        },
      };

      dispatch({
        type: "WEBSOCKET_SEND_MESSAGE",
        payload: JSON.stringify(wsMessagePayload),
      });

      props.setOpenState(false);
      router.push(`/user/${props.user_name}`);
    } else if (props.type === "request_user_to_join_live_chat") {
      const wsMessagePayload = {
        operation_type: "join",
        payload: { room_id: props.room_id },
      };

      dispatch({
        type: "WEBSOCKET_SEND_MESSAGE",
        payload: JSON.stringify(wsMessagePayload),
      });

      props.setOpenState(false);
      router.push(`/user/${props.user_name}`);
    }
  };

  let buttonMessage = "";

  if (props.type === "create_live_chat") {
    buttonMessage = "Start Call";
  } else if (props.type === "request_user_to_join_live_chat") {
    buttonMessage = "Accept Call";
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (cameraStream) {
    return (
      <>
        <video ref={videoRef} autoPlay style={{ width: "100%" }} />
        <button onClick={handleToggleCamera}>
          {isCameraActive ? "Turn Off Camera" : "Turn On Camera"}
        </button>
        <button onClick={handleToggleMicrophone}>
          {isMicrophoneActive ? "Turn Off Microphone" : "Turn On Microphone"}
        </button>
        <button className="primary" onClick={startCall}>
          {buttonMessage}
        </button>
      </>
    );
  }

  return <div>Loading...</div>;
};

export default VideoChatPreview;
