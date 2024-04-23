import Elysia from "elysia";

export * from "./auth";
import { userRoutes } from "./user";

export const protectedRoutes = new Elysia({ name: "protected-routes" }).use(
  userRoutes
);
