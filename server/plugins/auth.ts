import Elysia, { t } from "elysia";
import { ContextWithJWT } from "@/server/types";
import { UnauthorizedError } from "@/server/errors";

// Protected Route Middleware
export const authPlugin = (app: Elysia) => {
  return app
    .onTransform(({ cookie }) => {
      if (!cookie.token.value) {
        throw new UnauthorizedError("User is not authorized!");
      }
    })
    .derive(async (context) => {
      const contextWithJWT = context as ContextWithJWT;

      const token = context.cookie.token.value as string;

      const user = await contextWithJWT.jwt.verify(token);

      if (!user) {
        throw new UnauthorizedError("User is not authorized!");
      }

      return {
        user,
      };
    });
};
