"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingCircle } from "@/components/LoadingCircle";
import PopUp from "@/components/PopUp";
import {
  SafeChannelType,
  SafeEventType,
  SafeServerType,
  ServerDetailedDataType,
} from "@/server/models";
import ChannelEventDeleteForm from "./ChannelEventDeleteForm";
import ChannelEventCreateForm from "./ChannelEventCreateForm";
import { useAppSelector } from "@/lib/store/hooks";
import ChannelEventUpdateForm from "./ChannelEventUpdateForm";

const Event = ({
  server,
  channel,
  event,
  users,
}: {
  server: SafeServerType;
  channel: SafeChannelType;
  event: SafeEventType;
  users: {
    user_id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    role: string;
  }[];
}) => {
  const currentUser = useAppSelector((state) => state.user);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const owner = users.find((owner) => owner.user_id === event.owner_id);

  const currentServerUser = users.find(
    (owner) => owner.user_id === currentUser.user_id
  );

  if (!currentServerUser) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--background-color-3)",
        borderRadius: 8,
        padding: "20px",
        display: "flex",
        gap: "10px",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex" }}>
        <h4 style={{ flexGrow: 1, lineHeight: "32.5px" }}>
          Event by {owner ? "@" + owner.user_name : "unknown user"}
        </h4>
        {currentServerUser.role !== "moderator" &&
          currentServerUser.role !== "user" && (
            <>
              <div
                className="settings-icon-container"
                onClick={() => setIsUpdateOpen(true)}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 16 16"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"></path>
                  <path
                    fill-rule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                  ></path>
                </svg>
              </div>
              <PopUp
                type="content"
                title="Event"
                openState={isUpdateOpen}
                setOpenState={setIsUpdateOpen}
              >
                <ChannelEventUpdateForm
                  server_id={server.server_id}
                  channel_id={channel.channel_id}
                  event_id={event.event_id}
                />
              </PopUp>
            </>
          )}
      </div>

      <div>
        <p>Server: {server.server_name}</p>
        <p>Channel: {channel.channel_name}</p>
        <p>Title: {event.event_title}</p>
        <p>Description: {event.event_description}</p>
        <p>Event Start Date: {event.event_start_date}</p>
        <p>Event Finish Date: {event.event_finish_date}</p>
        <Link
          style={{ color: "var(--primary-color)" }}
          href={`/server/${server.server_id}/channel/${channel.channel_id}`}
        >
          Go To Event Channel
        </Link>
      </div>

      {currentServerUser.role !== "moderator" &&
        currentServerUser.role !== "user" && (
          <>
            <button
              className="primary"
              type="submit"
              onClick={() => setIsDeleteOpen(true)}
              style={{
                background: "var(--error-background-color)",
              }}
            >
              Delete
            </button>
            <PopUp
              type="content"
              title="Event"
              openState={isDeleteOpen}
              setOpenState={setIsDeleteOpen}
            >
              <ChannelEventDeleteForm
                server_id={server.server_id}
                channel_id={channel.channel_id}
                event_id={event.event_id}
              />
            </PopUp>
          </>
        )}
    </div>
  );
};

const CreateEventButton = ({ server }: { server: ServerDetailedDataType }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="primary" onClick={() => setIsOpen(true)}>
        Create Channel Event
      </button>

      <PopUp
        type="content"
        title="Event"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <ChannelEventCreateForm server={server} />
      </PopUp>
    </>
  );
};

const Events = ({ server }: { server: ServerDetailedDataType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [events, setEvents] = useState<SafeEventType[]>([]);

  useEffect(() => {
    const generateEventState = () => {
      const eventOfChannel = server.channels.flatMap((channel) =>
        channel.events.map((event) => event)
      );

      setEvents(eventOfChannel);
    };

    if (server) generateEventState();
  }, [server]);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        style={{
          color: "inherit",
          fontSize: "inherit",
          width: "100%",
          height: "100%",
          lineHeight: "42px",
        }}
      >
        Events
      </div>
      <PopUp
        type="content"
        title="Events"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: 20,
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxHeight: "40vh",
              overflow: "auto",
            }}
          >
            {events.map((event) => {
              let eventServer: null | ServerDetailedDataType = null;
              let eventChannel:
                | null
                | (SafeChannelType & {
                    events: SafeEventType[];
                    messages: any;
                  }) = null;

              server.channels.forEach((channel) => {
                const eventInSlice = channel.events.find(
                  (iEvent) => iEvent.event_id === event.event_id
                );
                if (eventInSlice) {
                  eventServer = server;
                  eventChannel = channel;
                  event = eventInSlice;
                }
              });

              if (eventServer === null || eventChannel === null) {
                return null;
              }

              const eventServerDetailedData = eventServer as SafeServerType;

              const eventChannelrDetailedData = eventChannel as SafeChannelType;

              return (
                <Event
                  server={eventServerDetailedData}
                  channel={eventChannelrDetailedData}
                  event={event}
                  key={event.event_id}
                  users={server.users}
                />
              );
            })}
          </div>

          <CreateEventButton server={server} />
        </div>
      </PopUp>
    </>
  );
};

export default Events;
