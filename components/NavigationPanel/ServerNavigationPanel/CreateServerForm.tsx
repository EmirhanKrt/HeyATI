"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { useAppDispatch } from "@/lib/store/hooks";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import { addServer } from "@/lib/store/features/server/serverSlice";
import { useRouter } from "next/navigation";

type ErrorMessageObjectType = {
  server_name: string | null;
  server_description: string | null;
};

const errorMessageInitialState = {
  server_name: null,
  server_description: null,
};

const CreateServerForm = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [server_name, setServerName] = useState("");
  const [server_description, setServerDescription] = useState("");

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

    const { error, data } = await api.server.post({
      server_name,
      server_description,
    });

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

      setTimeout(() => {
        router.push(`/server/${data.data.server.server_id}`);
      }, 1000);
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
    <Form onSubmit={handleSubmit} style={{ padding: "20px 0 0 0" }}>
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <Form.Input
          title="Server Name"
          type="text"
          id="server_name"
          name="server_name"
          placeholder="Enter new server's name"
          value={server_name}
          onChange={server_name_change}
          errorMessage={errorMessage.server_name}
        />
        <Form.Input
          title="Server Description"
          type="textarea"
          id="server_description"
          name="server_description"
          placeholder="Enter new server's description"
          value={server_description}
          required={false}
          onChange={server_description_change}
          errorMessage={errorMessage.server_description}
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

export default CreateServerForm;
