"use client";

import CameraButton from "./CameraButton";
import MicrophoneButton from "./MicrophoneButton";
import ScreenShareButton from "./ShareScreenButton";
import LeaveButton from "./LeaveButton";

import "./videoChat.global.css";
import { useAppDispatch } from "@/lib/store/hooks";

type CreateVideoChatContainerType = {
  containerType: "create_live_chat";
  userName: string;
};

type JoinVideoChatContainerType = {
  containerType: "join_live_chat";
  userName: string;
  room_id: string;
};

type LiveVideoChatContainerType = {
  containerType: "live_chat";
};

type VideoChatContainerType = {
  children: React.ReactNode;
} & (
  | CreateVideoChatContainerType
  | JoinVideoChatContainerType
  | LiveVideoChatContainerType
);

const VideoChatContainer = (props: VideoChatContainerType) => {
  const dispatch = useAppDispatch();
  let buttonGroup = <></>;
  switch (props.containerType) {
    case "create_live_chat":
      buttonGroup = (
        <button
          className="primary icon-button"
          style={{ width: "auto", borderRadius: 7 }}
          onClick={(event) => {
            const wsMessagePayload = {
              operation_type: "create",
              payload: {
                user_name: [props.userName],
              },
            };

            dispatch({
              type: "WEBSOCKET_SEND_MESSAGE",
              payload: JSON.stringify(wsMessagePayload),
            });
          }}
        >
          Start Call
        </button>
      );
      break;

    case "join_live_chat":
      buttonGroup = (
        <>
          <button
            className="icon-button"
            style={{
              width: "auto",
              borderRadius: 7,
              backgroundColor: "var(--success-background-color)",
            }}
            onClick={(event) => {
              const wsMessagePayload = {
                operation_type: "join",
                payload: { room_id: props.room_id },
              };

              dispatch({
                type: "WEBSOCKET_SEND_MESSAGE",
                payload: JSON.stringify(wsMessagePayload),
              });
            }}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"></path>
            </svg>{" "}
            Accept
          </button>
          <button
            className="icon-button"
            style={{
              width: "auto",
              borderRadius: 7,
              backgroundColor: "var(--error-background-color)",
            }}
            onClick={(event) => {}}
          >
            <svg
              stroke="currentColor"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"></path>
            </svg>{" "}
            Reject
          </button>
        </>
      );
      break;

    case "live_chat":
    default:
      buttonGroup = (
        <>
          <ScreenShareButton />
          <LeaveButton />
        </>
      );
      break;
  }
  return (
    <div className="video-chat-container">
      <div>
        <div id="video-container">{props.children}</div>
        <div className="video-action-button-container">
          <MicrophoneButton />
          <CameraButton />
          {buttonGroup}
        </div>
      </div>
    </div>
  );
};

export default VideoChatContainer;
