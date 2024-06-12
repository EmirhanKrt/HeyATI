"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";
import axios from "axios";

import Form from "@/components/Form";
import { ServerDetailedDataType } from "@/server/models";
import { useAppDispatch } from "@/lib/store/hooks";
import { postChannelEvent } from "@/lib/store/features/server/serverSlice";

type ErrorMessageObjectType = {
  event_title: string | null;
  event_description: string | null;
  event_start_date: string | null;
  event_finish_date: string | null;
};

const errorMessageInitialState = {
  event_title: null,
  event_description: null,
  event_start_date: null,
  event_finish_date: null,
};

const formatDateTime = (dateTime: string) => {
  const dateObj = new Date(dateTime);
  return dateObj.toISOString().replace("T", " ").replace("Z", "");
};

const ChannelEventCreateForm = ({
  server,
}: {
  server: ServerDetailedDataType;
}) => {
  const dispatch = useAppDispatch();

  const [event_title, setEventTitle] = useState("");
  const [event_description, setEventDescription] = useState("");
  const [event_start_date, setEventStartDate] = useState("");
  const [event_finish_date, setEventFinishDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessageObjectType>(
    errorMessageInitialState
  );

  const [status, setStatus] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(Object.assign({}, errorMessageInitialState));
    setStatus(null);
    setStatusMessage("");

    const selectElement = document.querySelector("select");

    if (!selectElement || !selectElement.value) {
      setStatus(false);
      setStatusMessage("You need to select channel");

      setIsLoading(false);
      return;
    }

    try {
      const request = await axios.post(
        `/api/server/${server.server_id}/channel/${selectElement.value}/event`,
        {
          event_title,
          event_description,
          event_start_date,
          event_finish_date,
        }
      );

      if (request.status === 200) {
        setStatusMessage(request.data.message);
        setStatus(true);

        const newEvent = request.data.data.event;

        dispatch(
          postChannelEvent({
            server_id: server.server_id,
            channel_id: newEvent.channel_id,
            event: newEvent,
          })
        );
      }
    } catch (error) {
      const { message } = (error as any).response.data;

      setStatus(false);
      setStatusMessage(message);
    }

    setIsLoading(false);
  };

  const event_title_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEventTitle(event.target.value);
    setErrorMessage((err) => ({ ...err, event_title: null }));
  };

  const event_description_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setEventDescription(event.target.value);
    setErrorMessage((err) => ({ ...err, event_description: null }));
  };

  const event_start_date_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const selectedDateTime = event.target.value;
    const formattedDateTime = formatDateTime(selectedDateTime);
    setEventStartDate(formattedDateTime);
    setErrorMessage((err) => ({ ...err, event_start_date: null }));
  };

  const event_finish_date_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const selectedDateTime = event.target.value;
    const formattedDateTime = formatDateTime(selectedDateTime);
    setEventFinishDate(formattedDateTime);
    setErrorMessage((err) => ({ ...err, event_finish_date: null }));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{ padding: "20px 0", paddingBottom: 0 }}
    >
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <select>
          {server.channels.map((channel) => {
            return (
              <option value={channel.channel_id} key={channel.channel_id}>
                {channel.channel_name}
              </option>
            );
          })}
        </select>
        
        <Form.Input
          title="Event Title"
          type="text"
          id="event_title"
          name="event_title"
          placeholder="Enter new event title"
          value={event_title}
          onChange={event_title_change}
          errorMessage={errorMessage.event_title}
        />

        <Form.Input
          title="Event Description"
          type="text"
          id="event_description"
          name="event_description"
          placeholder="Enter new event title"
          value={event_description}
          onChange={event_description_change}
          errorMessage={errorMessage.event_description}
        />

        <Form.Input
          title="Event Start Date"
          type="datetime-local"
          id="event_start_date"
          name="event_start_date"
          placeholder="Select event start date"
          value={event_start_date}
          onChange={event_start_date_change}
          errorMessage={errorMessage.event_start_date}
        />

        <Form.Input
          title="Event Finish Date"
          type="datetime-local"
          id="event_finish_date"
          name="event_finish_date"
          placeholder="Select event finish date"
          value={event_finish_date}
          onChange={event_finish_date_change}
          errorMessage={errorMessage.event_finish_date}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </Form.Body>
    </Form>
  );
};

export default ChannelEventCreateForm;
