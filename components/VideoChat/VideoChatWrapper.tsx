"use client";

import { useAppSelector } from "@/lib/store/hooks";

import VideoChat from ".";
import VideoChatPreview from "./VideoChatPreview";
import { useEffect } from "react";

const VideoChatWrapper = () => {
  const videoChat = useAppSelector((state) => state.videoChat);

  useEffect(() => {
    console.log(videoChat.callerUser);
  }, [videoChat.callerUser]);

  return (
    <>
      {videoChat.roomId !== "" && <VideoChat />}
      {videoChat.callerUser !== null && (
        <VideoChatPreview containerType="join_live_chat" />
      )}
    </>
  );
};

export default VideoChatWrapper;
