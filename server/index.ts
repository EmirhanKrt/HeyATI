import { Elysia } from "elysia";

import * as plugins from "@/server/plugins";
import * as routes from "@/server/routes";

import WebSocketManager from "./websocket-data";

new Elysia({ name: "websocket-server" })
  .use(plugins.jwtPlugin)
  .use(plugins.authPlugin)
  .ws("/ws", {
    open: async (ws) => {
      const currentUser = ws.data.user;

      console.log("Socket Opened", currentUser.user_name);
      const wsManager = await WebSocketManager.getInstance();

      wsManager.addUserWebSocket(currentUser.user_name as string, ws.raw);

      return;
    },
    message: (ws, message) => {},
    close: async (ws) => {
      const currentUser = ws.data.user;

      console.log("Socket Closed", currentUser.user_name);
      const wsManager = await WebSocketManager.getInstance();

      wsManager.removeUserWebSocket(currentUser.user_name as string);

      return;
    },
  })
  .listen(3001);

const app = new Elysia({ prefix: "/api" })
  .use(plugins.docsPlugin)
  .use(plugins.corsPlugin)
  .use(plugins.errorPlugin)
  .use(plugins.jwtPlugin)
  .use(routes.authRoutes)
  .use(plugins.authPlugin)
  .use(routes.protectedRoutes)
  .compile();

export const GET = app.handle;
export const POST = app.handle;
export const DELETE = app.handle;
export const PUT = app.handle;

export type App = typeof app;
