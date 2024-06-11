"use client";

import { useState } from "react";

import PopUp from "@/components/PopUp";
import ServerUpdateForm from "./ServerUpdateForm";
import ServerDeleteForm from "./ServerDeleteForm";

const ServerSettings = ({ server_id }: { server_id: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="settings-icon-container" onClick={() => setIsOpen(true)}>
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

      <PopUp
        type="content"
        title="Server Settings"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <ServerUpdateForm server_id={server_id} />
        <hr
          style={{
            marginTop: 20,
            border: "1px solid var(--input-border-color)",
          }}
        />
        <ServerDeleteForm server_id={server_id} />
      </PopUp>
    </>
  );
};

export default ServerSettings;
