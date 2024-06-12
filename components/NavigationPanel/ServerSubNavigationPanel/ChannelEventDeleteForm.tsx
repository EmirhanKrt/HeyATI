"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { ServerDetailedDataType } from "@/server/models";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import axios from "axios";
import { deleteChannelEvent } from "@/lib/store/features/server/serverSlice";

type ErrorMessageObjectType = {
  event_title: string | null;
};

const errorMessageInitialState = {
  event_title: null,
};

const ChannelEventDeleteForm = ({
  server_id,
  channel_id,
  event_id,
}: {
  server_id: number;
  channel_id: number;
  event_id: number;
}) => {
  const dispatch = useAppDispatch();

  const server: ServerDetailedDataType = useAppSelector(
    (state) => state.server[server_id]
  );

  const channel = server.channels.find(
    (channelIteration) => channelIteration.channel_id === channel_id
  );

  const event = channel?.events.find(
    (eventIteration) => eventIteration.event_id === event_id
  );

  const [initial_event_title, setInitialEventTitle] = useState(
    event!.event_title
  );
  const [event_title, setServerName] = useState("");

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

    if (event_title !== initial_event_title) {
      setStatus(false);
      setStatusMessage("Please provide event title successfully.");

      setIsLoading(false);
      return;
    }

    try {
      const request = await axios.delete(
        `/api/server/${server_id}/channel/${channel_id}/event/${event_id}`
      );

      if (request.status === 200) {
        setStatusMessage(request.data.message);
        setStatus(true);

        dispatch(
          deleteChannelEvent({
            server_id,
            channel_id,
            event: request.data.data.event,
          })
        );
      }
    } catch (error) {
      const {
        data: { body: errorData },
        message,
      } = (error as any).response.data;

      setStatus(false);
      setStatusMessage(message);

      const tempErrorMessage: ErrorMessageObjectType = Object.assign(
        {},
        errorMessageInitialState
      );

      errorData.forEach((error: ValidationErrorData) => {
        tempErrorMessage[error.field as keyof ErrorMessageObjectType] =
          error.message;
      });

      setErrorMessage(tempErrorMessage);
    }

    setIsLoading(false);
  };

  const event_title_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    setServerName(event.target.value);
    setErrorMessage((err) => ({ ...err, channel_name: null }));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{ padding: "20px 0", paddingBottom: 0 }}
    >
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <p>This event will be deleted.</p>
        <p>Warning: This action is not reversible. Please be certain.</p>
        <p>Enter the event title {initial_event_title} to continue:</p>
        <Form.Input
          title="Event Title"
          type="text"
          id="event_title"
          name="event_title"
          placeholder="Enter event title"
          value={event_title}
          onChange={event_title_change}
          errorMessage={errorMessage.event_title}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            className="primary"
            type="submit"
            disabled={isLoading}
            style={{
              background: "var(--error-background-color)",
            }}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Form.Body>
    </Form>
  );
};

export default ChannelEventDeleteForm;
