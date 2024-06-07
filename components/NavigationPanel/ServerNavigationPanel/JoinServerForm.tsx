"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { useAppDispatch } from "@/lib/store/hooks";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import { addServer } from "@/lib/store/features/server/serverSlice";
import { useRouter } from "next/navigation";

type ErrorMessageObjectType = {
  server_invite_code: string | null;
};

const errorMessageInitialState = {
  server_invite_code: null,
};

const JoinServerForm = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [server_invite_code, setServerInviteCode] = useState("");

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

    const { error, data } = await api.server.join.post({
      server_invite_code,
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

  const server_invite_code_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setServerInviteCode(event.target.value);
    setErrorMessage((err) => ({ ...err, server_invite_code: null }));
  };

  return (
    <Form onSubmit={handleSubmit} style={{ padding: "20px 0 0 0" }}>
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <Form.Input
          title="Server Invite Code"
          type="text"
          id="server_invite_code"
          name="server_invite_code"
          placeholder="Enter server invite code"
          value={server_invite_code}
          onChange={server_invite_code_change}
          errorMessage={errorMessage.server_invite_code}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join"}
          </button>
        </div>
      </Form.Body>
    </Form>
  );
};

export default JoinServerForm;
