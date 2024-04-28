"use client";
import { Form } from "@/components/Form";
import { api } from "@/lib/api";
import { ValidationErrorData } from "@/server/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEventHandler, FormEvent, useState } from "react";

type ErrorMessageObjectType = {
  user_email: string | null;
  user_password: string | null;
};

const LoginPage = () => {
  const router = useRouter();

  const [user_email, setUserEmail] = useState("");
  const [user_password, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessageObjectType>({
    user_email: null,
    user_password: null,
  });
  const [status, setStatus] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage({ user_email: null, user_password: null });
    setStatus(null);
    setStatusMessage("");

    const { error, data } = await api.auth.login.post({
      user_email,
      user_password,
    });

    if (error) {
      if (error.status === 400) {
        const {
          data: { body: errorData },
          message,
        } = error.value as any;

        setStatus(false);
        setStatusMessage(message);

        if (message === "Email or password is not correct.") {
          setIsLoading(false);
          return;
        }

        const tempErrorMessage: ErrorMessageObjectType = {
          user_email: null,
          user_password: null,
        };

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

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Header
        title="Good to see you 👋"
        description="Please enter your information below in order to start the process."
      />
      <Form.StatusMessage status={status} message={statusMessage} />
      <Form.Body>
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
          placeholder="Password"
          value={user_password}
          onChange={user_password_change}
          errorMessage={errorMessage.user_password}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <Link href={"/register"}>
            <button>I don&apos;t have an account</button>
          </Link>
        </div>
      </Form.Body>
    </Form>
  );
};

export default LoginPage;
