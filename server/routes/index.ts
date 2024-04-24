import Elysia from "elysia";

export * from "./auth";
import { userRoutes } from "./user";
import { serverRoutes } from "./server";

export const protectedRoutes = new Elysia({ name: "protected-routes" })
  .use(userRoutes)
  .use(serverRoutes);
