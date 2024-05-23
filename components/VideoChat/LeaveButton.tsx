"use client";

import { leaveCall } from "@/lib/store/features/videoChat/videoChatSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

const LeaveButton = () => {
  const dispatch = useAppDispatch();
  const roomId = useAppSelector((state) => state.videoChat.roomId);

  const handleLeave = () => {
    const wsMessagePayload = {
      operation_type: "leave",
      payload: {
        room_id: roomId,
      },
    };

    dispatch({
      type: "WEBSOCKET_SEND_MESSAGE",
      payload: JSON.stringify(wsMessagePayload),
    });

    dispatch(leaveCall());
  };

  return (
    <button className="icon-button leave-button" onClick={handleLeave}>
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M3.68 16.07l3.92-3.11V9.59c2.85-.93 5.94-.93 8.8 0v3.38l3.91 3.1L24 12.39c-6.41-7.19-17.59-7.19-24 0l3.68 3.68z"></path>
      </svg>
    </button>
  );
};

export default LeaveButton;
