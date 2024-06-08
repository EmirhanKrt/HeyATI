import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { channelTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";

const schemaRules = {
  channel_name: t.String({ maxLength: 16, minLength: 3 }),
};

const channelSelectSchema = createSelectSchema(channelTable, schemaRules);

export const channelSelectSchemaWithoutSensitiveData = t.Omit(
  channelSelectSchema,
  ["updated_at"]
);

const channelInsertSchema = createInsertSchema(channelTable, schemaRules);

const channelInsertSchemaWithoutChannelId = t.Omit(channelInsertSchema, [
  "channel_id",
  "created_at",
  "updated_at",
]);

const channelUpdateSchemaWithoutChannelId = t.Object({
  channel_name: schemaRules.channel_name,
});

const channelSuccessResponseBodyDataSchema = t.Object({
  channel: channelSelectSchemaWithoutSensitiveData,
});

const channelRequestParamsSchema = t.Object({
  channel_id: t.Numeric(),
  server_id: t.Numeric(),
});

const channelSuccessResponseSchema = generateSuccessReponseBodySchema(
  channelSuccessResponseBodyDataSchema
);

const getChannelsSuccessResponseSchema = generateSuccessReponseBodySchema(
  t.Object({
    channel: t.Array(channelSelectSchemaWithoutSensitiveData),
  })
);

export type ChannelType = Static<typeof channelSelectSchema>;

export type SafeChannelType = Static<
  typeof channelSelectSchemaWithoutSensitiveData
>;

export type ChannelInsertPayloadType = Static<
  typeof channelInsertSchemaWithoutChannelId
>;

export type ChannelUpdatePayloadType = Static<
  typeof channelUpdateSchemaWithoutChannelId
>;

export const channelModel = new Elysia().model({
  "channel.post.index.request.body": t.Pick(channelSelectSchema, [
    "channel_name",
  ]),
  "channel.index.get.response.body": getChannelsSuccessResponseSchema,
  "channel.post.index.response.body": channelSuccessResponseSchema,
  "channel.put.channel_id.request.body": channelUpdateSchemaWithoutChannelId,
  "channel.channel_id.response.body": channelSuccessResponseSchema,
  "channel.channel_id.request.params": channelRequestParamsSchema,
  "channel.server_id.request.params": t.Pick(channelRequestParamsSchema, [
    "server_id",
  ]),
});
