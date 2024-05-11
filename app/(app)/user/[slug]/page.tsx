"use client";

import NavigationPanel from "@/components/NavigationPanel";
import { DetailsPanel } from "@/components/DetailsPanel";
import { AppHeader } from "@/components/AppHeader";

import UserPrivateMessagePanel from "./UserPrivateMessagePanel";
import UserDetailsPanel from "./UserDetailsPanel";
import useUserDetails from "@/lib/hooks/useUserDetails";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { AppPanel } from "@/components/AppPanel";

const UserPrivateMessagePage = ({ params }: { params: { slug: string } }) => {
  const user_name = params.slug;

  useUserDetails(user_name);

  const [isUserFound, setIsUserFound] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const targetUser = useAppSelector(
    (state) => state.interactedUsers.users[user_name]
  );

  useEffect(() => {
    if (targetUser) {
      if (targetUser.user_id === 0) {
        setIsUserFound(false);
      }

      setIsLoading(false);
    }
  }, [targetUser]);

  const style = isLoading
    ? {
        backgroundColor: "#111",
      }
    : { backgroundColor: "var(--background-color)" };

  return (
    <>
      <AppHeader pageTitle="Private Message" />
      <section className="panel-container">
        <NavigationPanel type={"user"} active_user_name={params.slug} />

        <AppPanel style={style}>
          <UserPrivateMessagePanel
            isUserFound={isUserFound}
            isLoading={isLoading}
            targetUser={targetUser}
          />
        </AppPanel>

        <DetailsPanel style={style}>
          <UserDetailsPanel
            isUserFound={isUserFound}
            isLoading={isLoading}
            targetUser={targetUser}
          />
        </DetailsPanel>
      </section>
    </>
  );
};

export default UserPrivateMessagePage;
