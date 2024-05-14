"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import PopUp from "../PopUp";
import VideoChatPreview from "../VideoChatPreview";

const VideoChatRequestUserToJoinCall = () => {
  const { callerUser, calledRoomId } = useAppSelector(
    (state) => state.videoChat
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (callerUser) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [callerUser]);

  if (callerUser)
    return (
      <PopUp
        type="content"
        title="Invited to join call"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <div>
          {callerUser.user_name} is calling you.
          <VideoChatPreview
            type="request_user_to_join_live_chat"
            user_name={callerUser.user_name}
            room_id={calledRoomId}
            setOpenState={setIsOpen}
          />
        </div>
      </PopUp>
    );
};

export default VideoChatRequestUserToJoinCall;
