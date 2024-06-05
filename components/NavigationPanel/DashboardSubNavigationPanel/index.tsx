"use client";

import Avatar from "@/components/Avatar";
import { useAppSelector } from "@/lib/store/hooks";
import Link from "next/link";
import UserAvatar from "../ServerNavigationPanel/UserAvatar";

const DashboardSubNavigationPanel = ({
  active_user_name,
}: {
  active_user_name?: string;
}) => {
  const interactedUserList = useAppSelector(
    (selector) => selector.interactedUsers
  );

  return (
    <section className="navigation-subpanel-container">
      <div className="navigation-header">
        <input
          type="text"
          placeholder="Find or start chat"
          style={{
            height: 28,
            padding: "1px 6px",
          }}
        />
      </div>
      <nav className="navigation-panel-navigation">
        <ul className="navigation-panel-subpanel-navigation-list">
          <li
            className={`navigation-panel-subpanel-navigation-list-item ${
              !active_user_name && "active"
            }`}
          >
            <Link href={"/"}>Calendar</Link>
          </li>
        </ul>
      </nav>
      <div
        className="navigation-subpanel-content-container"
        style={{ flexGrow: 1 }}
      >
        <span style={{ color: "var(--title-color)" }}>Private Messages</span>

        <ul>
          {interactedUserList.order.map((userName) => {
            const user = interactedUserList.users[userName];
            if (!user.user_id) return <></>;

            const isActive = active_user_name === user.user_name;

            const liAttributes = {
              className: isActive ? "active" : "",
            };

            return (
              <li key={user.user_id} {...liAttributes}>
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
      </div>
      <UserAvatar />
    </section>
  );
};

export default DashboardSubNavigationPanel;
