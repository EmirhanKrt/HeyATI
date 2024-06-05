"use client";

import NavigationPanel from "@/components/NavigationPanel";

import UserPrivateMessagePanel from "./UserPrivateMessagePanel";
import UserDetailsPanel from "./UserDetailsPanel";
import useUserDetails from "@/lib/hooks/useUserDetails";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { AppPanel } from "@/components/AppPanel";
import ServerNavigationPanel from "@/components/NavigationPanel/ServerNavigationPanel";
import { AppContentPanel } from "@/components/AppContentPanel";
import AIAssistant from "@/components/AIAssistant";

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
        backgroundColor: "var(--background-color)",
      }
    : { backgroundColor: "var(--background-color-3)" };

  return (
    <>
      <ServerNavigationPanel />
      <section className="panel-container">
        <NavigationPanel type={"user"} active_user_name={params.slug} />

        <AppContentPanel>
          <AppContentPanel.Header style={style}>
            <div>
              <UserDetailsPanel
                isUserFound={isUserFound}
                isLoading={isLoading}
                targetUser={targetUser}
              />
            </div>
          </AppContentPanel.Header>
          <AppContentPanel.Container>
            <AppPanel style={style}>
              <UserPrivateMessagePanel
                isUserFound={isUserFound}
                isLoading={isLoading}
                targetUser={targetUser}
              />
            </AppPanel>
          </AppContentPanel.Container>
        </AppContentPanel>
      </section>
      <AIAssistant />
    </>
  );
};

export default UserPrivateMessagePage;
