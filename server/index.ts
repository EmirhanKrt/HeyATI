import { Elysia } from "elysia";

import * as plugins from "@/server/plugins";
import * as routes from "@/server/routes";

import WebsocketServer from "./socket";
WebsocketServer;

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
