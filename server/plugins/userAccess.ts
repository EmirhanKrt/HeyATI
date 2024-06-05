import Elysia from "elysia";
import { ContextWithUser, PermissionKeys, RoleType } from "@/server/types";
import { ServerService } from "@/server/services";
import { ForbiddenError, ParamsValidationError } from "@/server/errors";
import { AccessType } from "@/server/enums";
import {
  PathParserPattern,
  AdministratorPermissions,
  ModeratorPermissions,
  OwnerPermissions,
  UserPermissions,
} from "@/server/constants";

import { getBaseUrl } from "@/lib/api";

const getActionFromRequest: (request: Request) => PermissionKeys = (
  request
) => {
  const matches = request.url.split(getBaseUrl())[1].match(PathParserPattern);

  if (!matches) {
    return "unknown";
  }

  const pathParts = matches.filter(
    (part, index) => index !== 0 && part !== undefined
  );

  pathParts.unshift(request.method.toLowerCase());

  return pathParts.join("_") as PermissionKeys;
};

const getPermissions = (role: RoleType) => {
  switch (role) {
    case "owner":
      return OwnerPermissions;

    case "administrator":
      return AdministratorPermissions;

    case "moderator":
      return ModeratorPermissions;

    case "user":
      return UserPermissions;
  }
};

export const userAccessPlugin = (app: Elysia) => {
  return app.derive({ as: "global" }, async (context) => {
    const serverIdParamValidationError = new ParamsValidationError(
      [{ path: "server_id", message: "Invalid value." }],
      "Server not found."
    );

    if (context.params["server_id"] < 1) throw serverIdParamValidationError;

    const server = await ServerService.getServer(context.params["server_id"]);
    if (!server) throw serverIdParamValidationError;

    const serverUser = await ServerService.getServerUserByServerAndUserId(
      (context as ContextWithUser).user.user_id,
      context.params["server_id"]
    );
    if (!serverUser)
      throw new ForbiddenError("User cannot access this server.");

    const action = getActionFromRequest(context.request);

    const permissions = getPermissions(serverUser.role);

    if (permissions[action] === AccessType.no_access) {
      throw new ForbiddenError("User cannot perform the action.");
    }

    return { server, serverUser, permissions };
  });
};
