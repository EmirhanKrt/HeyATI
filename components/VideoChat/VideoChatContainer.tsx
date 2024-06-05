"use client";

import CameraButton from "./CameraButton";
import MicrophoneButton from "./MicrophoneButton";
import ScreenShareButton from "./ShareScreenButton";
import LeaveButton from "./LeaveButton";

import "./videoChat.global.css";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import FullScreenButton from "./FullScreenButton";
import { useEffect, useRef, useState } from "react";
import { leaveCall } from "@/lib/store/features/videoChat/videoChatSlice";

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

  const isFullScreen = useAppSelector((state) => state.videoChat.isFullScreen);
  const videoChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoChat = videoChatRef.current;

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === "width" || e.propertyName === "height") {
        if (videoChat && !isFullScreen) {
          videoChat.style.left = `calc(100% - 300px - 16px)`;
          videoChat.style.top = `calc(100% - 200px - 16px)`;
          setTimeout(() => {
            videoChat.style.setProperty(
              "transition",
              "width 0.3s, height 0.3s"
            );
          }, 300);
        }
      }
    };

    if (videoChat) {
      if (isFullScreen) {
        videoChat.style.left = `0`;
        videoChat.style.top = `0`;
        videoChat.style.removeProperty("transition");
      } else {
        videoChat.addEventListener("transitionend", handleTransitionEnd);
        videoChat.addEventListener("mousedown", handleMouseDown);
      }
    }

    return () => {
      if (videoChat) {
        videoChat.removeEventListener("transitionend", handleTransitionEnd);
        videoChat.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, [isFullScreen]);

  const handleMouseDown = (e: MouseEvent) => {
    const videoChat = videoChatRef.current;
    if (!videoChat) return;

    const offsetX = e.clientX - videoChat.offsetLeft;
    const offsetY = e.clientY - videoChat.offsetTop;

    const handleMouseMove = (e: MouseEvent) => {
      videoChat.style.left = `${e.clientX - offsetX}px`;
      videoChat.style.top = `${e.clientY - offsetY}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  let buttonGroup = <></>;
  switch (props.containerType) {
    case "create_live_chat":
      buttonGroup = (
        <>
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
          <button
            className="icon-button"
            style={{
              width: "auto",
              borderRadius: 7,
              backgroundColor: "var(--error-background-color)",
              marginRight: "auto",
            }}
            onClick={(event) => {
              dispatch(leaveCall());
            }}
          >
            Cancel
          </button>
        </>
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
              marginRight: "auto",
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
          <FullScreenButton />
        </>
      );
      break;
  }

  return (
    <div
      className={`video-chat ${isFullScreen ? "" : "small"}`}
      ref={videoChatRef}
    >
      <div className="video-chat-container">{props.children}</div>
      <div className="video-action-button-container">
        <MicrophoneButton />
        <CameraButton />
        {buttonGroup}
      </div>
    </div>
  );
};

export default VideoChatContainer;
