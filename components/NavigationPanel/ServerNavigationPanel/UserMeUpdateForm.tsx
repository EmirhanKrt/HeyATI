"use client";

import { ChangeEventHandler, FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { SafeUserType } from "@/server/models";
import { ValidationErrorData } from "@/server/types";

import Form from "@/components/Form";
import { initializeUser } from "@/lib/store/features/user/userSlice";

type ErrorMessageObjectType = {
  first_name: string | null;
  last_name: string | null;
  old_user_password: string | null;
  new_user_password: string | null;
  new_user_password_confirm: string | null;
};

const errorMessageInitialState = {
  first_name: null,
  last_name: null,
  old_user_password: null,
  new_user_password: null,
  new_user_password_confirm: null,
};

const UserMeUpdateForm = () => {
  const dispatch = useAppDispatch();

  const user: SafeUserType = useAppSelector((state) => state.user);

  const [first_name, setFirstName] = useState(user.first_name);
  const [last_name, setLastName] = useState(user.last_name);

  const [old_user_password, setOldUserPassword] = useState("");
  const [new_user_password, setNewUserPassword] = useState("");
  const [new_user_password_confirm, setNewUserPasswordConfirm] = useState("");

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

    if (first_name !== user.first_name) updatePayload.first_name = first_name;
    if (last_name !== user.last_name) updatePayload.last_name = last_name;

    if (old_user_password !== "")
      updatePayload.old_user_password = old_user_password;
    if (new_user_password !== "")
      updatePayload.new_user_password = new_user_password;
    if (new_user_password_confirm !== "")
      updatePayload.new_user_password_confirm = new_user_password_confirm;

    if (Object.keys(updatePayload).length === 0) {
      setStatus(false);
      setStatusMessage("No updates provided.");

      setIsLoading(false);
      return;
    }

    const { error, data } = await api.user.me.put(updatePayload);

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

      dispatch(initializeUser(data.data.user));
    }

    setIsLoading(false);
  };

  const first_name_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    setFirstName(event.target.value);
    setErrorMessage((err) => ({ ...err, first_name: null }));
  };

  const last_name_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    setLastName(event.target.value);
    setErrorMessage((err) => ({ ...err, last_name: null }));
  };

  const old_user_password_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setOldUserPassword(event.target.value);
    setErrorMessage((err) => ({ ...err, old_user_password: null }));
  };

  const new_user_password_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setNewUserPassword(event.target.value);
    setErrorMessage((err) => ({ ...err, new_user_password: null }));
  };

  const new_user_password_confirm_change: ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setNewUserPasswordConfirm(event.target.value);
    setErrorMessage((err) => ({ ...err, new_user_password_confirm: null }));
  };

  return (
    <Form onSubmit={handleSubmit} style={{ padding: "20px 0" }}>
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Form.Input
            title="Email"
            type="email"
            id="user_email"
            name="user_email"
            placeholder="User email"
            value={user.user_email}
            isDisabled={true}
          />
          <Form.Input
            title="Username"
            type="text"
            id="user_name"
            name="user_name"
            placeholder="User name"
            value={user.user_name}
            isDisabled={true}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Form.Input
            title="First Name"
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Enter your first name"
            value={first_name}
            onChange={first_name_change}
            errorMessage={errorMessage.first_name}
          />
          <Form.Input
            title="Last Name"
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Enter your last name"
            value={last_name}
            onChange={last_name_change}
            errorMessage={errorMessage.last_name}
          />
        </div>
        <Form.Input
          title="Current Password"
          type="password"
          id="old_user_password"
          name="old_user_password"
          placeholder="Enter your current password"
          value={old_user_password}
          required={false}
          onChange={old_user_password_change}
          errorMessage={errorMessage.old_user_password}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Form.Input
            title="New Password"
            type="password"
            id="new_user_password"
            name="new_user_password"
            placeholder="Enter your new password"
            value={new_user_password}
            required={false}
            onChange={new_user_password_change}
            errorMessage={errorMessage.new_user_password}
          />
          <Form.Input
            title="New Password Confirmation"
            type="password"
            id="new_user_password_confirmation"
            name="new_user_password"
            placeholder="Enter your new password again"
            value={new_user_password_confirm}
            required={false}
            onChange={new_user_password_confirm_change}
            errorMessage={errorMessage.new_user_password_confirm}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </Form.Body>
    </Form>
  );
};

export default UserMeUpdateForm;
