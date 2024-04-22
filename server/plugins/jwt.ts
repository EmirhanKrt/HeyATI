import Elysia from "elysia";
import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) JWT_SECRET = "jwt_secret";

// TODO: JWT Schema will be updated when JWT model implemented.
const jwtPluginConfig = {
  name: "jwt",
  secret: JWT_SECRET,
  /* schema: jwtSchema, */
  exp: "7d",
};

export const jwtPlugin = (app: Elysia) => {
  return app.use(bearer()).use(jwt(jwtPluginConfig));
};
