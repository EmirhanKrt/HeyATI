import Elysia from "elysia";
import { userTable } from "@/server/db/schema";
import { userModel } from "@/server/models";
import { ContextWithUser } from "@/server/types";
import { ServerService, UserService } from "@/server/services";
import { ParamsValidationError } from "@/server/errors";
import { privateMessageRoutes } from "./privateMessage";

const sameUserRoutes = new Elysia({
  name: "same-user-routes",
  prefix: "/me",
})
  .use(userModel)
  .resolve(async (context) => {
    const contextWithUser = context as ContextWithUser;

    const matchedUser = await UserService.getUserByUserName(
      contextWithUser.user.user_name
    );

    if (!matchedUser)
      throw new ParamsValidationError(
        [{ path: "user_name", message: "Invalid value." }],
        "User not found."
      );

    return { targetUser: matchedUser };
  })
  .get("", async ({ targetUser }) => {
    const serverList = await ServerService.getServerListByUserId(
      targetUser.user_id
    );

    const interactedUserList =
      await UserService.getOrderedInteractionWithUsersByUserId(
        targetUser.user_id
      );

    return {
      success: true,
      message: "Retrived user successfully.",
      data: {
        user: UserService.toSafeUserType(targetUser),
        server: serverList,
        interactedUsers: interactedUserList.map(UserService.toSafeUserType),
      },
    };
  })
  .put(
    "",
    async ({ targetUser, body }) => {
      const updatedUser = await UserService.updateUser(body, targetUser);

      return {
        success: true,
        message: "Updated user successfully.",
        data: {
          user: UserService.toSafeUserType(updatedUser),
        },
      };
    },
    {
      body: "user.put.me.request.body",
    }
  );

const otherUserRoutes = new Elysia({
  name: "other-user-routes",
  prefix: `/:${userTable.user_name.name}`,
})
  .use(userModel)
  .guard({
    params: "user.all.user_name.request.params",
  })
  .resolve(async (context) => {
    if (
      context.params.user_name.length < 3 ||
      context.params.user_name.length > 16
    )
      throw new ParamsValidationError(
        [{ path: "user_name", message: "Invalid value." }],
        "User not found."
      );

    const matchedUser = await UserService.getUserByUserName(
      context.params.user_name
    );

    if (!matchedUser)
      throw new ParamsValidationError(
        [{ path: "user_name", message: "Invalid value." }],
        "User not found."
      );

    return { targetUser: UserService.toSafeUserType(matchedUser) };
  })
  .get("", ({ targetUser }) => {
    return {
      success: true,
      message: "Retrived user successfully.",
      data: {
        user: targetUser,
      },
    };
  })
  .use(privateMessageRoutes);

export const userRoutes = new Elysia({
  name: "user-routes",
  prefix: "/user",
})
  .use(userModel)
  .guard({
    response: "user.all.response.body",
  })
  .use(sameUserRoutes)
  .use(otherUserRoutes);
