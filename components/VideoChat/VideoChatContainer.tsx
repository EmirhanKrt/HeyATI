"use client";

import CameraButton from "./CameraButton";
import MicrophoneButton from "./MicrophoneButton";
import ScreenShareButton from "./ShareScreenButton";
import LeaveButton from "./LeaveButton";

import "./videoChat.global.css";
import { useAppDispatch } from "@/lib/store/hooks";

type CreateVideoChatContainerType = {
  containerType: "create_live_chat";
  user_name: string;
};

type JoinVideoChatContainerType = {
  containerType: "join_live_chat";
  user_name: string;
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
          className="icon-button"
          onClick={(event) => {
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
          }}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877zM11 .5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-4.146 4.147a.5.5 0 0 1-.708-.708L14.293 1H11.5a.5.5 0 0 1-.5-.5"></path>
          </svg>
        </button>
      );
      break;

    case "join_live_chat":
      buttonGroup = (
        <>
          <button
            className="icon-button"
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
            </svg>
          </button>
          <button
            className="icon-button"
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
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877zM11 .5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-4.146 4.147a.5.5 0 0 1-.708-.708L14.293 1H11.5a.5.5 0 0 1-.5-.5"
              ></path>
            </svg>
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
