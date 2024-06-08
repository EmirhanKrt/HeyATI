import Elysia, { Context } from "elysia";
import { ChannelService } from "@/server/services";
import { ParamsValidationError } from "@/server/errors";
import { SafeServerType } from "../models";

interface ContextWithServer extends Context {
  server: SafeServerType;
}

export const channelPlugin = (app: Elysia) => {
  return app.derive({ as: "global" }, async (context) => {
    const contextWithServer = context as ContextWithServer;
    const channelIdParamValidationError = new ParamsValidationError(
      [{ path: "channel_id", message: "Invalid value." }],
      "Channel not found."
    );

    if (context.params["channel_id"] < 1) throw channelIdParamValidationError;

    const channel = await ChannelService.getChannel(
      contextWithServer.server.server_id,
      context.params["channel_id"]
    );
    if (!channel) throw channelIdParamValidationError;

    return { channel };
  });
};
