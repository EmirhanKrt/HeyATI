import { Elysia } from "elysia";

const app = new Elysia({ prefix: "/api" });

export const GET = app.handle;
export const POST = app.handle;
export const DELETE = app.handle;
export const PUT = app.handle;

export type App = typeof app;
