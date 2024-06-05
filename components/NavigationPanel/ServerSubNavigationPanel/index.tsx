"use client";

import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { LoadingCircle } from "@/components/LoadingCircle";
import UserAvatar from "../ServerNavigationPanel/UserAvatar";
import ServerSettings from "./ServerSettings";

const ServerSubNavigationPanel = ({
  activeServerId,
  activeChannelId,
  isLoading,
  isServerFound,
  style,
}: {
  activeServerId: number;
  activeChannelId?: number;
  isLoading: boolean;
  isServerFound: boolean;
  style?: React.CSSProperties;
}) => {
  const server = useAppSelector((selector) => selector.server)[activeServerId];

  if (isLoading) {
    return <LoadingCircle />;
  }

  if (!isServerFound) {
    return (
      <span
        className="error-background error-text"
        style={{ padding: 12, margin: 8 }}
      >
        Server not found!
      </span>
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
          {server.server_name}
        </span>
        <ServerSettings server_id={activeServerId} />
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
            <a>Invites</a>
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
          }}
        >
          <span>Channels</span>
          <button
            style={{
              borderRadius: 0,
              padding: "0 4px",
              border: "1px solid var(--button-border-color)",
              width: 28,
              height: 20,
              lineHeight: "20px",
            }}
          >
            +
          </button>
        </div>

        <ul>
          {server &&
            server.channels.map((channel) => {
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
                <li
                  key={channel.channel_id}
                  {...liAttributes}
                  style={{ padding: 0, height: 32 }}
                >
                  <Link
                    href={`/server/${activeServerId}/channel/${channel.channel_id}`}
                  >
                    <span style={style}># {channel.channel_name}</span>
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

export default ServerSubNavigationPanel;
