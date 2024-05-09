import { Elysia } from "elysia";

import * as plugins from "@/server/plugins";
import WebSocketManager from "./websocket-data";

export const bootstrapWebsocketServer = () => {
  new Elysia({ name: "websocket-server" })
    .use(plugins.jwtPlugin)
    .use(plugins.authPlugin)
    .ws("/ws", {
      open: (ws) => {
        console.log("Socket Opened", ws.data.user.user_name);
        const wsManager = WebSocketManager.getInstance();

        wsManager.setConnectedUserWebSocket(
          ws.data.user.user_name as string,
          ws
        );
      },
      message: (ws, message) => {},
      close: (ws) => {
        console.log("Socket Closed", ws.data.user.user_name);
        const wsManager = WebSocketManager.getInstance();

        wsManager.removeConnectedUserWebSocket(
          ws.data.user.user_name as string
        );
      },
    })
    .listen(3001);
};
