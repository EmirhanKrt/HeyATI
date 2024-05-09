import React, { FormEvent, RefObject } from "react";
import { FormBody } from "./FormBody";
import { FormHeader } from "./FormHeader";
import { FormInput } from "./FormInput";
import { FormStatusMessage } from "./FormStatusMessage";
import { FormTextarea } from "./FormTextarea";
import { FormFileInput } from "./FormFileInput";

import "./form.global.css";

export const Form = ({
  style,
  children,
  onSubmit,
  innerRef,
}: Readonly<{
  style?: React.CSSProperties;
  children: React.ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  innerRef?: RefObject<HTMLFormElement>;
}>) => {
  return (
    <form
      className={"form_container"}
      onSubmit={onSubmit}
      style={style}
      ref={innerRef}
    >
      {children}
    </form>
  );
};

Form.Header = FormHeader;
Form.StatusMessage = FormStatusMessage;
Form.Body = FormBody;
Form.Input = FormInput;
Form.Textarea = FormTextarea;
Form.FileInput = FormFileInput;

export default Form;
