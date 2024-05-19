"use client";

import { useState } from "react";
import { LoadingCircle } from "@/components/LoadingCircle";
import VideoChatPreview from "@/components/VideoChat/VideoChatPreview";
import { selectColor } from "@/lib/generateBackgroundColorByUserName";
import { InteractedUserWithPrivateMessagesType } from "@/lib/store/features/interactedUsers/interactedUsersSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { requestedCreateCall } from "@/lib/store/features/videoChat/videoChatSlice";

const UserDetailsPanel = ({
  isUserFound,
  isLoading,
  targetUser,
}: {
  isUserFound: boolean;
  isLoading: boolean;
  targetUser: InteractedUserWithPrivateMessagesType;
}) => {
  const dispatch = useAppDispatch();
  const onClick = async () => {
    dispatch(requestedCreateCall({ userName: targetUser.user_name }));
  };

  if (isLoading) {
    return <LoadingCircle />;
  }

  let container;

  if (!isUserFound) {
    container = (
      <span className="error-background error-text" style={{ padding: 12 }}>
        User not found!
      </span>
    );
  } else {
    const userFirstNameAndLastNameFirstCharacterMerged =
      targetUser.first_name[0].toUpperCase() +
      targetUser.last_name[0].toUpperCase();

    const userFullName = targetUser.first_name + " " + targetUser.last_name;

    container = (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: selectColor(targetUser.user_name),
              display: "flex",
              padding: 0,
              alignItems: "center",
              justifyContent: "center",
              width: "96px",
              minWidth: "96px",
              maxWidth: "96px",
              height: "96px",
              minHeight: "96px",
              maxHeight: "96px",
              color: "var(--title-color)",
              fontSize: 36,
            }}
            className="navigation-panel-server-navigation-list-item"
          >
            {userFirstNameAndLastNameFirstCharacterMerged}
          </div>
          <div>
            <h3>{userFullName}</h3>
            <p>
              Username:{" "}
              <span style={{ color: "var(--title-color)" }}>
                {targetUser.user_name}
              </span>
            </p>
            <p>
              Email:{" "}
              <span style={{ color: "var(--title-color)" }}>
                {targetUser.user_email}
              </span>
            </p>
          </div>
        </div>
        <button className="primary" onClick={onClick}>
          Call
        </button>
      </>
    );
  }

  return <div className="user-details">{container}</div>;
};

export default UserDetailsPanel;
