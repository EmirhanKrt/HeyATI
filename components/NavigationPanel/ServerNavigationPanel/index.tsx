"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import { useAppSelector } from "@/lib/store/hooks";
import PopUp from "@/components/PopUp";
import CreateServerForm from "./CreateServerForm";

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
          tooltip.style.left = `${item.getBoundingClientRect().right + 10}px`;
          tooltip.style.top = `${item.getBoundingClientRect().top + 7.5}px`;
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
    <nav className="navigation-panel-navigation">
      <ul
        className="navigation-panel-server-navigation-list"
        ref={serverListRef}
      >
        {serverList.map((server) => {
          const isActive = Number(activeServerId) === server.server_id;

          const props = {
            className: `navigation-panel-server-navigation-list-item ${
              isActive ? "active" : ""
            }`,
          };

          const serverShortName = abbreviate(server.server_name);

          return (
            <li key={server.server_id} {...props}>
              <Link href={`/server/${server.server_id}`}>
                {serverShortName}
              </Link>
              <span className="navigation-panel-server-navigation-list-item-tooltip">
                {server.server_name}
              </span>
            </li>
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

      <PopUp
        type="content"
        title="Create server"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <CreateServerForm />
      </PopUp>
    </nav>
  );
};

export default ServerNavigationPanel;
