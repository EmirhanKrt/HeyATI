"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.global.css";
import PopUp from "../PopUp";
import {
  ChannelMessageSuccessResponseBodyDataType,
  SafeChannelType,
  SafeEventType,
  ServerDetailedDataType,
} from "@/server/models";
import Link from "next/link";

type BigCalendarEventType = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description: string;
};

const localizer = momentLocalizer(moment);

const DashboardCalendar = () => {
  const serverList = useAppSelector((state) => state.server);

  const [eventState, setEventState] = useState<BigCalendarEventType[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState<BigCalendarEventType | null>(null);

  useEffect(() => {
    const generateEventState = () => {
      const events: BigCalendarEventType[] = [];

      Object.entries(serverList).forEach(([server_id, server]) => {
        const eventOfChannel = server.channels.flatMap((channel) =>
          channel.events.map(
            (event): BigCalendarEventType => ({
              id: event.event_id,
              title: event.event_title,
              start: new Date(event.event_start_date),
              end: new Date(event.event_finish_date),
              description: event.event_description,
            })
          )
        );

        events.push(...eventOfChannel);
      });

      setEventState(events);
    };

    if (serverList) generateEventState();
  }, [serverList]);

  const handleEventClick = (event: BigCalendarEventType) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  return (
    <div style={{ padding: 12 }}>
      <Calendar
        localizer={localizer}
        events={eventState}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleEventClick}
      />

      <PopUp
        type="content"
        title="Event Details"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        {selectedEvent &&
          (() => {
            let eventServer: null | ServerDetailedDataType = null;
            let eventChannel:
              | null
              | (SafeChannelType & { events: SafeEventType[]; messages: any }) =
              null;
            let event: null | SafeEventType = null;

            Object.entries(serverList).map(([server_id, server]) => {
              server.channels.forEach((channel) => {
                const eventInSlice = channel.events.find(
                  (event) => event.event_id === selectedEvent.id
                );
                if (eventInSlice) {
                  eventServer = server;
                  eventChannel = channel;
                  event = eventInSlice;
                }
              });
            });

            if (
              eventServer === null ||
              event === null ||
              eventChannel === null
            ) {
              return null;
            }

            const eventServerDetailedData =
              eventServer as ServerDetailedDataType;

            const eventChannelrDetailedData =
              eventChannel as SafeChannelType & {
                events: SafeEventType[];
                messages: any;
              };

            const eventDetailedData = event as SafeEventType;
            return (
              <div
                style={{
                  backgroundColor: "var(--background-color-3)",
                  borderRadius: 8,
                  padding: "20px",
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                  marginTop: 20,
                }}
              >
                <h4>Event</h4>
                <div>
                  <p>Server: {eventServerDetailedData.server_name}</p>
                  <p>Channel: {eventChannelrDetailedData.channel_name}</p>
                  <p>Title: {eventDetailedData.event_title}</p>
                  <p>Description: {eventDetailedData.event_description}</p>
                  <p>Event Start Date: {eventDetailedData.event_start_date}</p>
                  <p>
                    Event Finish Date: {eventDetailedData.event_finish_date}
                  </p>
                  <Link
                    style={{ color: "var(--primary-color)" }}
                    href={`/server/${eventServerDetailedData.server_id}/channel/${eventChannelrDetailedData.channel_id}`}
                  >
                    Go To Event Channel
                  </Link>
                </div>
              </div>
            );
          })()}
      </PopUp>
    </div>
  );
};

export default DashboardCalendar;
