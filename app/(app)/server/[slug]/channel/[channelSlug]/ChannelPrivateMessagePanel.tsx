"use client";

import {
  ChangeEventHandler,
  FormEvent,
  KeyboardEventHandler,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  ChannelMessageSuccessResponseBodyDataType,
  ChannelMessageType,
  SafeChannelType,
  SafeEventType,
  SafeFileType,
  SafeUserType,
} from "@/server/models";
import { convertToLocalTimeString } from "@/lib/convertToLocalTimeString";
import { selectColor } from "@/lib/generateBackgroundColorByUserName";
import PopUp from "@/components/PopUp";
import { getBaseUrl } from "@/lib/api";
import Form from "@/components/Form";
import { LoadingCircle } from "@/components/LoadingCircle";
import { ChannelChat } from "@/components/Chat/ChannelChat";
import useChannelMessages from "@/lib/hooks/useChannelMessages";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const MessageHeader = ({
  shouldRenderPhoto,
  messageSenderUser,
  createdAt,
}: {
  shouldRenderPhoto: boolean;
  messageSenderUser: SafeUserType;
  createdAt: string;
}) => {
  if (shouldRenderPhoto)
    return (
      <span
        className="message-container-avatar"
        style={{
          backgroundColor: selectColor(messageSenderUser.user_name),
        }}
      >
        {(
          messageSenderUser.first_name[0] + messageSenderUser.last_name[0]
        ).toUpperCase()}
      </span>
    );

  return (
    <span
      className="message-container-avatar"
      style={{
        opacity: 0,
        fontSize: 9,
        color: "var(--text-color)",
      }}
    >
      ({convertToLocalTimeString(createdAt)})
    </span>
  );
};

const MessageContent = ({
  shouldRenderPhoto,
  messageSenderUser,
  message,
}: {
  shouldRenderPhoto: boolean;
  messageSenderUser: SafeUserType;
  message: ChannelMessageType;
}) => (
  <div className="message">
    {shouldRenderPhoto && (
      <h5>
        <span>
          {messageSenderUser.first_name} {messageSenderUser.last_name}
        </span>
        <span
          style={{
            paddingLeft: "8px",
            color: "var(--text-color)",
          }}
        >
          {convertToLocalTimeString(message.created_at)}
        </span>
      </h5>
    )}
    <p className="message-content">
      <MarkdownRenderer input={message.channel_message_content} />
    </p>
  </div>
);

const LazyImage = ({ src, onClick }: { src: string; onClick: () => void }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);

  if (!loaded) {
    return (
      <div
        data-skeleton="true"
        style={{ width: "300px", height: "300px" }}
      ></div>
    );
  }

  return <img src={src} onClick={onClick} />;
};

