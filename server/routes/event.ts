import Elysia from "elysia";
import { eventTable } from "@/server/db/schema";
import { eventModel, EventUpdatePayloadType } from "@/server/models";
import { ContextWithUser } from "@/server/types";
import { EventService, ServerService, ChannelService } from "@/server/services";
import { BodyValidationError, ParamsValidationError } from "@/server/errors";

const getEventsRoute = new Elysia({
  name: "get-events-route",
  prefix: "/events",
})
  .use(eventModel)
  .get(
    "",
    async ({ params: { channel_id } }) => {
      const eventList = await EventService.getEvents(channel_id);

      return {
        success: true,
        message: "Events retrieved successfully.",
        data: {
          event: eventList,
        },
      };
    },
    {
      response: "event.index.get.response.body",
      params: "event.channel_id.request.params",
    }
  );

const eventIndexRoutes = new Elysia({
  name: "event-routes",
  prefix: `/event`,
})
  .use(eventModel)
  .post(
    "/",
    async (context) => {
      const contextWithUser = context as ContextWithUser;

      const event = await EventService.insertOneEvent({
        event_title: context.body.event_title,
        event_description: context.body.event_description,
        event_start_date: context.body.event_start_date,
        event_finish_date: context.body.event_finish_date,
        channel_id: context.params.channel_id,
        owner_id: contextWithUser.user.user_id,
      });
      return {
        success: true,
        message: "Event created successfully.",
        data: {
          event: EventService.toSafeEventType(event!),
        },
      };
    },
    {
      body: "event.post.index.request.body",
      response: "event.post.index.response.body",
      params: "event.channel_id.request.params",
    }
  )
  .get(
    `/:${eventTable.event_id.name}`,
    async ({ params: { channel_id, server_id, event_id } }) => {
      const matchedEvent = await EventService.getEvent(event_id);
      const matchedServer = await ServerService.getServer(server_id);
      const matchedChannel = await ChannelService.getChannel(channel_id);

      if (!matchedChannel) {
        throw new ParamsValidationError(
          [{ path: "channel_id", message: "Invalid value." }],
          "Channel not found."
        );
      }
      if (!matchedServer) {
        throw new ParamsValidationError(
          [{ path: "server_id", message: "Invalid value." }],
          "Server not found."
        );
      }
      if (!matchedEvent) {
        throw new ParamsValidationError(
          [{ path: "event_id", message: "Invalid value." }],
          "Event not found."
        );
      }
      return {
        success: true,
        message: "Retrived event successfully.",
        data: {
          event: EventService.toSafeEventType(matchedEvent),
        },
      };
    },
    {
      params: "event.event_id.request.params",
      response: "event.post.index.response.body",
    }
  )
  .put(
    `/:${eventTable.event_id.name}`,
    async ({ body, params: { event_id } }) => {
      if (!Object.keys(body).length)
        throw new BodyValidationError(
          [
            { path: "event_title", message: "Invalid value." },
            { path: "event_description", message: "Invalid value." },
          ],
          "For update the event details, event title and event description  must be provided."
        );

      const updatePayload = {
        ...body,
      } as EventUpdatePayloadType;

      const updatedEvent = await EventService.updateEvent(
        updatePayload,
        event_id
      );

      return {
        success: true,
        message: "Updated event successfully.",
        data: {
          event: EventService.toSafeEventType(updatedEvent),
        },
      };
    },
    {
      body: "event.put.event_id.request.body",
      response: "event.post.index.response.body",
      params: "event.event_id.request.params",
    }
  )
  .delete(
    `/:${eventTable.event_id.name}`,
    async ({ params: { event_id } }) => {
      const deletedEvent = await EventService.deleteEvent(event_id);

      return {
        success: true,
        message: "Deleted event successfully.",
        data: {
          event: EventService.toSafeEventType(deletedEvent),
        },
      };
    },
    {
      response: "event.event_id.response.body",
      params: "event.event_id.request.params",
    }
  );

export const eventRoutes = new Elysia({
  name: "event-routes",
  prefix: `/server/:server_id/channel/:channel_id`,
})
  .use(eventIndexRoutes)
  .use(getEventsRoute);
