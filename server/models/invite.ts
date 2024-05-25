import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { serverInviteCodeTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";

const inviteSchemaRules = {
  server_id: t.Integer(),
  owner_id: t.Integer(),
  server_invite_code: t.String(),
  max_use_count: t.Integer(),
  due_date: t.String(),
  total_use_count: t.Integer(),
  is_in_use: t.Boolean(),
};

export const inviteSelectSchema = createSelectSchema(serverInviteCodeTable, inviteSchemaRules);

export const inviteInsertSchema = createInsertSchema(serverInviteCodeTable, inviteSchemaRules);

const inviteUpdateRequestBodySchema = t.Object({
  max_use_count: t.Optional(inviteSchemaRules.max_use_count),
  due_date: t.Optional(inviteSchemaRules.due_date),
  is_in_use: t.Optional(inviteSchemaRules.is_in_use),
});

const inviteSuccessResponseBodyDataSchema = t.Object({
  invite: inviteSelectSchema,
});

const inviteByIdRequestParamsSchema = t.Object({
  invite_id: t.String(),
});

const inviteByServerIdRequestParamsSchema = t.Object({
  server_id: t.String(),
});

const inviteSuccessResponseBodySchema = generateSuccessReponseBodySchema(inviteSuccessResponseBodyDataSchema);

export type InviteType = Static<typeof inviteSelectSchema>;
export type InviteInsertType = Static<typeof inviteInsertSchema>;
export type InviteUpdatePayloadType = Static<typeof inviteUpdateRequestBodySchema>;
export type InviteSuccessResponseType = Static<typeof inviteSuccessResponseBodySchema>;

export const inviteModel = new Elysia().model({
  "invite.all.response.body": inviteSuccessResponseBodySchema,
  "invite.put.request.body": inviteUpdateRequestBodySchema,
  "invite.all.invite_id.request.params": inviteByIdRequestParamsSchema,
  "invite.all.server_id.request.params": inviteByServerIdRequestParamsSchema,
});
