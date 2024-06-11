"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { ServerDetailedDataType } from "@/server/models";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import { deleteChannel } from "@/lib/store/features/server/serverSlice";
import axios from "axios";

type ErrorMessageObjectType = {
  channel_name: string | null;
};

const errorMessageInitialState = {
  channel_name: null,
};

const ChannelDeleteForm = ({
  server_id,
  channel_id,
}: {
  server_id: number;
  channel_id: number;
}) => {
  const dispatch = useAppDispatch();

  const server: ServerDetailedDataType = useAppSelector(
    (state) => state.server[server_id]
  );

  const channel = server.channels.find(
    (channelIteration) => channelIteration.channel_id === channel_id
  );

  const [initial_channel_name, setInitialChannelName] = useState(
    channel!.channel_name
  );
  const [channel_name, setServerName] = useState("");

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

    if (channel_name !== initial_channel_name) {
      setStatus(false);
      setStatusMessage("Please provide channel name successfully.");

      setIsLoading(false);
      return;
    }

    try {
      const request = await axios.delete(
        `/api/server/${server_id}/channel/${channel_id}`
      );

      if (request.status === 200) {
        setStatusMessage(request.data.message);
        setStatus(true);

        dispatch(
          deleteChannel({
            server_id: server_id,
            channel: request.data.data.channel,
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

  const channel_name_change: ChangeEventHandler<HTMLInputElement> = (event) => {
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
        <p>
          This channel will be deleted, along with all of its Messages and
          Events.
        </p>
        <p>Warning: This action is not reversible. Please be certain.</p>
        <p>Enter the channel name {initial_channel_name} to continue:</p>
        <Form.Input
          title="Channel Name"
          type="text"
          id="channel_name"
          name="channel_name"
          placeholder="Enter channel name"
          value={channel_name}
          onChange={channel_name_change}
          errorMessage={errorMessage.channel_name}
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

export default ChannelDeleteForm;
