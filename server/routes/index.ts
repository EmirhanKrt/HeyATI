import Elysia from "elysia";

export * from "./auth";
import { userRoutes } from "./user";
import { aiRoutes } from "./ai";
import { serverRoutes } from "./server";
import { channelRoutes } from "./channel";
import { eventRoutes } from "./event";

export const protectedRoutes = new Elysia({ name: "protected-routes" })
  .use(userRoutes)
  .use(aiRoutes)
  .use(serverRoutes)
  .use(channelRoutes)
  .use(eventRoutes);
