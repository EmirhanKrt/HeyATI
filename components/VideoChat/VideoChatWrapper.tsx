"use client";

import { useAppSelector } from "@/lib/store/hooks";

import VideoChat from ".";
import VideoChatRequestUserToJoinCall from "./VideoChatRequestUserToJoinCall";

const VideoChatContainer = () => {
  const videoChat = useAppSelector((state) => state.videoChat);

  return (
    <>
      {videoChat.roomId !== "" && <VideoChat />}
      <VideoChatRequestUserToJoinCall />
    </>
  );
};

export default VideoChatContainer;
