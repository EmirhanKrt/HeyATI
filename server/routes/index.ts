import Elysia from "elysia";

export * from "./auth";
import { userRoutes } from "./user";
import { aiRoutes } from "./ai";
import { serverRoutes } from "./server";
import { inviteRoutes } from "./invite";
import { channelRoutes } from "./channel";
import { eventRoutes } from "./event";

export const protectedRoutes = new Elysia({ name: "protected-routes" })
  .use(userRoutes)
  .use(aiRoutes)
  .use(serverRoutes)
  .use(inviteRoutes)
  .use(channelRoutes)
  .use(eventRoutes);
