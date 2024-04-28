"use client";
import { Form } from "@/components/Form";
import { api } from "@/lib/api";
import { ValidationErrorData } from "@/server/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEventHandler, FormEvent, useState } from "react";

type ErrorMessageObjectType = {
  first_name: string | null;
  last_name: string | null;
  user_name: string | null;
  user_email: string | null;
  user_password: string | null;
  user_password_confirm: string | null;
};

const errorMessageInitialState = {
  first_name: null,
  last_name: null,
  user_name: null,
  user_email: null,
  user_password: null,
  user_password_confirm: null,
};

const RegisterPage = () => {
  const router = useRouter();

  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [user_name, setUserName] = useState("");
  const [user_email, setUserEmail] = useState("");
  const [user_password, setUserPassword] = useState("");
  const [user_password_confirm, setUserPasswordConfirm] = useState("");

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

    const { error, data } = await api.auth.register.post({
      first_name,
      last_name,
      user_name,
      user_email,
      user_password,
      user_password_confirm,
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

      setTimeout(() => {
        router.replace("/");
      }, 1000);
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

  const user_name_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    setUserName(event.target.value);
    setErrorMessage((err) => ({ ...err, user_name: null }));
  };

  const user_email_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    setUserEmail(event.target.value);
    setErrorMessage((err) => ({ ...err, user_email: null }));
  };

  const user_password_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setUserPassword(event.target.value);
    setErrorMessage((err) => ({ ...err, user_password: null }));
  };

  const user_password_confirm_change: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setUserPasswordConfirm(event.target.value);
    setErrorMessage((err) => ({ ...err, user_password_confirm: null }));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Header
        title="Create your account"
        description="Please enter your information below in order to start the process."
      />
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
        <div style={{ display: "flex", gap: 16 }}>
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
          title="User Name"
          type="text"
          id="user_name"
          name="user_name"
          placeholder="Enter your user name"
          value={user_name}
          onChange={user_name_change}
          errorMessage={errorMessage.user_name}
        />
        <Form.Input
          title="Email"
          type="email"
          id="user_email"
          name="user_email"
          placeholder="Enter your email"
          value={user_email}
          onChange={user_email_change}
          errorMessage={errorMessage.user_email}
        />
        <Form.Input
          title="Password"
          type="password"
          id="user_password"
          name="user_password"
          placeholder="Enter your Password"
          value={user_password}
          onChange={user_password_change}
          errorMessage={errorMessage.user_password}
        />
        <Form.Input
          title="Password confirmation"
          type="password"
          id="user_password_confirm"
          name="user_password_confirm"
          placeholder="Enter your Password again"
          value={user_password_confirm}
          onChange={user_password_confirm_change}
          errorMessage={errorMessage.user_password_confirm}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </button>
          <Link href={"/login"}>
            <button>I have an account</button>
          </Link>
        </div>
      </Form.Body>
    </Form>
  );
};

export default RegisterPage;
