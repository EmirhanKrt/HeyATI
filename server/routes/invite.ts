import Elysia from "elysia";
import { inviteModel, SafeInviteType } from "@/server/models/invite";
import { InviteService } from "@/server/services/invite";
import { ContextWithUser } from "@/server/types";
import { ForbiddenError, ParamsValidationError } from "@/server/errors";
import { SafeServerType, SafeServerUserType } from "../models";

type ContextWithUserAndServer = ContextWithUser & {
  server: SafeServerType;
  serverUser: SafeServerUserType;
};

const createInviteRoute = new Elysia({
  name: "create-invite-route",
  prefix: "/server/:server_id/invite",
})
  .use(inviteModel)
  .post(
    "",
    async (context) => {
      const { server, user } = context as ContextWithUserAndServer;

      let now = new Date();

      let payload: { due_date: string; max_use_count: number } = {
        due_date: new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1
        ).toLocaleDateString(),
        max_use_count: 100,
      };

      if (context.body.due_date) payload.due_date = context.body.due_date;

      if (context.body.max_use_count)
        payload.max_use_count = context.body.max_use_count;

      const newInvite = await InviteService.createInvite({
        max_use_count: payload.max_use_count,
        due_date: payload.due_date,
        server_id: server.server_id,
        owner_id: user.user_id,
      });

      return {
        success: true,
        message: "Invite created successfully.",
        data: {
          invite: newInvite,
        },
      };
    },
    {
      body: "invite.post.request.body",
      response: "invite.all.response.body",
    }
  )
  .get("", async (context) => {
    const { server, user, serverUser } = context as ContextWithUserAndServer;

    if (serverUser.role === "user") {
      const invites = await InviteService.getSelfInvites(
        user.user_id,
        server.server_id
      );

      return {
        success: true,
        message: "Invites retrived successfully.",
        data: {
          invites: invites,
        },
      };
    }

    const invites = await InviteService.getServerInvites(server.server_id);

    return {
      success: true,
      message: "Invites retrived successfully.",
      data: {
        invites: invites,
      },
    };
  });

const deleteInviteRoute = new Elysia({
  name: "delete-invite-route",
  prefix: "/server/:server_id/invite/:invite_id",
})
  .use(inviteModel)
  .resolve(async (context) => {
    const { server, user, serverUser } = context as ContextWithUserAndServer;

    const invite = await InviteService.getInviteByInviteId(
      server.server_id,
      Number(context.params.invite_id)
    );

    return { invite };
  })
  .delete("", async (context) => {
    const { serverUser, invite } = context as any;

    if (serverUser.role === "user") {
      if (invite.owner_id === serverUser.user_id) {
        const deletedInvite = await InviteService.deleteInvite(
          invite.server_invite_code_id
        );

        return {
          success: true,
          message: "Invite deleted successfully.",
          data: {
            invite: deletedInvite,
          },
        };
      }

      throw new ForbiddenError("User cannot access this server.");
    }

    const deletedInvite = await InviteService.deleteInvite(
      invite.server_invite_code_id
    );

    return {
      success: true,
      message: "Invite deleted successfully.",
      data: {
        invite: deletedInvite,
      },
    };
  });

export const inviteRoutes = new Elysia({
  name: "invite-routes",
})
  .use(createInviteRoute)
  .use(deleteInviteRoute);
/*   .use(updateInviteRoute); */
