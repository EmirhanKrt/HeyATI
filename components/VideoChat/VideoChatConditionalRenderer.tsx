"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import VideoChat from ".";

const VideoChatConditionalRenderer = () => {
  const { roomId } = useAppSelector((state) => state.videoChat);

  const [content, setContent] = useState<ReactNode | null>(null);

  useEffect(() => {
    if (roomId) {
      setContent(<VideoChat roomId={roomId} />);
    } else {
      setContent(null);
    }
  }, [roomId]);

  return content;
};

export default VideoChatConditionalRenderer;
