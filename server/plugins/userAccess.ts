import Elysia from "elysia";
import { ContextWithUser } from "../types";
import { ServerService } from "../services";
import { ForbiddenError, ParamsValidationError } from "../errors";

export const userAccessPlugin = (app: Elysia) => {
  return app.derive({ as: "global" }, async (context) => {
    const contextWithUser = context as ContextWithUser;

    if (context.params["server_id"] < 1)
      throw new ParamsValidationError([
        { path: "server_id", message: "Invalid value." },
      ]);

    const server = await ServerService.getServer(context.params["server_id"]);

    if (!server)
      throw new ParamsValidationError(
        [{ path: "server_id", message: "Invalid value." }],
        "Server not found."
      );

    const serverUser = await ServerService.getServerUserByServerAndUserId(
      contextWithUser.user.user_id,
      context.params["server_id"]
    );

    if (!serverUser)
      throw new ForbiddenError("User cannot access this server.");

    return { server, serverUser };
  });
};
