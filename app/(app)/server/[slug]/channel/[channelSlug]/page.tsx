"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";

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

const ChannelPage = ({
  params,
}: {
  params: { slug: number; channelSlug: number };
}) => {
  const server_id = params.slug;

  useServerDetails(server_id);

  const [isServerFound, setIsServerFound] = useState(true);
  const [isChannelFound, setIsChannelFound] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [targetChannel, setTargetChannel] = useState<
    | (SafeChannelType & {
        events: SafeEventType[];
        messages: Record<string, ChannelMessageSuccessResponseBodyDataType[]>;
      })
    | null
  >(null);

  const targetServer = useAppSelector((state) => state.server);

  useEffect(() => {
    if (targetServer[server_id]) {
      if (targetServer[server_id].owner_id === 0) {
        setIsServerFound(false);
      }

      const targetChannelIndex = targetServer[server_id].channels.findIndex(
        (channel) => channel.channel_id === +params.channelSlug
      );

      if (targetChannelIndex === -1) {
        setIsChannelFound(false);
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
      <ServerNavigationPanel activeServerId={params.slug} />
      <section className="panel-container">
        <NavigationPanel
          type={"channel"}
          activeServerId={params.slug}
          activeChannelId={params.channelSlug}
          isLoading={isLoading}
          isServerFound={isServerFound}
        />

        <AppContentPanel>
          <AppContentPanel.Header style={style}>
            {targetChannel ? targetChannel.channel_name : "Loading..."}
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
