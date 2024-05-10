import db from "@/server/db";
import { eventTable } from "@/server/db/schema";
import {
  EventType,
  SafeEventType,
  EventUpdatePayloadType,
  EventInsertPayloadType,
} from "@/server/models";
import { eq } from "drizzle-orm";

export abstract class EventService {
  static async insertOneEvent(
    payload: EventInsertPayloadType
  ): Promise<EventType> {
    const eventList = await db.insert(eventTable).values(payload).returning();

    return eventList[0];
  }

  static async getEvent(event_id: number): Promise<EventType> {
    const eventList = await db
      .select()
      .from(eventTable)
      .where(eq(eventTable.event_id, event_id));

    return eventList[0];
  }

  static async getEvents(channel_id: number): Promise<EventType[]> {
    const eventList = await db
      .select()
      .from(eventTable)
      .where(eq(eventTable.channel_id, channel_id));

    return eventList;
  }

  static async updateEvent(
    payload: EventUpdatePayloadType,
    event_id: number
  ): Promise<EventType> {
    const eventList = await db
      .update(eventTable)
      .set(payload)
      .where(eq(eventTable.event_id, event_id))
      .returning();

    return eventList[0];
  }

  static async deleteEvent(event_id: number): Promise<EventType> {
    const eventList = await db
      .delete(eventTable)
      .where(eq(eventTable.event_id, event_id))
      .returning();

    return eventList[0];
  }

  static toSafeEventType(event: EventType): SafeEventType {
    const { updated_at, ...restOfEvent } = event;

    return restOfEvent;
  }
}
