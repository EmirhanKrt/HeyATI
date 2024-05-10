"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  deleteMessage,
  postMessage,
  updateMessage,
} from "@/lib/store/features/interactedUsers/interactedUsersSlice";

const WebsocketConnection = () => {
  const dispatch = useAppDispatch();

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
      ws.current = new WebSocket("ws://localhost:3001/ws");

      ws.current.onopen = function (event) {
        console.log("Connection open");
      };

      ws.current.onmessage = function (event) {
        const message = event.data;

        const messageAsJson = JSON.parse(message);

        const data = messageAsJson.data;

        switch (messageAsJson.type) {
          case "post_private_message":
            dispatch(
              postMessage({
                user_name: data.sender_user_name,
                message: data.message,
              })
            );
            break;

          case "update_private_message":
            dispatch(
              updateMessage({
                user_name: data.sender_user_name,
                message: data.message,
              })
            );
            break;

          case "delete_private_message":
            dispatch(
              deleteMessage({
                user_name: data.sender_user_name,
                message: data.message,
              })
            );
            break;

          default:
            break;
        }

        console.log("Message from server ", message);
      };

      ws.current.onerror = function (event) {
        console.error("WebSocket error: ", event);
      };

      ws.current.onclose = function (event) {
        console.log("WebSocket closed");
      };
    }

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  return <></>;
};

export default WebsocketConnection;
