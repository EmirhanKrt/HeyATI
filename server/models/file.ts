import Elysia, { Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { fileTable } from "@/server/db/schema";

const fileSelectSchema = createSelectSchema(fileTable);

export const fileSelectSchemaWithoutSensitiveData = t.Omit(fileSelectSchema, [
  "updated_at",
]);

const fileInsertSchema = createInsertSchema(fileTable);

const fileInsertSchemaWithoutfileId = t.Omit(fileInsertSchema, [
  "file_id",
  "created_at",
  "updated_at",
]);

export const fileSuccessResponseBodyDataSchema = t.Object({
  file: fileSelectSchemaWithoutSensitiveData,
});

const fileIdRequestParamsSchema = t.Object({
  file_id: t.Numeric(),
});

export type FileType = Static<typeof fileSelectSchema>;

export type SafeFileType = Static<typeof fileSelectSchemaWithoutSensitiveData>;

export type FileInsertPayloadType = Static<
  typeof fileInsertSchemaWithoutfileId
>;

export const fileModel = new Elysia().model({
  "file.all.file_id.request.params": fileIdRequestParamsSchema,
});
