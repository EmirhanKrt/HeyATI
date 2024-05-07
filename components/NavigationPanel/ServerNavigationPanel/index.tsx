"use client";

import { useState } from "react";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import { useAppSelector } from "@/lib/store/hooks";
import PopUp from "@/components/PopUp";
import CreateServerForm from "./CreateServerForm";

const ServerNavigationPanel = ({
  activeServerId,
}: {
  activeServerId?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const serverList = useAppSelector((selector) => selector.server);

  return (
    <nav
      className="navigation-panel-navigation"
      style={{ justifyContent: "space-between" }}
    >
      <ul className="navigation-panel-server-navigation-list">
        {serverList.map((server) => {
          const isActive = Number(activeServerId) === server.server_id;

          const props = {
            className: `navigation-panel-server-navigation-list-item ${
              isActive ? "active" : ""
            }`,
          };

          const serverShortName = server.server_name
            .split(" ")
            .map((splittedServerName) =>
              splittedServerName.at(0)?.toUpperCase()
            )
            .join("");

          return (
            <div
              className="navigation-panel-server-navigation-list-item-container"
              key={server.server_id}
            >
              <li {...props}>
                <Link href={`/server/${server.server_id}`}>
                  {serverShortName}
                </Link>
              </li>
              <span className="navigation-panel-server-navigation-list-item-tooltip">
                {server.server_name}
              </span>
            </div>
          );
        })}
        <button
          style={{ borderRadius: "50%", height: "40px", width: "40px" }}
          onClick={() => setIsOpen(true)}
        >
          +
        </button>
      </ul>
      <UserAvatar />

      <PopUp title="Create server" openState={isOpen} setOpenState={setIsOpen}>
        <CreateServerForm />
      </PopUp>
    </nav>
  );
};

export default ServerNavigationPanel;
