"use client";

import {
  ChangeEventHandler,
  FormEvent,
  KeyboardEventHandler,
  MouseEventHandler,
  useRef,
  useState,
} from "react";
import Form from "../Form";
import styles from "./component.module.css";
import { FilePreview } from "./FilePreview";
import { useAppDispatch } from "@/lib/store/hooks";
import { postMessage } from "@/lib/store/features/interactedUsers/interactedUsersSlice";
import { SafeUserType } from "@/server/models";

type ChatDisabledPropType = {
  disabled: true;
};

type ChatUserNamePropType = {
  user_name: string;
};

type ChatPropType = ChatDisabledPropType | ChatUserNamePropType;

export const Chat = (props: ChatPropType) => {
  const dispatch = useAppDispatch();

  const formRef = useRef<HTMLFormElement | null>(null);

  const [private_message_content, setMessageContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  if ("disabled" in props) {
    return (
      <Form
        onSubmit={async () => {}}
        style={{
          padding: 0,
          borderRadius: 4,
          border: "1px solid var(--light-border-color) ",
          background: "var(--background-color-5)",
          cursor: "not-allowed",
          gap: 0,
        }}
      >
        <div
          className={styles.chat_message_container}
          style={{ background: "var(--background-color-5)" }}
        >
          <Form.FileInput
            placeholder={""}
            name={"files"}
            id={"files"}
            onChange={() => {}}
          ></Form.FileInput>

          <Form.Textarea
            placeholder={"You cannot send message"}
            name={"private_message_content"}
            id={"private_message_content"}
            value={"You cannot send message"}
            onChange={() => {}}
            onKeyDown={() => {}}
            disabled={true}
          ></Form.Textarea>

          <input type="submit" hidden />
        </div>
      </Form>
    );
  }

  const private_message_content_change: ChangeEventHandler<
    HTMLTextAreaElement
  > = (event) => {
    setMessageContent(event.target.value);
  };

  const file_change: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.files) {
      const fileList = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...fileList]);
    }
  };

  const file_remove: MouseEventHandler<SVGSVGElement> = (event) => {
    if (event.currentTarget) {
      const indexString = event.currentTarget.id.split("remove_")[1];

      setFiles((prevFiles) => {
        const filteredPrevFiles = prevFiles.filter(
          (file, index) => index !== Number(indexString)
        );

        return filteredPrevFiles;
      });
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (formRef.current) {
        const submitButton = formRef.current.querySelector(
          'input[type="submit"]'
        ) as HTMLElement;

        if (submitButton) {
          submitButton.click();
        }
      }
    }
  };

  const handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (event) => {
    event.preventDefault();

    const body = new FormData(event.currentTarget);

    const fileInput = event.currentTarget.elements.namedItem(
      "files"
    ) as HTMLInputElement;

    if (fileInput && fileInput.files && fileInput.files.length === 0) {
      body.delete("files");
    }

    try {
      const request = await fetch(`/api/user/${props.user_name}/message`, {
        method: "POST",
        body,
      }).then((data) => data.json());

      if (request.success) {
        dispatch(
          postMessage({
            user: { user_name: props.user_name } as SafeUserType,
            message: request.data.message,
          })
        );
        setMessageContent("");
        setFiles([]);
        fileInput.files = null;
      } else {
      }
    } catch (error) {
      console.error("Error occured on uploading file. Error:", error);
    }
  };

  const chatMessageContainerAttributes = {
    style:
      files.length > 0
        ? {
            borderTop: "1px solid var(--input-border-color)",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }
        : {},
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{
        padding: 0,
        borderRadius: 4,
        border: "1px solid var(--input-border-color) ",
        background: "var(--input-background-color)",
        gap: 0,
      }}
      innerRef={formRef}
    >
      {files.length > 0 && (
        <div className={styles.chat_file_preview_container}>
          {files.map((file, index) => (
            <FilePreview
              file={file}
              key={index}
              index={index}
              onRemove={file_remove}
            />
          ))}
        </div>
      )}
      <div
        className={styles.chat_message_container}
        {...chatMessageContainerAttributes}
      >
        <Form.FileInput
          placeholder={"Send message to " + props.user_name}
          name={"files"}
          id={"files"}
          onChange={file_change}
        ></Form.FileInput>

        <Form.Textarea
          placeholder={"Send message to " + props.user_name}
          name={"private_message_content"}
          id={"private_message_content"}
          value={private_message_content}
          onChange={private_message_content_change}
          onKeyDown={handleKeyDown}
        ></Form.Textarea>

        <input type="submit" hidden />
      </div>
    </Form>
  );
};
