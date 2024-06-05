import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { privateMessageTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";
import { fileSelectSchemaWithoutSensitiveData } from "./file";

const schemaRules = {
  private_message_content: t.String({ maxLength: 1000, minLength: 1 }),
};

const privateMessageSelectSchema = createSelectSchema(
  privateMessageTable,
  schemaRules
);

const privateMessageInsertSchema = createInsertSchema(
  privateMessageTable,
  schemaRules
);

const privateMessageInsertSchemaWithoutPrivateMessageId = t.Omit(
  privateMessageInsertSchema,
  [
    "is_edited",
    "sender_id",
    "receiver_id",
    "private_message_id",
    "created_at",
    "updated_at",
  ]
);

const privateMessageWithFile = t.Object({
  ...privateMessageInsertSchemaWithoutPrivateMessageId.properties,
  files: t.Optional(t.Files({ maxItems: 10, maxSize: "25m" })),
});

const privateMessageSuccessResponseBodyDataSchema = t.Object({
  ...privateMessageSelectSchema.properties,
  files: t.Array(fileSelectSchemaWithoutSensitiveData),
});

const privateMessageIdRequestParamsSchema = t.Object({
  private_message_id: t.Numeric(),
});

const privateMessageSuccessResponseSchema = generateSuccessReponseBodySchema(
  t.Object({
    message: privateMessageSuccessResponseBodyDataSchema,
  })
);

const getPrivateMessagesSuccessResponseSchema =
  generateSuccessReponseBodySchema(
    t.Object({
      message: t.Array(privateMessageSuccessResponseBodyDataSchema),
    })
  );

export type PrivateMessageType = Static<typeof privateMessageSelectSchema>;

export type PrivateMessageInsertPayloadType = Static<
  typeof privateMessageInsertSchemaWithoutPrivateMessageId
>;

export type PrivateMessageSuccessResponseBodyDataType = Static<
  typeof privateMessageSuccessResponseBodyDataSchema
>;

export type PrivateMessagesGroupedByDateType = {
  [key: string]: PrivateMessageSuccessResponseBodyDataType[];
};

export const privateMessageModel = new Elysia().model({
  "private_message.index.get.response.body":
    getPrivateMessagesSuccessResponseSchema,

  "private_message.all.message_id.request.params":
    privateMessageIdRequestParamsSchema,

  "private_message.put.message_id.request.body": t.Object({
    private_message_content: schemaRules.private_message_content,
  }),

  "private_message.post.request.body": privateMessageWithFile,
  "private_message.all.response.body": privateMessageSuccessResponseSchema,
});
