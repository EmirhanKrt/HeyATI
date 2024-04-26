import Elysia from "elysia";
import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";

import { jwtPayloadSchema } from "@/server/models";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

const jwtPluginConfig = {
  name: "jwt",
  secret: JWT_SECRET,
  schema: jwtPayloadSchema,
  exp: "7d",
};

export const jwtPlugin = (app: Elysia) => {
  return app.use(cookie()).use(jwt({ ...jwtPluginConfig }));
};
