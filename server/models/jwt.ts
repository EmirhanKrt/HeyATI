import { Static, t } from "elysia";
import { userSelectSchema } from "./user";

export const jwtPayloadSchema = t.Pick(userSelectSchema, [
  "user_id",
  "user_name",
  "user_email",
]);

export type JWTPayloadType = Static<typeof jwtPayloadSchema>;
