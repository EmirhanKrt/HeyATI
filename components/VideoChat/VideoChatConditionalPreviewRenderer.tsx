"use client";

import { useAppSelector } from "@/lib/store/hooks";
import VideoChatPreview from "./VideoChatPreview";

const VideoChatConditionalPreviewRenderer = () => {
  const videoChat = useAppSelector((state) => state.videoChat);

  if (videoChat.showPreview) {
    if (videoChat.showPreviewType === "create_live_chat") {
      return (
        <VideoChatPreview
          containerType="create_live_chat"
          userName={videoChat.showPreviewPayload.userName}
        />
      );
    } else if (videoChat.showPreviewType === "create_channel_live_chat") {
      return (
        <VideoChatPreview
          containerType="create_channel_live_chat"
          server_id={videoChat.showPreviewPayload.server_id}
          channel_id={videoChat.showPreviewPayload.channel_id}
          channel_name={videoChat.showPreviewPayload.channel_name}
        />
      );
    } else if (videoChat.showPreviewType === "join_live_chat") {
      return <VideoChatPreview containerType="join_live_chat" />;
    } else if (videoChat.showPreviewType === "join_channel_live_chat") {
      return <VideoChatPreview containerType="join_channel_live_chat" />;
    }
  }

  return null;
};

export default VideoChatConditionalPreviewRenderer;
