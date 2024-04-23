import Elysia from "elysia";
import { ContextWithJWT } from "@/server/types";
import { UnauthorizedError } from "@/server/errors";

// Protected Route Middleware
export const authPlugin = (app: Elysia) => {
  return app.derive(async (context) => {
    const contextWithJWT = context as ContextWithJWT;

    const user = await contextWithJWT.jwt.verify(contextWithJWT.bearer);

    if (!user) {
      throw new UnauthorizedError("User is not authorized!");
    }

    return {
      user,
    };
  });
};
