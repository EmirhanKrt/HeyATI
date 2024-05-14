"use client";

import { MiddlewareAPI, Middleware, UnknownAction } from "@reduxjs/toolkit";
import { TRootState } from "../../store";
import webSocketMessageHandler from "./webSocketMessageHandler";

const wsConnect = "WEBSOCKET_CONNECT";
const wsSendMessage = "WEBSOCKET_SEND_MESSAGE";

interface WebSocketConnectAction extends UnknownAction {
  type: "WEBSOCKET_CONNECT";
  payload: string;
}

interface WebSocketSendMessageAction extends UnknownAction {
  type: "WEBSOCKET_SEND_MESSAGE";
  payload: string;
}

type TwsActions = {
  wsConnect: typeof wsConnect;
  wsSendMessage: typeof wsSendMessage;
};

type WebSocketAction =
  | WebSocketConnectAction
  | WebSocketSendMessageAction
  | any;

export const webSocketMiddleware = (
  wsActions: TwsActions
): Middleware<{}, TRootState> => {
  return (storeAPI: MiddlewareAPI) => {
    let socket: WebSocket | null = null;
    let isConnected: boolean = false;

    const onOpen = (event: any) => {
      storeAPI.dispatch({ type: "WEBSOCKET_OPEN" });
    };

    const onMessage = (event: MessageEvent<any>) => {
      try {
        webSocketMessageHandler(event, storeAPI.dispatch);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    const onError = (event: any) => {
      console.error("Error occured on Webscoket connection", event);

      storeAPI.dispatch({ type: "WEBSOCKET_ERROR", payload: event });
    };

    const onClose = (event: any) => {
      storeAPI.dispatch({ type: "WEBSOCKET_CLOSED", payload: event });
    };

    return (next) => (action: WebSocketAction) => {
      switch (action.type) {
        case "WEBSOCKET_CONNECT":
          const { payload: socketCoonectionUrl } =
            action as WebSocketConnectAction;

          if (socket !== null) {
            socket.close();
          }

          socket = new WebSocket(socketCoonectionUrl);

          socket.onopen = onOpen;
          socket.onclose = onClose;
          socket.onerror = onError;
          socket.onmessage = onMessage;

          break;

        case "WEBSOCKET_OPEN":
          isConnected = true;
          break;

        case "WEBSOCKET_SEND_MESSAGE":
          const { payload: message } = action as WebSocketSendMessageAction;

          if (socket && isConnected) socket.send(message);

          break;

        case "WEBSOCKET_ERROR":
          isConnected = false;
          socket = null;
          break;

        case "WEBSOCKET_CLOSED":
          isConnected = false;
          socket = null;
          storeAPI.dispatch({
            type: "WEBSOCKET_CONNECT",
            payload: "ws://localhost:3001/ws",
          });
          break;

        default:
          break;
      }

      next(action);
    };
  };
};

export default webSocketMiddleware;
