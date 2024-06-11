"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { SafeUserType } from "@/server/models";
import { api } from "@/lib/api";
import PopUp from "@/components/PopUp";
import Form from "@/components/Form";
import { ValidationErrorData } from "@/server/types";
import Link from "next/link";
import Avatar from "@/components/Avatar";

type ErrorMessageObjectType = {
  user_name: string | null;
};

const errorMessageInitialState = {
  user_name: null,
};

const FindOrStartChat = () => {
  const interactedUserList = useAppSelector(
    (selector) => selector.interactedUsers
  );

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<SafeUserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

    const localResult = Object.values(interactedUserList.users).find(
      (user) => user.user_name.toLowerCase() === query.toLowerCase()
    );

    if (localResult) {
      setStatusMessage("User found");
      setStatus(true);

      setResult(localResult);
      setIsLoading(false);
      return;
    }

    try {
      const { data: userDetails } = await api.user({ user_name: query }).get();

      if (userDetails) {
        setResult(userDetails.data.user);

        setStatus(true);
        setStatusMessage("User found");

        setIsLoading(false);
      } else {
        setResult(null);

        setStatus(false);
        setStatusMessage("User not found.");

        setIsLoading(false);
        return;
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

      setResult(null);

      setStatus(false);
      setStatusMessage("User not found.");
      setIsLoading(false);
      return;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <>
      <div style={{ width: "100%" }}>
        <input
          type="text"
          placeholder="Find or start chat"
          style={{
            height: 28,
            padding: "1px 6px",
          }}
          onClick={() => setIsOpen(true)}
        />
      </div>

      <PopUp
        type="content"
        title="Find Or Start Chat"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <Form
          innerRef={formRef}
          onSubmit={handleSubmit}
          style={{ padding: "20px 0", paddingBottom: 0 }}
        >
          <Form.StatusMessage status={status} message={statusMessage} />
          <Form.Body>
            <Form.Input
              title="User Name"
              type="text"
              id="user_name"
              name="user_name"
              placeholder="Find or start chat"
              value={query}
              onChange={handleInputChange}
              errorMessage={errorMessage.user_name}
            />

            {result && (
              <nav
                className="navigation-subpanel-content-container"
                style={{ padding: 0, borderTop: 0, paddingTop: 4 }}
              >
                <ul style={{ gap: 4 }}>
                  <li>
                    <Link href={`/user/${result.user_name}`}>
                      <Avatar user={result} />
                      <div className="user-profile-list-container">
                        <span className="username">@{result.user_name}</span>
                        <span>
                          {result.first_name} {result.last_name}
                        </span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </nav>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="primary" type="submit" disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </Form.Body>
        </Form>
      </PopUp>
    </>
  );
};

export default FindOrStartChat;
