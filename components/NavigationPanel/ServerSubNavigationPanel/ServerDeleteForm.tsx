"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";
import axios from "axios";

import { useAppSelector } from "@/lib/store/hooks";
import { ServerDetailedDataType } from "@/server/models";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import { useRouter } from "next/navigation";

type ErrorMessageObjectType = {
  server_name: string | null;
};

const errorMessageInitialState = {
  server_name: null,
};

const ServerDeleteForm = ({ server_id }: { server_id: number }) => {
  const router = useRouter();

  const server: ServerDetailedDataType = useAppSelector(
    (state) => state.server[server_id]
  );

  const currentUserName = useAppSelector((state) => state.user.user_name);

  const serverUser = server.users.find(
    (user) => user.user_name === currentUserName
  );

  if (!serverUser || serverUser.role !== "owner") return null;

  const [initial_server_name, setInitialServerName] = useState(
    server.server_name
  );
  const [server_name, setServerName] = useState("");

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

    if (server_name !== initial_server_name) {
      setStatus(false);
      setStatusMessage("Please provide server name successfully.");

      setIsLoading(false);
      return;
    }

    try {
      const request = await axios.delete(`/api/server/${server_id}`);

      if (request.status === 200) {
        setStatusMessage(request.data.message);
        setStatus(true);

        setTimeout(() => {
          router.push(`/`);
        }, 1000);
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

  const server_name_change: ChangeEventHandler<HTMLInputElement> = (event) => {
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
        <p>
          This server will be deleted, along with all of its Channels, Invites,
          Messages and Events.
        </p>
        <p>Warning: This action is not reversible. Please be certain.</p>
        <p>Enter the server name {initial_server_name} to continue:</p>
        <Form.Input
          title="Server Name"
          type="text"
          id="server_name"
          name="server_name"
          placeholder="Enter channel name"
          value={server_name}
          onChange={server_name_change}
          errorMessage={errorMessage.server_name}
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

export default ServerDeleteForm;
