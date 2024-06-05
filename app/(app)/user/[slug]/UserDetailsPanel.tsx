"use client";

import { LoadingCircle } from "@/components/LoadingCircle";
import { InteractedUserWithPrivateMessagesType } from "@/lib/store/features/interactedUsers/interactedUsersSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { requestedCreateCall } from "@/lib/store/features/videoChat/videoChatSlice";
import Avatar from "@/components/Avatar";

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
    return <LoadingCircle width={32} height={32} />;
  }

  let container;

  if (!isUserFound) {
    container = (
      <span className="error-background error-text" style={{ padding: 12 }}>
        User not found!
      </span>
    );
  } else {
    const userFullName = targetUser.first_name + " " + targetUser.last_name;

    container = (
      <div
        style={{
          display: "flex",
          gap: 16,
        }}
      >
        <Avatar user={targetUser} />
        <div className="user-profile-list-container" style={{ flexGrow: 1 }}>
          <span className="username">@{targetUser.user_name}</span>
          <span style={{ color: "var(--title-color)" }}>{userFullName}</span>
        </div>

        <button
          className="primary"
          onClick={onClick}
          style={{ width: "auto", height: 32, padding: "0 8px" }}
        >
          Call
        </button>
      </div>
    );
  }

  return container;
};

export default UserDetailsPanel;
