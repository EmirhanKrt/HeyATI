import { Elysia } from "elysia";

import * as plugins from "./plugins";

const app = new Elysia({ prefix: "/api" })
  .use(plugins.docsPlugin)
  .use(plugins.corsPlugin)
  .use(plugins.errorPlugin);

export const GET = app.handle;
export const POST = app.handle;
export const DELETE = app.handle;
export const PUT = app.handle;

export type App = typeof app;
