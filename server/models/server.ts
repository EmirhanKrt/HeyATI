import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { serverTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";

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

const serverSuccessResponseBodyDataSchema = t.Object({
  server: serverSelectSchemaWithoutSensitiveData,
});

const serverRequestParamsSchema = t.Object({
  server_id: t.Numeric(),
});

const serverSuccessResponseSchema = generateSuccessReponseBodySchema(
  serverSuccessResponseBodyDataSchema
);

export type ServerType = Static<typeof serverSelectSchema>;

export type SafeServerType = Static<
  typeof serverSelectSchemaWithoutSensitiveData
>;

export type ServerInsertPayloadType = Static<
  typeof serverInsertSchemaWithoutServerId
>;

export type ServerUpdatePayloadType = Static<
  typeof serverUpdateSchemaWithoutServerId
>;

export const serverModel = new Elysia().model({
  "server.post.index.request.body": t.Pick(serverSelectSchema, [
    "server_name",
    "server_description",
  ]),
  "server.post.index.response.body": serverSuccessResponseSchema,
  "server.put.server_id.request.body": serverUpdateSchemaWithoutServerId,
  "server.server_id.response.body": serverSuccessResponseSchema,
  "server.server_id.request.params": serverRequestParamsSchema,
});
