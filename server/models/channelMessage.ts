import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { channelMessageTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";
import { fileSelectSchemaWithoutSensitiveData } from "./file";

const schemaRules = {
  channel_message_content: t.String({ maxLength: 1000, minLength: 1 }),
};

const channelMessageSelectSchema = createSelectSchema(
  channelMessageTable,
  schemaRules
);

const channelMessageInsertSchema = createInsertSchema(
  channelMessageTable,
  schemaRules
);

const channelMessageInsertSchemaWithoutChannelMessageId = t.Omit(
  channelMessageInsertSchema,
  [
    "is_edited",
    "sender_id",
    "channel_id",
    "channel_message_id",
    "created_at",
    "updated_at",
  ]
);

const channelMessageWithFile = t.Object({
  ...channelMessageInsertSchemaWithoutChannelMessageId.properties,
  files: t.Optional(t.Files({ maxItems: 10, maxSize: "25m" })),
});

export const channelMessageSuccessResponseBodyDataSchema = t.Object({
  ...channelMessageSelectSchema.properties,
  files: t.Array(fileSelectSchemaWithoutSensitiveData),
});

const channelMessageIdRequestParamsSchema = t.Object({
  channel_message_id: t.Numeric(),
});

const channelMessageSuccessResponseSchema = generateSuccessReponseBodySchema(
  t.Object({
    message: channelMessageSuccessResponseBodyDataSchema,
  })
);

const getchannelMessagesSuccessResponseSchema =
  generateSuccessReponseBodySchema(
    t.Object({
      message: t.Array(channelMessageSuccessResponseBodyDataSchema),
    })
  );

export type ChannelMessageType = Static<typeof channelMessageSelectSchema>;

export type ChannelMessageInsertPayloadType = Static<
  typeof channelMessageInsertSchemaWithoutChannelMessageId
>;

export type ChannelMessageSuccessResponseBodyDataType = Static<
  typeof channelMessageSuccessResponseBodyDataSchema
>;

export type ChannelMessagesGroupedByDateType = {
  [key: string]: ChannelMessageSuccessResponseBodyDataType[];
};

export const channelMessageModel = new Elysia().model({
  "channel_message.index.get.response.body":
    getchannelMessagesSuccessResponseSchema,

  "channel_message.all.message_id.request.params":
    channelMessageIdRequestParamsSchema,

  "channel_message.put.message_id.request.body": t.Object({
    channel_message_content: schemaRules.channel_message_content,
  }),

  "channel_message.post.request.body": channelMessageWithFile,
  "channel_message.all.response.body": channelMessageSuccessResponseSchema,
});
