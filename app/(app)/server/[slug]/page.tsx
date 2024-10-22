"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";

import NavigationPanel from "@/components/NavigationPanel";

import { AppPanel } from "@/components/AppPanel";
import { DetailsPanel } from "@/components/DetailsPanel";

import useServerDetails from "@/lib/hooks/useServerDetails";
import ServerUserDetailPanel from "./ServerUserDetailPanel";
import ServerHomeAppPanel from "./ServerHomeAppPanel";
import ServerNavigationPanel from "@/components/NavigationPanel/ServerNavigationPanel";
import { AppContentPanel } from "@/components/AppContentPanel";
import ToggleDetailsPanelButton from "@/components/ToggleDetailsPanelButton";

const ServerPage = ({ params }: { params: { slug: number } }) => {
  const server_id = params.slug;

  useServerDetails(server_id);

  const [isServerFound, setIsServerFound] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

  const targetServer = useAppSelector((state) => state.server);

  const currentUserName = useAppSelector((state) => state.user.user_name);

  useEffect(() => {
    if (targetServer[server_id]) {
      if (targetServer[server_id].owner_id === 0) {
        setIsServerFound(false);
        setUserRole("");
      }

      const currentServerUser = targetServer[server_id].users.find(
        (user) => user.user_name === currentUserName
      );

      if (currentServerUser) {
        setUserRole(currentServerUser.role);
      } else {
        setUserRole("");
      }

      setIsLoading(false);
    }
  }, [targetServer]);

  const style = isLoading
    ? {
        backgroundColor: "var(--background-color)",
      }
    : { backgroundColor: "var(--background-color-3)" };

  return (
    <>
      <ServerNavigationPanel activeServerId={params.slug} />
      <section className="panel-container">
        <NavigationPanel
          type={"server"}
          activeServerId={params.slug}
          isLoading={isLoading}
          isServerFound={isServerFound}
          userRole={userRole}
        />

        <AppContentPanel>
          <AppContentPanel.Header
            style={{ ...style, display: "flex", alignItems: "center", gap: 16 }}
          >
            <span style={{ flexGrow: 1 }}>Server Dashboard</span>
            <ToggleDetailsPanelButton />
          </AppContentPanel.Header>
          <AppContentPanel.Container>
            <AppPanel style={style}>
              <ServerHomeAppPanel
                isLoading={isLoading}
                isServerFound={isServerFound}
                targetServer={targetServer[server_id]}
              />
            </AppPanel>
            <DetailsPanel
              style={
                isLoading
                  ? {
                      backgroundColor: "var(--background-color)",
                    }
                  : { backgroundColor: "var(--background-color-2)" }
              }
            >
              <ServerUserDetailPanel
                isLoading={isLoading}
                isServerFound={isServerFound}
                targetServer={targetServer[server_id]}
              />
            </DetailsPanel>
          </AppContentPanel.Container>
        </AppContentPanel>
      </section>
    </>
  );
};

export default ServerPage;
