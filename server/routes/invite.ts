/* import Elysia from "elysia";
import { inviteModel } from "@/server/models/invite";
import { InviteService } from "@/server/services/invite";
import { ContextWithUser } from "@/server/types";
import { ParamsValidationError } from "@/server/errors";

interface CreateInviteContext extends ContextWithUser {
  body: any;
  params: {
    server_id: string;
  };
}

interface UpdateInviteContext {
  params: {
    invite_id: string;
  };
  body: any;
}

interface DeleteInviteContext {
  params: {
    invite_id: string;
  };
}

interface GetInviteContext {
  params: {
    invite_id: string;
  };
}

const createInviteRoute = new Elysia({
  name: "create-invite-route",
  prefix: "/server/:server_id/invite",
})
  .use(inviteModel)
  .post("", async (context: CreateInviteContext) => {
    const { params, body, user } = context;
    const newInvite = await InviteService.createInvite({
      ...body,
      server_id: parseInt(params.server_id, 10),
      owner_id: user.user_id,
    });
    return {
      success: true,
      message: "Invite created successfully.",
      data: {
        invite: newInvite,
      },
    };
  });

const updateInviteRoute = new Elysia({
  name: "update-invite-route",
  prefix: "/server/:server_id/invite/:invite_id",
})
  .use(inviteModel)
  .put("", async (context: UpdateInviteContext) => {
    const { params, body } = context;
    const updatedInvite = await InviteService.updateInvite(body, parseInt(params.invite_id, 10));
    return {
      success: true,
      message: "Invite updated successfully.",
      data: {
        invite: updatedInvite,
      },
    };
  })
  .delete("", async (context: DeleteInviteContext) => {
    const { params } = context;
    const deletedInvite = await InviteService.deleteInvite(parseInt(params.invite_id, 10));
    return {
      success: true,
      message: "Invite deleted successfully.",
      data: {
        invite: deletedInvite,
      },
    };
  })
  .get("", async (context: GetInviteContext) => {
    const { params } = context;
    const invite = await InviteService.getInvite(parseInt(params.invite_id, 10));
    if (!invite) {
      throw new ParamsValidationError([{ path: "invite_id", message: "Invalid value." }], "Invite not found.");
    }
    return {
      success: true,
      message: "Invite retrieved successfully.",
      data: {
        invite,
      },
    };
  });

export const inviteRoutes = new Elysia({
  name: "invite-routes",
})
  .use(createInviteRoute)
  .use(updateInviteRoute);
 */
