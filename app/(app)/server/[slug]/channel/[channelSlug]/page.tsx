"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

import NavigationPanel from "@/components/NavigationPanel";

import { AppPanel } from "@/components/AppPanel";
import { DetailsPanel } from "@/components/DetailsPanel";

import useServerDetails from "@/lib/hooks/useServerDetails";
import ServerUserDetailPanel from "../../ServerUserDetailPanel";
import ServerNavigationPanel from "@/components/NavigationPanel/ServerNavigationPanel";
import { AppContentPanel } from "@/components/AppContentPanel";
import {
  ChannelMessageSuccessResponseBodyDataType,
  SafeChannelType,
  SafeEventType,
} from "@/server/models";
import ChannelPrivateMessagePanel from "./ChannelPrivateMessagePanel";
import { LoadingCircle } from "@/components/LoadingCircle";
import ToggleDetailsPanelButton from "@/components/ToggleDetailsPanelButton";
import { requestedCreateChannelCall } from "@/lib/store/features/videoChat/videoChatSlice";

type TargetChannelStateType =
  | (SafeChannelType & {
      events: SafeEventType[];
      messages: Record<string, ChannelMessageSuccessResponseBodyDataType[]>;
    })
  | null;

const ChannelPage = ({
  params,
}: {
  params: { slug: number; channelSlug: number };
}) => {
  const server_id = params.slug;
  const channel_id = params.channelSlug;

  useServerDetails(server_id);

  const [isServerFound, setIsServerFound] = useState(true);
  const [isChannelFound, setIsChannelFound] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [targetChannel, setTargetChannel] =
    useState<TargetChannelStateType>(null);
  const [userRole, setUserRole] = useState<string>("");

  const targetServer = useAppSelector((state) => state.server);

  const currentUserName = useAppSelector((state) => state.user.user_name);

  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(
      requestedCreateChannelCall({
        server_id,
        channel_id,
        channel_name: targetChannel?.channel_name || "",
      })
    );
  };

  useEffect(() => {
    if (targetServer[server_id]) {
      if (targetServer[server_id].owner_id === 0) {
        setIsServerFound(false);
        setUserRole("");
      }

      console.log(targetServer[server_id].channels);

      const targetChannelIndex = targetServer[server_id].channels.findIndex(
        (channel) => channel.channel_id === +channel_id
      );

      if (targetChannelIndex === -1) {
        setIsChannelFound(false);
      }

      const currentServerUser = targetServer[server_id].users.find(
        (user) => user.user_name === currentUserName
      );

      if (currentServerUser) {
        setUserRole(currentServerUser.role);
      } else {
        setUserRole("");
      }

      setTargetChannel(targetServer[server_id].channels[targetChannelIndex]);
      setIsChannelFound(true);
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
      <ServerNavigationPanel activeServerId={server_id} />
      <section className="panel-container">
        <NavigationPanel
          type={"channel"}
          activeServerId={server_id}
          activeChannelId={channel_id}
          isLoading={isLoading}
          isServerFound={isServerFound}
          userRole={userRole}
        />

        <AppContentPanel>
          <AppContentPanel.Header
            style={{ ...style, display: "flex", alignItems: "center", gap: 16 }}
          >
            <span style={{ flexGrow: 1 }}>
              {targetChannel ? targetChannel.channel_name : "Loading..."}
            </span>
            <button
              className="primary"
              onClick={onClick}
              style={{ width: "auto", height: 32, padding: "0 8px" }}
            >
              Call
            </button>
            <ToggleDetailsPanelButton />
          </AppContentPanel.Header>
          <AppContentPanel.Container>
            <AppPanel style={style}>
              {isLoading ? (
                <LoadingCircle />
              ) : targetChannel ? (
                <ChannelPrivateMessagePanel
                  isChannelFound={isChannelFound}
                  targetChannel={targetChannel}
                  users={targetServer[server_id].users}
                />
              ) : (
                <></>
              )}
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

export default ChannelPage;
