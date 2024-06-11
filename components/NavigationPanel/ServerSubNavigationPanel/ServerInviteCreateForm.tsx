"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";
import axios from "axios";

import Form from "@/components/Form";

type ErrorMessageObjectType = {
  max_use_count: string | null;
  due_date: string | null;
};

const errorMessageInitialState = {
  max_use_count: null,
  due_date: null,
};

const formatDateTime = (dateTime: string) => {
  const dateObj = new Date(dateTime);
  return dateObj.toISOString().replace("T", " ").replace("Z", "");
};

const ServerInviteCreateForm = ({ server_id }: { server_id: number }) => {
  const [max_use_count, setMaxUseCount] = useState(100);
  const [due_date, setDueDate] = useState("");

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
      const request = await axios.post(`/api/server/${server_id}/invite`, {
        max_use_count,
        due_date,
      });

      if (request.status === 200) {
        setStatusMessage(request.data.message);
        setStatus(true);
      }
    } catch (error) {
      const { message } = (error as any).response.data;

      setStatus(false);
      setStatusMessage(message);
    }

    setIsLoading(false);
  };

  const max_use_count_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setMaxUseCount(+event.target.value);
    setErrorMessage((err) => ({ ...err, max_use_count: null }));
  };

  const due_date_count_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const selectedDateTime = event.target.value;
    const formattedDateTime = formatDateTime(selectedDateTime);
    setDueDate(formattedDateTime);
    setErrorMessage((err) => ({ ...err, due_date: null }));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{ padding: "20px 0", paddingBottom: 0 }}
    >
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <Form.Input
          title="Max Use Count"
          type="number"
          id="max_use_count"
          name="max_use_count"
          placeholder="Enter max use count"
          value={max_use_count}
          onChange={max_use_count_change}
          errorMessage={errorMessage.max_use_count}
        />

        <Form.Input
          title="Due Date"
          type="datetime-local"
          id="due_date"
          name="due_date"
          placeholder="Select new due date"
          value={due_date}
          onChange={due_date_count_change}
          errorMessage={errorMessage.due_date}
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

export default ServerInviteCreateForm;
