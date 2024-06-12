"use client";

import Avatar from "@/components/Avatar";
import { LoadingCircle } from "@/components/LoadingCircle";
import PopUp from "@/components/PopUp";
import {
  deleteServerUser,
  updateServerUser,
} from "@/lib/store/features/server/serverSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { SafeServerUserType, ServerDetailedDataType } from "@/server/models";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";

const UserContainer = ({
  server_id,
  user,
  activeUser,
}: {
  server_id: number;
  user: {
    user_id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  activeUser: {
    user_id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}) => {
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const banUser = async () => {
    try {
      const request = await axios.post(
        `/api/server/${server_id}/user/${user.user_name}`,
        {
          bannedUntil: "2024-06-29T23:19:18",
        }
      );

      dispatch(
        deleteServerUser({
          server_id,
          user: request.data.data.user,
        })
      );
    } catch (error) {}
  };

  const updateUser = async () => {
    try {
      const roleSelect = document.querySelector("#role") as HTMLSelectElement;

      if (!roleSelect) return;

      const request = await axios.put(
        `/api/server/${server_id}/user/${user.user_name}`,
        {
          role: roleSelect.value,
        }
      );

      dispatch(
        updateServerUser({
          server_id,
          user: request.data.data.user,
        })
      );
    } catch (error) {}
  };

  return (
    <>
      <Link href={`/user/${user.user_name}`}>
        <Avatar user={user} />
        <div className="user-profile-list-container">
          <span className="username">@{user.user_name}</span>
          <span>
            {user.first_name} {user.last_name}
          </span>
        </div>
      </Link>
      {activeUser.role !== "user" &&
        user.role !== "owner" &&
        activeUser.user_name !== user.user_name && (
          <div
            className="settings-icon-container"
            onClick={() => setIsOpen(true)}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              viewBox="0 0 16 16"
              height="1rem"
              width="1rem"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"></path>
            </svg>
          </div>
        )}
      <PopUp
        type="content"
        title="User Details"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <div className="user-profile-list-container">
          <span className="username">@{user.user_name}</span>
          <span>
            {user.first_name} {user.last_name}
          </span>
        </div>
        {(activeUser.role === "administrator" ||
          activeUser.role === "owner") && (
          <>
            <select id="role">
              <option value="administrator">Administrator</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
            <button onClick={updateUser}>Save User</button>
          </>
        )}
        {activeUser.role !== "user" && (
          <button onClick={banUser}>Ban User</button>
        )}
      </PopUp>
    </>
  );
};

const ServerUserDetailPanel = ({
  isServerFound,
  isLoading,
  targetServer,
}: {
  isServerFound: boolean;
  isLoading: boolean;
  targetServer: ServerDetailedDataType;
}) => {
  const currentUser = useAppSelector((state) => state.user);

  if (isLoading) {
    return <LoadingCircle />;
  }

  const usersByRole = {
    owner: [],
    admin: [],
    moderator: [],
    user: [],
  } as {
    owner: SafeServerUserType[];
    admin: SafeServerUserType[];
    moderator: SafeServerUserType[];
    user: SafeServerUserType[];
  };

  targetServer.users.forEach((user) => {
    const role = user.role as "owner" | "admin" | "moderator" | "user";

    if (usersByRole[role]) usersByRole[role].push(user);
  });

  let container;

  if (!isServerFound) {
    container = (
      <span className="error-background error-text" style={{ margin: 4 }}>
        Server not found!
      </span>
    );
  } else {
    const activeUser = targetServer.users.find(
      (user) => user.user_id === currentUser.user_id
    );

    if (!activeUser) {
      return null;
    }

    container = (
      <>
        {Object.keys(usersByRole).map((role) => {
          return (
            <div key={role}>
              <span style={{ color: "var(--title-color)" }}>
                {role.charAt(0).toUpperCase() + role.slice(1)}{" "}
                {role === "owner" && "👑 "}-{" "}
                {
                  usersByRole[role as "owner" | "admin" | "moderator" | "user"]
                    .length
                }
              </span>
              <nav
                className="navigation-subpanel-content-container details"
                style={{ padding: 0, borderTop: 0, paddingTop: 4 }}
              >
                <ul style={{ gap: 4 }}>
                  {usersByRole[
                    role as "owner" | "admin" | "moderator" | "user"
                  ].map((user) => {
                    if (!user.user_id) return <></>;

                    return (
                      <li key={user.user_id}>
                        <UserContainer
                          user={user}
                          activeUser={activeUser}
                          server_id={targetServer.server_id}
                        />
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <div
      className="details"
      style={{
        justifyContent: "flex-start",
        overflow: "auto",
        gap: 16,
      }}
    >
      {container}
    </div>
  );
};

export default ServerUserDetailPanel;
