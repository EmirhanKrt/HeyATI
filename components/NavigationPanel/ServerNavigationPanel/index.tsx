"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import PopUp from "@/components/PopUp";
import CreateServerForm from "./CreateServerForm";
import JoinServerForm from "./JoinServerForm";

const abbreviate = (server_name: string) => {
  if (server_name.length <= 5) {
    return server_name;
  }

  const words = server_name.split(" ");

  if (words.length === 1) {
    return server_name.substring(0, 5);
  }

  let abbreviation = words.map((word) => word[0]).join("");

  if (abbreviation.length < 5 && words[0].length >= 5) {
    abbreviation += words[0].substring(1, 5 - abbreviation.length + 1);
  }

  if (abbreviation.length > 5) {
    abbreviation = abbreviation.substring(0, 5);
  }

  return abbreviation;
};

const dividerStyle = {
  height: 2,
  minHeight: 2,
  width: 32,
  borderRadius: 1,
  backgroundColor: "var(--background-color-3)",
};

const ServerNavigationPanel = ({
  activeServerId,
}: {
  activeServerId?: number;
}) => {
  const serverListRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const serverList = useAppSelector((selector) => selector.server);

  useEffect(() => {
    if (!serverListRef.current) return;

    const listItems = serverListRef.current.querySelectorAll("li");
    const handlers: {
      item: HTMLLIElement;
      tooltip: HTMLSpanElement;
      handleMouseEnter: () => void;
      handleMouseLeave: () => void;
    }[] = [];

    listItems.forEach((item) => {
      const tooltip = item.querySelector("span");

      if (!tooltip) return;

      const handleMouseEnter = () => {
        if (tooltip) {
          document.body.appendChild(tooltip);
          tooltip.style.display = "block";
          tooltip.style.left = `${item.getBoundingClientRect().right + 8}px`;
          tooltip.style.top = `${item.getBoundingClientRect().top + 10}px`;
        }
      };

      const handleMouseLeave = () => {
        if (tooltip) {
          item.appendChild(tooltip);
          tooltip.style.display = "none";
        }
      };

      item.addEventListener("mouseenter", handleMouseEnter);
      item.addEventListener("mouseleave", handleMouseLeave);

      handlers.push({ item, tooltip, handleMouseEnter, handleMouseLeave });
    });

    return () => {
      handlers.forEach(
        ({ item, tooltip, handleMouseEnter, handleMouseLeave }) => {
          item.removeEventListener("mouseenter", handleMouseEnter);
          item.removeEventListener("mouseleave", handleMouseLeave);

          if (tooltip?.parentNode === document.body) {
            item.appendChild(tooltip);
            tooltip.style.display = "none";
          }
        }
      );
    };
  }, []);

  return (
    <nav className="server-panel-navigation">
      <li
        className={`navigation-panel-server-navigation-list-item ${
          activeServerId ? "" : "active"
        }`}
      >
        <Link href={`/`}>
          <svg
            stroke="currentColor"
            fill="currentColor"
            viewBox="0 0 20 20"
            height="24px"
            width="24px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z"
              clipRule="evenodd"
            ></path>
          </svg>
        </Link>
      </li>

      <div style={dividerStyle}></div>

      <ul
        className="navigation-panel-server-navigation-list"
        style={{ flexGrow: 1 }}
        ref={serverListRef}
      >
        {Object.values(serverList).map((server) => {
          if (!server.owner_id) return null;

          const isActive = Number(activeServerId) === server.server_id;

          const props = {
            className: `navigation-panel-server-navigation-list-item ${
              isActive ? "active" : ""
            }`,
          };

          const serverShortName = abbreviate(server.server_name);

          return (
            <li key={server.server_id} {...props}>
              <Link
                href={`/server/${server.server_id}`}
                style={{ fontSize: 20 - serverShortName.length }}
              >
                {serverShortName}
              </Link>
              <span className="navigation-panel-server-navigation-list-item-tooltip">
                {server.server_name}
              </span>
            </li>
          );
        })}
      </ul>

      <div
        style={{
          ...dividerStyle,
          height: 2.1,
        }}
      ></div>

      <li
        className={
          "navigation-panel-server-navigation-list-item add-server-button "
        }
        onClick={() => setIsOpen(true)}
      >
        <a style={{ fontSize: 24 }}>+</a>
      </li>

      <PopUp
        type="content"
        title="Create or Join server"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <CreateServerForm />
        <hr
          style={{
            marginTop: 20,
            border: "1px solid var(--input-border-color)",
          }}
        />
        <JoinServerForm />
      </PopUp>
    </nav>
  );
};

export default ServerNavigationPanel;
