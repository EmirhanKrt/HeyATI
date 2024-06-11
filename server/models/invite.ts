import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { serverInviteCodeTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";

export const inviteSelectSchema = createSelectSchema(serverInviteCodeTable);

export const inviteSchemaWithoutSensitiveData = t.Omit(inviteSelectSchema, [
  "updated_at",
]);

export const inviteInsertSchema = createInsertSchema(serverInviteCodeTable);

const inviteInsertSchemaWithoutServerInviteCodeId = t.Omit(inviteInsertSchema, [
  "server_invite_code_id",
  "is_in_use",
  "total_use_count",
  "created_at",
  "updated_at",
]);

export const inviteSuccessResponseBodyDataSchema = t.Object({
  invite: inviteSchemaWithoutSensitiveData,
});

const inviteIdRequestParamsSchema = t.Object({
  invite_id: t.String({ format: "uuid" }),
});

const inviteSuccessResponseBodySchema = generateSuccessReponseBodySchema(
  inviteSuccessResponseBodyDataSchema
);
const inviteByServerIdRequestParamsSchema = t.Object({
  server_id: t.String(),
});

export type InviteType = Static<typeof inviteSelectSchema>;

export type SafeInviteType = Static<typeof inviteSchemaWithoutSensitiveData>;

export type InviteInsertPayloadType = Static<
  typeof inviteInsertSchemaWithoutServerInviteCodeId
>;

export const inviteModel = new Elysia().model({
  "invite.all.response.body": inviteSuccessResponseBodySchema,
  "invite.post.request.body": t.Optional(
    t.Pick(inviteInsertSchema, ["max_use_count", "due_date"])
  ),
  "invite.all.invite_id.request.params": inviteIdRequestParamsSchema,
  "invite.all.server_id.request.params": inviteByServerIdRequestParamsSchema,
});
