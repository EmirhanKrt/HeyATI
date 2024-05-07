import React, { FormEvent, HTMLAttributes } from "react";
import styles from "./component.module.css";
import { FormBody } from "./FormBody";
import { FormHeader } from "./FormHeader";
import { FormInput } from "./FormInput";
import { FormStatusMessage } from "./FormStatusMessage";

export const Form = ({
  style,
  children,
  onSubmit,
}: Readonly<{
  style?: React.CSSProperties;
  children: React.ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}>) => {
  if (style) {
    return (
      <form className={styles.form_container} onSubmit={onSubmit} style={style}>
        {children}
      </form>
    );
  }

  return (
    <form className={styles.form_container} onSubmit={onSubmit}>
      {children}
    </form>
  );
};

Form.Header = FormHeader;
Form.StatusMessage = FormStatusMessage;
Form.Body = FormBody;
Form.Input = FormInput;

export default Form;
