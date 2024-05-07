"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";

import PopUp from "@/components/PopUp";
import UserMeUpdateForm from "./UserMeUpdateForm";
import LogOutButton from "@/components/LogOutButton";

const UserAvatar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const user = useAppSelector((state) => state.user);

  const userFirstNameAndLastNameFirstCharacterMerged =
    user.first_name[0].toUpperCase() + user.last_name[0].toUpperCase();

  return (
    <div
      style={{
        margin: "0 10px",
        padding: "10px 0",
        borderTop: "1px solid var(--light-background-color)",
      }}
    >
      <button
        className="navigation-panel-server-navigation-list-item"
        onClick={() => setIsOpen(true)}
      >
        {userFirstNameAndLastNameFirstCharacterMerged}
      </button>

      <PopUp title="User Settings" openState={isOpen} setOpenState={setIsOpen}>
        <UserMeUpdateForm />
        <div
          style={{
            backgroundColor: "var(--background-color)",
            borderRadius: 8,
            padding: "20px",
            display: "flex",
            gap: "10px",
            flexDirection: "column",
          }}
        >
          <h4>Log Out</h4>
          <p>
            After clicking the log out button, you will be redirected to login
            page.
          </p>
          <LogOutButton />
        </div>
      </PopUp>
    </div>
  );
};

export default UserAvatar;
