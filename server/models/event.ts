import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { eventTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";

const schemaRules = {
  event_title: t.String({ maxLength: 16, minLength: 3 }),
  event_description: t.String({ maxLength: 500, minLength: 16 }),
  event_start_date: t.String({ maxLength: 500, minLength: 5 }),
  event_finish_date: t.String({ maxLength: 500, minLength: 5 }),
};

const eventSelectSchema = createSelectSchema(eventTable, schemaRules);

export const eventSelectSchemaWithoutSensitiveData = t.Omit(eventSelectSchema, [
  "updated_at",
]);

const eventInsertSchema = createInsertSchema(eventTable, schemaRules);

const eventInsertSchemaWithoutEventId = t.Omit(eventInsertSchema, [
  "event_id",
  "created_at",
  "updated_at",
]);

const eventUpdateSchemaWithoutEventId = t.Object({
  event_title: t.Optional(schemaRules.event_title),
  event_description: t.Optional(schemaRules.event_description),
});

const eventSuccessResponseBodyDataSchema = t.Object({
  event: eventSelectSchemaWithoutSensitiveData,
});

const eventRequestParamsSchema = t.Object({
  channel_id: t.Numeric(),
  server_id: t.Numeric(),
  event_id: t.Numeric(),
});

const eventRequestParamsSchemaWithoutEventId = t.Omit(
  eventRequestParamsSchema,
  ["event_id"]
);

const eventSuccessResponseSchema = generateSuccessReponseBodySchema(
  eventSuccessResponseBodyDataSchema
);

const getEventsSuccessResponseSchema = generateSuccessReponseBodySchema(
  t.Object({
    event: t.Array(eventSelectSchemaWithoutSensitiveData),
  })
);

export type EventType = Static<typeof eventSelectSchema>;

export type SafeEventType = Static<
  typeof eventSelectSchemaWithoutSensitiveData
>;

export type EventInsertPayloadType = Static<
  typeof eventInsertSchemaWithoutEventId
>;

export type EventUpdatePayloadType = Static<
  typeof eventUpdateSchemaWithoutEventId
>;

export const eventModel = new Elysia().model({
  "event.post.index.request.body": t.Pick(eventSelectSchema, [
    "event_title",
    "event_description",
    "event_start_date",
    "event_finish_date",
  ]),
  "event.index.get.response.body": getEventsSuccessResponseSchema,
  "event.post.index.response.body": eventSuccessResponseSchema,
  "event.put.event_id.request.body": eventUpdateSchemaWithoutEventId,
  "event.event_id.response.body": eventSuccessResponseSchema,
  "event.event_id.request.params": eventRequestParamsSchema,
  "event.channel_id.request.params": eventRequestParamsSchemaWithoutEventId,
});
