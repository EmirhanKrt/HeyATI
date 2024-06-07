"use client";

import "regenerator-runtime/runtime";
import { ChangeEventHandler, useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Form from "../Form";
import MarkdownRenderer from "../MarkdownRenderer";

const AIAssistant = () => {
  const [conversationHistory, setConversationHistory] = useState<
    {
      role: string;
      content: string;
    }[]
  >([]);

  const [messages, setMessages] = useState<
    Record<string, { fromUser: boolean; content: string }>
  >({});

  const [isExpanded, setIsExpanded] = useState(false);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  const [currentMessageContent, setCurrentMessageContent] =
    useState("Ask a question");

  useEffect(() => {
    setCurrentMessageContent(transcript);
  }, [transcript]);

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = async () => {
    const messageContent = currentMessageContent;
    SpeechRecognition.stopListening();

    const message_id = crypto.randomUUID();

    setCurrentMessageContent("Ask a question");

    setMessages((prevMessages) => ({
      ...prevMessages,
      [message_id]: {
        fromUser: true,
        content: messageContent,
      },
    }));

    const newMessage = { role: "user", content: messageContent };
    const updatedConversationHistory = [...conversationHistory, newMessage];
    setConversationHistory(updatedConversationHistory);

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: updatedConversationHistory }),
    });

    if (response.body) {
      const stream = response.body;
      const reader = stream.getReader();
      const textDecoder = new TextDecoder();
      let buffer = "";
      let accumulatedAssistantMessage = "";

      const readChunk = async () => {
        const { done, value } = await reader.read();

        if (done) {
          const assistantMessage = {
            role: "assistant",
            content: accumulatedAssistantMessage,
          };

          setConversationHistory((prevHistory) => [
            ...prevHistory,
            assistantMessage,
          ]);

          return;
        }

        buffer += textDecoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");

        while (boundary !== -1) {
          const completeChunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          const dataMatch = completeChunk.match(/data:\s*(\{.*\})/);
          if (dataMatch) {
            try {
              const dataObject = JSON.parse(dataMatch[1]);

              setMessages((prevMessages) => {
                const existingMessage =
                  prevMessages[dataObject.id]?.content || "";
                const newContent =
                  existingMessage + (dataObject.choices[0].delta.content || "");

                accumulatedAssistantMessage +=
                  dataObject.choices[0].delta.content || "";

                return {
                  ...prevMessages,
                  [dataObject.id]: { fromUser: false, content: newContent },
                };
              });

              const messageContainer = document.querySelector(
                ".ai-assistant-message-container"
              );

              if (messageContainer) {
                messageContainer.scrollTop = messageContainer.scrollHeight;
              }
            } catch (error) {
              console.error("Failed to parse JSON", error);
            }
          }

          boundary = buffer.indexOf("\n\n");
        }

        readChunk();
      };

      readChunk();
    }

    return;
  };

  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded);
  };

  const current_message_content_change: ChangeEventHandler<
    HTMLTextAreaElement
  > = (event) => {
    setCurrentMessageContent(event.target.value);
  };

  return (
    <div
      className={`ai-assistant-container ${
        isExpanded ? "expanded" : "collapsed"
      }`}
    >
      <div className="ai-assistant-container-header">
        <span>Assistant</span>
        <div className="settings-icon-container" onClick={toggleExpand}>
          {isExpanded ? (
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
            </svg>
          ) : (
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path>
            </svg>
          )}
        </div>
      </div>
      {isExpanded && (
        <div
          className="ai-assistant-container-body"
          style={{ background: "var(--background-color-2)" }}
        >
          {Object.keys(messages).length > 0 && (
            <div className="ai-assistant-message-container">
              {Object.entries(messages).map(([messageId, message]) => {
                if (message.fromUser) {
                  return (
                    <div key={messageId} className="user-message">
                      {message.content}
                    </div>
                  );
                } else {
                  return (
                    <div key={messageId} className={"ai-bot-message"}>
                      <MarkdownRenderer input={message.content} />
                    </div>
                  );
                }
              })}
              {listening && transcript && (
                <div className="user-message">{transcript}</div>
              )}
            </div>
          )}

          <div className={"ai-assistant-chat-message-container"}>
            <div
              className="settings-icon-container"
              onClick={listening ? stopListening : startListening}
              style={
                listening
                  ? {
                      background: "white",
                    }
                  : {
                      background: "var(--button-background-color)",
                    }
              }
            >
              {listening ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    style={{ fill: "black" }}
                    d="M6.394 4.444c.188-.592 1.024-.592 1.212 0C8.4 8.9 9.1 9.6 13.556 10.394c.592.188.592 1.024 0 1.212C9.1 12.4 8.4 13.1 7.606 17.556c-.188.592-1.024.592-1.212 0C5.6 13.1 4.9 12.4.444 11.606c-.592-.188-.592-1.024 0-1.212C4.9 9.6 5.6 8.9 6.394 4.444m8.716 9.841a.41.41 0 0 1 .78 0c.51 2.865.96 3.315 3.825 3.826.38.12.38.658 0 .778-2.865.511-3.315.961-3.826 3.826a.408.408 0 0 1-.778 0c-.511-2.865-.961-3.315-3.826-3.826a.408.408 0 0 1 0-.778c2.865-.511 3.315-.961 3.826-3.826Zm2.457-12.968a.454.454 0 0 1 .866 0C19 4.5 19.5 5 22.683 5.567a.454.454 0 0 1 0 .866C19.5 7 19 7.5 18.433 10.683a.454.454 0 0 1-.866 0C17 7.5 16.5 7 13.317 6.433a.454.454 0 0 1 0-.866C16.5 5 17 4.5 17.567 1.317"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    style={{ fill: "currentColor" }}
                    d="M6.394 4.444c.188-.592 1.024-.592 1.212 0C8.4 8.9 9.1 9.6 13.556 10.394c.592.188.592 1.024 0 1.212C9.1 12.4 8.4 13.1 7.606 17.556c-.188.592-1.024.592-1.212 0C5.6 13.1 4.9 12.4.444 11.606c-.592-.188-.592-1.024 0-1.212C4.9 9.6 5.6 8.9 6.394 4.444m8.716 9.841a.41.41 0 0 1 .78 0c.51 2.865.96 3.315 3.825 3.826.38.12.38.658 0 .778-2.865.511-3.315.961-3.826 3.826a.408.408 0 0 1-.778 0c-.511-2.865-.961-3.315-3.826-3.826a.408.408 0 0 1 0-.778c2.865-.511 3.315-.961 3.826-3.826Zm2.457-12.968a.454.454 0 0 1 .866 0C19 4.5 19.5 5 22.683 5.567a.454.454 0 0 1 0 .866C19.5 7 19 7.5 18.433 10.683a.454.454 0 0 1-.866 0C17 7.5 16.5 7 13.317 6.433a.454.454 0 0 1 0-.866C16.5 5 17 4.5 17.567 1.317"
                  ></path>
                </svg>
              )}
            </div>

            <Form.Textarea
              placeholder={"Ask a question"}
              name={"message_content"}
              id={"message_content"}
              value={currentMessageContent}
              onChange={current_message_content_change}
              onKeyDown={() => {}}
            ></Form.Textarea>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
