"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { ServerDetailedDataType } from "@/server/models";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import axios from "axios";
import { updateChannelEvent } from "@/lib/store/features/server/serverSlice";

type ErrorMessageObjectType = {
  event_title: string | null;
  event_description: string | null;
};

const errorMessageInitialState = {
  event_title: null,
  event_description: null,
};

const ChannelEventUpdateForm = ({
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

  const eventState = channel?.events.find(
    (eventIteration) => eventIteration.event_id === event_id
  );

  const [event_title, setEventTitle] = useState(eventState?.event_title || "");
  const [event_description, setEventDescription] = useState(
    eventState?.event_description || ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessageObjectType>(
    errorMessageInitialState
  );

  const [status, setStatus] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  if (!eventState) return null;

  const handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(Object.assign({}, errorMessageInitialState));
    setStatus(null);
    setStatusMessage("");

    let updatePayload: any = {};

    if (event_title !== eventState.event_title)
      updatePayload.event_title = event_title;
    if (event_description !== eventState.event_description)
      updatePayload.event_description = event_description;

    if (Object.keys(updatePayload).length === 0) {
      setStatus(false);
      setStatusMessage("No updates provided.");

      setIsLoading(false);
      return;
    }

    try {
      const request = await axios.put(
        `/api/server/${server_id}/channel/${channel_id}/event/${event_id}`,
        {
          ...updatePayload,
        }
      );

      if (request.status === 200) {
        setStatusMessage(request.data.message);
        setStatus(true);

        dispatch(
          updateChannelEvent({
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
    setEventTitle(event.target.value);
    setErrorMessage((err) => ({ ...err, event_title: null }));
  };

  const event_description_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setEventDescription(event.target.value);
    setErrorMessage((err) => ({ ...err, event_description: null }));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{ padding: "20px 0", paddingBottom: 0 }}
    >
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <Form.Input
          title="Event Title"
          type="text"
          id="event_title"
          name="event_title"
          placeholder="Enter new title"
          value={event_title}
          onChange={event_title_change}
          errorMessage={errorMessage.event_title}
        />

        <Form.Input
          title="Event Description"
          type="text"
          id="event_description"
          name="event_description"
          placeholder="Enter new description"
          value={event_description}
          onChange={event_description_change}
          errorMessage={errorMessage.event_description}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </Form.Body>
    </Form>
  );
};

export default ChannelEventUpdateForm;
