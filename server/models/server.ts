import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { serverTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";
import { channelSelectSchemaWithoutSensitiveData } from "./channel";
import { eventSelectSchemaWithoutSensitiveData } from "./event";
import {
  ChannelMessagesGroupedByDateType,
  channelMessageSuccessResponseBodyDataSchema,
} from "./channelMessage";

const schemaRules = {
  server_name: t.String({ maxLength: 100, minLength: 2 }),
  server_description: t.String({ maxLength: 1000 }),
};

const serverSelectSchema = createSelectSchema(serverTable, schemaRules);

const serverSelectSchemaWithoutSensitiveData = t.Omit(serverSelectSchema, [
  "updated_at",
]);

const serverInsertSchema = createInsertSchema(serverTable, schemaRules);

const serverInsertSchemaWithoutServerId = t.Omit(serverInsertSchema, [
  "server_id",
  "created_at",
  "updated_at",
]);

const serverUpdateSchemaWithoutServerId = t.Object({
  server_name: t.Optional(schemaRules.server_name),
  server_description: t.Optional(schemaRules.server_description),
  owner_id: t.Optional(t.Number()),
});

const serverUserModel = t.Object({
  user_id: t.Number(),
  user_name: t.String(),
  first_name: t.String(),
  last_name: t.String(),
  role: t.String(),
});

const serverDetailedData = t.Object({
  ...serverSelectSchemaWithoutSensitiveData.properties,
  users: t.Array(serverUserModel),
  channels: t.Array(
    t.Object({
      ...channelSelectSchemaWithoutSensitiveData.properties,
      events: t.Array(eventSelectSchemaWithoutSensitiveData),
      messages: t.Record(
        t.String(),
        t.Array(channelMessageSuccessResponseBodyDataSchema)
      ),
    })
  ),
});

const serverSuccessResponseBodyDataSchema = t.Object({
  server: serverDetailedData,
});

const serverRequestParamsSchema = t.Object({
  server_id: t.Numeric(),
});

const serverSuccessResponseSchema = generateSuccessReponseBodySchema(
  serverSuccessResponseBodyDataSchema
);

const serverJoinRequestBody = t.Object({
  server_invite_code: t.String({ format: "uuid" }),
});

export type ServerType = Static<typeof serverSelectSchema>;

export type SafeServerType = Static<
  typeof serverSelectSchemaWithoutSensitiveData
>;

export type SafeServerUserType = Static<typeof serverUserModel>;

export type ServerInsertPayloadType = Static<
  typeof serverInsertSchemaWithoutServerId
>;

export type ServerUpdatePayloadType = Static<
  typeof serverUpdateSchemaWithoutServerId
>;

export type ServerDetailedDataType = Static<typeof serverDetailedData>;

export const serverModel = new Elysia().model({
  "server.post.index.request.body": t.Pick(serverSelectSchema, [
    "server_name",
    "server_description",
  ]),
  "server.post.index.response.body": serverSuccessResponseSchema,
  "server.post.join.request.body": serverJoinRequestBody,
  "server.put.server_id.request.body": serverUpdateSchemaWithoutServerId,
  "server.server_id.response.body": serverSuccessResponseSchema,
  "server.server_id.request.params": serverRequestParamsSchema,
});
