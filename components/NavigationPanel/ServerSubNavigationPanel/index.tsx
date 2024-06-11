"use client";

import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { LoadingCircle } from "@/components/LoadingCircle";
import UserAvatar from "../ServerNavigationPanel/UserAvatar";
import ServerSettings from "./ServerSettings";
import { SafeChannelType } from "@/server/models";
import { useState } from "react";
import PopUp from "@/components/PopUp";
import ChannelUpdateForm from "./ChannelUpdateForm";
import ChannelDeleteForm from "./ChannelDeleteForm";
import ChannelCreateForm from "./ChannelCreateForm";
import Invites from "./Invites";

const ChannelListItem = ({
  activeServerId,
  activeChannelId,
  channel,
  userRole,
}: {
  activeServerId: number;
  activeChannelId: number | undefined;
  channel: SafeChannelType;
  userRole: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isActive =
    activeChannelId !== undefined
      ? channel.channel_id === +activeChannelId
      : false;

  const liAttributes = {
    className: isActive ? "active" : "",
  };

  const style = {
    color: isActive ? "var(--title-color)" : "var(--text-color)",
    padding: "6px 8px",
    height: 32,
    width: "100%",
    lineHeight: "20px",
  };

  return (
    <li {...liAttributes} style={{ padding: 0, height: 32 }}>
      <Link href={`/server/${activeServerId}/channel/${channel.channel_id}`}>
        <span style={style}># {channel.channel_name}</span>
        {userRole !== "user" && userRole !== "moderator" && (
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
      </Link>

      <PopUp
        type="content"
        title="Channel Settings"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <ChannelUpdateForm
          server_id={activeServerId}
          channel_id={channel.channel_id}
        />
        <hr
          style={{
            marginTop: 20,
            border: "1px solid var(--input-border-color)",
          }}
        />
        <ChannelDeleteForm
          server_id={activeServerId}
          channel_id={channel.channel_id}
        />
      </PopUp>
    </li>
  );
};

const ServerSubNavigationPanel = ({
  activeServerId,
  activeChannelId,
  isLoading,
  isServerFound,
  userRole,
  style,
}: {
  activeServerId: number;
  activeChannelId?: number;
  isLoading: boolean;
  isServerFound: boolean;
  userRole: string;
  style?: React.CSSProperties;
}) => {
  const server = useAppSelector((selector) => selector.server)[activeServerId];

  if (isLoading) {
    return (
      <section className="navigation-subpanel-container" style={style}>
        <div className="navigation-header" style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              flexGrow: 1,
              color: "var(--title-color)",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              position: "relative",
            }}
          >
            Loading...
          </span>
        </div>

        <LoadingCircle />

        <UserAvatar />
      </section>
    );
  }

  if (!isServerFound) {
    return (
      <section className="navigation-subpanel-container" style={style}>
        <div className="navigation-header" style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              flexGrow: 1,
              color: "var(--title-color)",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              position: "relative",
            }}
          >
            Server not found!
          </span>
        </div>

        <span
          className="error-background error-text"
          style={{ margin: "0 12px" }}
        >
          Server not found!
        </span>
        <div style={{ flexGrow: 1 }}></div>
        <UserAvatar />
      </section>
    );
  }

  return (
    <section className="navigation-subpanel-container" style={style}>
      <div className="navigation-header" style={{ display: "flex", gap: 8 }}>
        <span
          style={{
            flexGrow: 1,
            color: "var(--title-color)",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {server && server.server_name}
        </span>
        {userRole === "owner" && <ServerSettings server_id={activeServerId} />}
      </div>

      <nav className="navigation-panel-navigation">
        <ul className="navigation-panel-subpanel-navigation-list">
          <li
            className={`navigation-panel-subpanel-navigation-list-item ${
              false ? "active" : ""
            } `}
          >
            <a>Events</a>
          </li>
          <li
            className={`navigation-panel-subpanel-navigation-list-item ${
              false ? "active" : ""
            }`}
          >
            <Invites server_id={activeServerId} serverUsers={server.users} />
          </li>
        </ul>
      </nav>

      <div
        className="navigation-subpanel-content-container"
        style={{ flexGrow: 1 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            color: "var(--title-color)",
            alignItems: "center",
            height: 20,
          }}
        >
          <span>Channels</span>
          {userRole !== "user" && userRole !== "moderator" && (
            <ChannelCreateForm server_id={activeServerId} />
          )}
        </div>

        <ul>
          {server &&
            server.channels.map((channel) => (
              <ChannelListItem
                activeServerId={activeServerId}
                activeChannelId={activeChannelId}
                channel={channel}
                userRole={userRole}
                key={channel.channel_id}
              />
            ))}
        </ul>
      </div>

      <UserAvatar />
    </section>
  );
};

export default ServerSubNavigationPanel;
