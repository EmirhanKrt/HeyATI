import Elysia from "elysia";
import { channelTable } from "@/server/db/schema";
import { ChannelUpdatePayloadType, channelModel } from "@/server/models";
import { ContextWithUser } from "@/server/types";
import { ChannelService } from "@/server/services";
import { BodyValidationError } from "@/server/errors";
import { channelMessageRoutes } from "./channelMessage";
import { channelPlugin } from "../plugins";
import WebSocketManager from "../websocket-data";
import { broadcastToServer } from "@/lib/brodcastToServer";

const getChannelsRoute = new Elysia({
  name: "get-channels-route",
  prefix: "/channels",
})
  .use(channelModel)
  .get(
    "",
    async ({ params: { server_id } }) => {
      const channelList = await ChannelService.getChannels(server_id);
      return {
        success: true,
        message: "Channels retrieved successfully.",
        data: {
          channel: channelList,
        },
      };
    },
    {
      response: "channel.index.get.response.body",
      params: "channel.server_id.request.params",
    }
  );

const channelIndexRoutes = new Elysia({
  name: "channel-routes",
  prefix: `/channel`,
})
  .use(channelModel)
  .post(
    "",
    async (context) => {
      const contextWithUser = context as ContextWithUser;

      const channel = await ChannelService.insertOneChannel({
        channel_name: context.body.channel_name,
        server_id: context.params.server_id,
        owner_id: contextWithUser.user.user_id,
      });

      const wsManager = await WebSocketManager;

      broadcastToServer(
        wsManager,
        channel.server_id,
        contextWithUser.user.user_name,
        {
          success: true,
          message: "Channel created successfully.",
          data: {
            type: "post_channel",
            server_id: channel.server_id,
            channel: ChannelService.toSafeChannelType(channel!),
          },
        }
      );

      return {
        success: true,
        message: "Channel created successfully.",
        data: {
          channel: ChannelService.toSafeChannelType(channel!),
        },
      };
    },
    {
      body: "channel.post.index.request.body",
      response: "channel.post.index.response.body",
      params: "channel.server_id.request.params",
    }
  )
  .use(channelPlugin)
  .get(
    `/:${channelTable.channel_id.name}`,
    async (context) => {
      return {
        success: true,
        message: "Retrived channel successfully.",
        data: {
          channel: ChannelService.toSafeChannelType(context.channel),
        },
      };
    },
    {
      params: "channel.channel_id.request.params",
      response: "channel.post.index.response.body",
    }
  )
  .put(
    `/:${channelTable.channel_id.name}`,
    async (context) => {
      const contextWithUser = context as any;

      if (!Object.keys(context.body).length)
        throw new BodyValidationError(
          [{ path: "channel_name", message: "Invalid value." }],
          "For update the channel details, channel name must be provided."
        );

      const updatePayload = {
        ...context.body,
      } as ChannelUpdatePayloadType;

      const updatedChannel = await ChannelService.updateChannel(
        updatePayload,
        context.channel.channel_id
      );

      const wsManager = await WebSocketManager;

      broadcastToServer(
        wsManager,
        context.channel.server_id,
        contextWithUser.user.user_name,
        {
          success: true,
          message: "Updated channel successfully.",
          data: {
            type: "update_channel",
            server_id: context.channel.server_id,
            channel: ChannelService.toSafeChannelType(updatedChannel!),
          },
        }
      );

      return {
        success: true,
        message: "Updated channel successfully.",
        data: {
          channel: ChannelService.toSafeChannelType(updatedChannel),
        },
      };
    },
    {
      body: "channel.put.channel_id.request.body",
      response: "channel.post.index.response.body",
      params: "channel.channel_id.request.params",
    }
  )
  .delete(
    `/:${channelTable.channel_id.name}`,
    async (context) => {
      const contextWithUser = context as any;

      const deletedChannel = await ChannelService.deleteChannel(
        context.channel.channel_id
      );

      const wsManager = await WebSocketManager;

      broadcastToServer(
        wsManager,
        context.channel.server_id,
        contextWithUser.user.user_name,
        {
          success: true,
          message: "Deleted channel successfully.",
          data: {
            type: "delete_channel",
            server_id: context.channel.server_id,
            channel: ChannelService.toSafeChannelType(deletedChannel!),
          },
        }
      );
      return {
        success: true,
        message: "Deleted channel successfully.",
        data: {
          channel: ChannelService.toSafeChannelType(deletedChannel),
        },
      };
    },
    {
      response: "channel.channel_id.response.body",
      params: "channel.channel_id.request.params",
    }
  );

export const channelRoutes = new Elysia({
  name: "channel-routes",
  prefix: `/server/:server_id`,
})
  .use(channelIndexRoutes)
  .use(getChannelsRoute)
  .use(channelMessageRoutes);
