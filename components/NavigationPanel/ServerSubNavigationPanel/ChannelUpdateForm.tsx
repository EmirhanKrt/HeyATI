"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { ServerDetailedDataType } from "@/server/models";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";

type ErrorMessageObjectType = {
  channel_name: string | null;
  channel_description: string | null;
};

const errorMessageInitialState = {
  channel_name: null,
  channel_description: null,
};

const ChannelUpdateForm = ({
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

  const [channel_name, setServerName] = useState(channel!.channel_name);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessageObjectType>(
    errorMessageInitialState
  );

  const [status, setStatus] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // will be updated
  const handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(Object.assign({}, errorMessageInitialState));
    setStatus(null);
    setStatusMessage("");

    let updatePayload: any = {};

    if (channel_name !== channel!.channel_name)
      updatePayload.channel_name = channel_name;

    if (Object.keys(updatePayload).length === 0) {
      setStatus(false);
      setStatusMessage("No updates provided.");

      setIsLoading(false);
      return;
    }

    fetch(`/api/server/${server_id}/channel/${channel_id}`, {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(JSON.stringify(errorData));
          });
        }

        return response.json();
      })
      .then((responseJson) => {
        setStatusMessage(responseJson.message);
        setStatus(true);
      })
      .catch((error) => {
        const {
          data: { body: errorData },
          message,
        } = JSON.parse(error as string) as any;

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
      });

    setIsLoading(false);
  };

  const channel_name_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    setServerName(event.target.value);
    setErrorMessage((err) => ({ ...err, first_name: null }));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{ padding: "20px 0", paddingBottom: 0 }}
    >
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <Form.Input
          title="Channel Name"
          type="text"
          id="channel_name"
          name="channel_name"
          placeholder="Enter new channel name"
          value={channel_name}
          onChange={channel_name_change}
          errorMessage={errorMessage.channel_name}
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

export default ChannelUpdateForm;
