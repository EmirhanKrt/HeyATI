import Elysia from "elysia";
import { channelTable, serverTable } from "@/server/db/schema";
import { ChannelUpdatePayloadType, channelModel } from "@/server/models";
import { ContextWithUser } from "@/server/types";
import { ChannelService, ServerService } from "@/server/services";
import { BodyValidationError, ParamsValidationError } from "@/server/errors";

export const channelRoutes = new Elysia({
  name: "channel-routes",
  prefix: `/server/:server_id/channel`,
})
  .use(channelModel)
  .post("/", async (context) => {

    const contextWithUser = context as ContextWithUser;

    const channel = await ChannelService.insertOneChannel({
      channel_name: context.body.channel_name,
      server_id: parseInt(context.params.server_id),
      owner_id: contextWithUser.user.user_id,
    });

    return {
      success: true,
      message: "Channel created successfully.",
      data: { 
        channel: ChannelService.toSafeChannelType(channel!) 
      },
    };
  },  
  { 
    body: "channel.post.index.request.body",
    response: "channel.post.index.response.body", 
  })
  .get(`/:${channelTable.channel_id.name}`, async ({params: {channel_id, server_id}}) => {
      const matchedChannel = await ChannelService.getChannel(channel_id);
      const matchedServer = await ServerService.getServer(server_id);

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
        return {
          success: true,
          message: "Retrived channel succefully.",
          data: {
            channel: ChannelService.toSafeChannelType(matchedChannel),
          },
        };
      },
    {
      params: "channel.channel_id.request.params",
      response: "channel.post.index.response.body", 
    })
  .put(`/:${channelTable.channel_id.name}`, async ({ body, params: {channel_id} }) => {
            if (!Object.keys(body).length)
              throw new BodyValidationError(
                [
                  { path: "channel_name", message: "Invalid value." },
                ],
                "For update the channel details, channel name  must be provided."
              );

            const updatePayload = {
              ...body,
            } as ChannelUpdatePayloadType;

            const updatedChannel = await ChannelService.updateChannel(
              updatePayload,
              channel_id,
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
        .delete(`/:${channelTable.channel_id.name}`, async ({params: {channel_id}}) => {
          const deletedChannel = await ChannelService.deleteChannel(
            channel_id
          );

          return {
            success: true,
            message: "Deleted channel successfully.",
            data: {
              channel: ChannelService.toSafeChannelType(deletedChannel),
            },
          };
        }, {
          response: "channel.channel_id.response.body",
          params: "channel.channel_id.request.params",
        });
