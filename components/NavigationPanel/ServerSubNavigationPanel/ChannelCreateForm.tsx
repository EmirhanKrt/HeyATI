"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { useAppDispatch } from "@/lib/store/hooks";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import { addChannel } from "@/lib/store/features/server/serverSlice";
import axios from "axios";
import PopUp from "@/components/PopUp";

type ErrorMessageObjectType = {
  channel_name: string | null;
};

const errorMessageInitialState = {
  channel_name: null,
};

const ChannelCreateForm = ({ server_id }: { server_id: number }) => {
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);
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

    try {
      const request = await axios.post(`/api/server/${server_id}/channel`, {
        channel_name,
      });

      if (request.status === 201 || request.status === 200) {
        setStatusMessage(request.data.message);
        setStatus(true);

        dispatch(
          addChannel({
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
    setErrorMessage((err) => ({ ...err, first_name: null }));
  };

  return (
    <>
      <button
        style={{
          borderRadius: 0,
          padding: "0 4px",
          border: "1px solid var(--button-border-color)",
          width: 28,
          height: 20,
          lineHeight: "20px",
        }}
        onClick={() => setIsOpen(true)}
      >
        +
      </button>

      <PopUp
        type="content"
        title="Create Channel"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
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
                {isLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </Form.Body>
        </Form>
      </PopUp>
    </>
  );
};

export default ChannelCreateForm;
