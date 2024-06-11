"use client";

import Avatar from "@/components/Avatar";
import { LoadingCircle } from "@/components/LoadingCircle";
import { SafeServerUserType, ServerDetailedDataType } from "@/server/models";
import Link from "next/link";

const ServerUserDetailPanel = ({
  isServerFound,
  isLoading,
  targetServer,
}: {
  isServerFound: boolean;
  isLoading: boolean;
  targetServer: ServerDetailedDataType;
}) => {
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
                className="navigation-subpanel-content-container"
                style={{ padding: 0, borderTop: 0, paddingTop: 4 }}
              >
                <ul style={{ gap: 4 }}>
                  {usersByRole[
                    role as "owner" | "admin" | "moderator" | "user"
                  ].map((user) => {
                    if (!user.user_id) return <></>;

                    return (
                      <li key={user.user_id}>
                        <Link href={`/user/${user.user_name}`}>
                          <Avatar user={user} />
                          <div className="user-profile-list-container">
                            <span className="username">@{user.user_name}</span>
                            <span>
                              {user.first_name} {user.last_name}
                            </span>
                          </div>
                        </Link>
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
