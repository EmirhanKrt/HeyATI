"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { ServerDetailedDataType } from "@/server/models";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import { addServer } from "@/lib/store/features/server/serverSlice";

type ErrorMessageObjectType = {
  server_name: string | null;
  server_description: string | null;
  owner_id: string | null;
};

const errorMessageInitialState = {
  server_name: null,
  server_description: null,
  owner_id: null,
};

const ServerUpdateForm = ({ server_id }: { server_id: number }) => {
  const dispatch = useAppDispatch();

  const server: ServerDetailedDataType = useAppSelector(
    (state) => state.server[server_id]
  );

  const [server_name, setServerName] = useState(server.server_name);
  const [server_description, setServerDescription] = useState(
    server.server_description
  );

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

    let updatePayload: any = {};

    if (server_name !== server.server_name)
      updatePayload.server_name = server_name;
    if (server_description !== server.server_description)
      updatePayload.server_description = server_description;

    if (Object.keys(updatePayload).length === 0) {
      setStatus(false);
      setStatusMessage("No updates provided.");

      setIsLoading(false);
      return;
    }

    const { error, data } = await api.server({ server_id }).put(updatePayload);

    if (error) {
      if (error.status === 400) {
        const {
          data: { body: errorData },
          message,
        } = error.value as any;

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
    } else {
      setStatusMessage(data.message);
      setStatus(true);

      dispatch(addServer(data.data.server));
    }

    setIsLoading(false);
  };

  const server_name_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    setServerName(event.target.value);
    setErrorMessage((err) => ({ ...err, server_name: null }));
  };

  const server_description_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setServerDescription(event.target.value);
    setErrorMessage((err) => ({ ...err, server_description: null }));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{ padding: "20px 0", paddingBottom: 0 }}
    >
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <Form.Input
          title="Server Name"
          type="text"
          id="server_name"
          name="server_name"
          placeholder="Enter new name"
          value={server_name}
          onChange={server_name_change}
          errorMessage={errorMessage.server_name}
        />
        <Form.Input
          title="Server Description"
          type="text"
          id="server_description"
          name="server_description"
          placeholder="Enter new description"
          value={server_description}
          onChange={server_description_change}
          errorMessage={errorMessage.server_description}
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

export default ServerUpdateForm;
