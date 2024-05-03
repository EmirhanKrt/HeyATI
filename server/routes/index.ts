import Elysia from "elysia";

export * from "./auth";
import { userRoutes } from "./user";
import { serverRoutes } from "./server";
import { channelRoutes } from "./channel";

export const protectedRoutes = new Elysia({ name: "protected-routes" })
  .use(userRoutes)
  .use(serverRoutes)
  .use(channelRoutes);
