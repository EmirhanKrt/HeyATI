"use client";

import { FormEvent, useState } from "react";
import axios from "axios";

import Form from "@/components/Form";

const ServerInviteDeleteForm = ({
  server_id,
  invite_id,
}: {
  server_id: number;
  invite_id: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);
    setStatusMessage("");

    try {
      const request = await axios.delete(
        `/api/server/${server_id}/invite/${invite_id}`
      );

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

  return (
    <Form
      onSubmit={handleSubmit}
      style={{ padding: "20px 0", paddingBottom: 0 }}
    >
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <p>This invite code will be deleted.</p>
        <p>Warning: This action is not reversible. Please be certain.</p>

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

export default ServerInviteDeleteForm;
