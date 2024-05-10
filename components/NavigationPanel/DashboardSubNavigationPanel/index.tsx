"use client";

import { selectColor } from "@/lib/generateBackgroundColorByUserName";
import { useAppSelector } from "@/lib/store/hooks";
import Link from "next/link";

const DashboardSubNavigationPanel = ({
  activeUserName,
}: {
  activeUserName?: string;
}) => {
  const interactedUserList = useAppSelector(
    (selector) => selector.interactedUsers
  );

  return (
    <section className="navigation-subpanel-container">
      <nav
        className="navigation-panel-navigation"
        style={{ paddingTop: "8px" }}
      >
        <ul className="navigation-panel-subpanel-navigation-list">
          <li
            className={`navigation-panel-subpanel-navigation-list-item ${
              !activeUserName && "active"
            }`}
          >
            <span>Calendar</span>
          </li>
        </ul>
      </nav>
      <div className="navigation-subpanel-content-container">
        <span>Private Messages</span>

        <ul>
          {interactedUserList.order.map((userName) => {
            const user = interactedUserList.users[userName];
            const isActive = activeUserName === user.user_name;

            const liAttributes = {
              className: isActive ? "active" : "",
            };

            return (
              <li key={user.user_id} {...liAttributes}>
                <Link href={`/user/${user.user_name}`}>
                  <span
                    style={{ backgroundColor: selectColor(user.user_name) }}
                  >
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </span>
                  <div>
                    <span
                      style={{
                        color: "var(--text-color)",
                        fontSize: "12px",
                      }}
                    >
                      @{user.user_name}
                    </span>
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
    </section>
  );
};

export default DashboardSubNavigationPanel;