const FilePreviewer = ({
  file,
  fileSource,
}: {
  file: SafeFileType;
  fileSource: string;
}) => {
  const [isMediaGrowed, setIsMediaGrowed] = useState<boolean>(false);
  let filePreview;

  const fileSourceFullUrl = `${fileSource}/file/${file.file_id}`;

  const isImage =
    file.file_type.startsWith("image") && file.file_type !== "image/svg+xml";

  const isVideo = file.file_type.startsWith("video");

  if (isImage) {
    filePreview = (
      <LazyImage
        src={fileSourceFullUrl}
        onClick={() => setIsMediaGrowed(true)}
      />
    );
  }

  if (isVideo) {
    filePreview = (
      <video
        controls
        onClick={(event) => {
          event.preventDefault();
          setIsMediaGrowed(true);
        }}
      >
        <source src={fileSourceFullUrl} type={file.file_type} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (isImage || isVideo) {
    return (
      <div key={file.file_id} style={{ display: "flex" }}>
        <Suspense fallback={<div>Medya Yükleniyor...</div>}>
          {filePreview}
          <PopUp
            type={"media"}
            title={isImage ? "image" : "video"}
            openState={isMediaGrowed}
            setOpenState={setIsMediaGrowed}
          >
            {filePreview}
          </PopUp>
        </Suspense>
      </div>
    );
  }

  return (
    <div
      key={file.file_id}
      style={{
        padding: 10,
        background: "var(--background-color-2)",
        border: "2px solid var(--input-border-color)",
        display: "flex",
        gap: 10,
      }}
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 60 80"
          width={"100%"}
          height={"80px"}
          fill="none"
        >
          <g clipPath="url(#clip0_38_41)">
            <path
              d="M0 8C0 3.58172 3.58172 0 8 0H34L60 26V72C60 76.4183 56.4183 80 52 80H8C3.58172 80 0 76.4183 0 72V8Z"
              fill="#FF783A"
            />
            <path
              d="M40 26H60L34 0V20C34 23.3137 36.6863 26 40 26Z"
              fill="white"
              fillOpacity="0.5"
            />
          </g>
          <defs>
            <clipPath id="clip0_38_41">
              <rect width="60" height="80" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <a
          href={fileSourceFullUrl}
          target="_blank"
          style={{ textDecoration: "none" }}
        >
          {file.file_name}
        </a>
        <span>File Type: {file.file_type}</span>
        <span>File Size: {(file.file_size / 1024).toFixed(2)}KB</span>
      </div>
    </div>
  );
};

const MessageDateGroup = ({
  date,
  targetChannel,
  messages,
  users,
}: {
  date: string;
  targetChannel: SafeChannelType & {
    events: SafeEventType[];
    messages: Record<string, ChannelMessageSuccessResponseBodyDataType[]>;
  };
  messages: ChannelMessageSuccessResponseBodyDataType[];
  users: {
    user_id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    role: string;
  }[];
}) => {
  const dispatch = useAppDispatch();
  let lastRenderedSenderId = 0;

  const formRef = useRef<HTMLFormElement | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<number>(0);
  const [editedContent, setEditedContent] = useState<string>("");

  const currentUser = useAppSelector((state) => state.user);

  const handleDeleteMessage = async (channel_message_id: number) => {
    try {
      const request = await fetch(
        `/api/server/${targetChannel.server_id}/channel/${targetChannel.channel_id}/message/${channel_message_id}`,
        {
          method: "DELETE",
        }
      ).then((data) => data.json());

      if (request.success) {
      }
    } catch (error) {
      console.error("Error occured on uploading file. Error:", error);
    }
  };

  const handleEditClick = (
    message: ChannelMessageSuccessResponseBodyDataType
  ) => {
    setEditingMessageId(message.channel_message_id);
    setEditedContent(message.channel_message_content);
  };

  const handleSave: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (event) => {
    event.preventDefault();

    try {
      const request = await fetch(
        `/api/server/${targetChannel.server_id}/channel/${targetChannel.channel_id}/message/${editingMessageId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            channel_message_content: editedContent,
          }),
        }
      ).then((data) => data.json());

      if (request.success) {
      }

      setEditingMessageId(0);
    } catch (error) {
      console.error("Error occured on uploading file. Error:", error);
    }
  };

  const channel_message_content_change: ChangeEventHandler<
    HTMLTextAreaElement
  > = (event) => {
    setEditedContent(event.target.value);
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
    } else if (event.key === "Escape") {
      setEditingMessageId(0);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <h5 className="message-date-separator">{date}</h5>
      {[...messages].reverse().map((message, index) => {
        const isCurrentUserIsMessageSender =
          message.sender_id === currentUser.user_id;

        const messageSenderUser = isCurrentUserIsMessageSender
          ? currentUser
          : users.find((user) => user.user_id === message.sender_id) || {
              user_id: 0,
              user_name: "Deleted User",
              user_email: "Deleted User",
              first_name: "Deleted",
              last_name: "User",
              created_at: new Date().toLocaleString(),
            };

        const shouldRenderPhoto = lastRenderedSenderId !== message.sender_id;
        lastRenderedSenderId = message.sender_id;

        return (
          <div key={index} className="message-content-and-file-container">
            <div className="message-container">
              <MessageHeader
                shouldRenderPhoto={shouldRenderPhoto}
                messageSenderUser={messageSenderUser as SafeUserType}
                createdAt={message.created_at}
              />
              {editingMessageId === message.channel_message_id ? (
                <Form
                  onSubmit={handleSave}
                  innerRef={formRef}
                  style={{
                    padding: 0,
                    gap: 0,
                    background: "inherit",
                    borderRadius: 0,
                  }}
                >
                  <Form.Textarea
                    placeholder={"You are updating message"}
                    name={"channel_message_content"}
                    id={"channel_message_content"}
                    value={editedContent}
                    onChange={channel_message_content_change}
                    onKeyDown={handleKeyDown}
                  ></Form.Textarea>
                  <span style={{ fontSize: 9 }}>
                    esc to exit • enter to update
                  </span>
                  <input type="submit" hidden />
                </Form>
              ) : (
                <MessageContent
                  shouldRenderPhoto={shouldRenderPhoto}
                  messageSenderUser={messageSenderUser as SafeUserType}
                  message={message}
                />
              )}

              {isCurrentUserIsMessageSender && (
                <div className="message-icons">
                  <span onClick={() => handleEditClick(message)}>✏️</span>
                  <span
                    onClick={() =>
                      handleDeleteMessage(message.channel_message_id)
                    }
                  >
                    🗑️
                  </span>
                </div>
              )}
            </div>

            {message.files.length > 0 && (
              <div className="message-file-container">
                {message.files.map((file) => {
                  return (
                    <FilePreviewer
                      key={file.file_id}
                      file={file}
                      fileSource={`${getBaseUrl()}/api/server/${
                        targetChannel.server_id
                      }/channel/${targetChannel.channel_id}/message/${
                        message.channel_message_id
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ChannelPrivateMessagePanel = ({
  isChannelFound,
  targetChannel,
  users,
}: {
  isChannelFound: boolean;
  targetChannel: SafeChannelType & {
    events: SafeEventType[];
    messages: Record<string, ChannelMessageSuccessResponseBodyDataType[]>;
  };
  users: {
    user_id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    role: string;
  }[];
}) => {
  const [isMessageFound, setIsMessageFound] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useChannelMessages(targetChannel.server_id, targetChannel.channel_id);

  useEffect(() => {
    if (targetChannel) {
      if (targetChannel.messages) {
        if (Object.keys(targetChannel.messages).length > 0)
          setIsMessageFound(true);
      } else {
        setIsMessageFound(false);
      }
    }
  }, [targetChannel]);

  useEffect(() => {
    if (isMessageFound) {
      if (containerRef.current) {
        const innerContainer = containerRef.current.querySelector(
          "div.chat-message-grouped-date-container"
        ) as HTMLDivElement;

        if (innerContainer) {
          containerRef.current.scrollTop = innerContainer.scrollHeight;
        }
      }
    }
  }, [isMessageFound]);

  let container;

  if (!isChannelFound) {
    container = (
      <span className="error-background error-text" style={{ padding: 12 }}>
        Channel not found!
      </span>
    );
  } else if (isMessageFound) {
    container = Object.keys(targetChannel.messages)
      .reverse()
      .map((date) => (
        <MessageDateGroup
          key={date}
          date={date}
          targetChannel={targetChannel}
          messages={targetChannel.messages[date]}
          users={users}
        />
      ));
  } else
    container = (
      <span>Start sending message to {targetChannel.channel_name}</span>
    );

  return (
    <>
      <div className="chat-message-container" ref={containerRef}>
        <div className="chat-message-grouped-date-container">{container}</div>
      </div>
      <div style={{ padding: "8px" }}>
        {isChannelFound ? (
          <ChannelChat targetChannel={targetChannel} />
        ) : (
          <ChannelChat disabled={true} />
        )}
      </div>
    </>
  );
};

export default ChannelPrivateMessagePanel;
