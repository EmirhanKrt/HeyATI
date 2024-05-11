"use client";

import {
  ChangeEvent,
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useState,
} from "react";

type FormTextareaPropsType = {
  placeholder: string;
  name: string;
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  disabled?: boolean;
};

export const FormTextarea = (props: FormTextareaPropsType) => {
  const minRows = 1;
  const maxRows = 30;

  const [rows, setRows] = useState(minRows);

  const handleMessageChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const textareaLineHeight = 24;
      event.target.rows = minRows;
      const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);
      event.target.rows = currentRows >= maxRows ? maxRows : currentRows;
      setRows(currentRows);
      props.onChange(event);
    },
    []
  );

  return (
    <textarea
      className={"form_textarea"}
      rows={rows}
      maxLength={1000}
      placeholder={props.placeholder}
      name={props.name}
      id={props.id}
      value={props.value}
      onChange={handleMessageChange}
      onKeyDown={props.onKeyDown}
      disabled={props.disabled}
    ></textarea>
  );
};
