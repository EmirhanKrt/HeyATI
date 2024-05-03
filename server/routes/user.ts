import Elysia from "elysia";
import { userTable } from "@/server/db/schema";
import { userModel } from "@/server/models";
import { ContextWithUser } from "@/server/types";
import { UserService } from "@/server/services";
import { ParamsValidationError } from "@/server/errors";
import { privateMessageRoutes } from "./privateMessage";

export const userRoutes = new Elysia({
  name: "user-routes",
  prefix: "/user",
})
  .use(userModel)
  .guard({
    response: "user.all.response.body",
  })
  .get("/me", async (context) => {
    const contextWithUser = context as ContextWithUser;

    const matchedUser = await UserService.getUserByUserID(
      contextWithUser.user.user_id
    );

    return {
      success: true,
      message: "Retrived user succefully.",
      data: {
        user: UserService.toSafeUserType(matchedUser!),
      },
    };
  })
  .put(
    "/me",
    async (context) => {
      const contextWithUser = context as ContextWithUser;

      const matchedUser = await UserService.getUserByUserID(
        contextWithUser.user.user_id
      );

      const updatedUser = await UserService.updateUser(
        context.body,
        matchedUser!
      );

      return {
        success: true,
        message: "Updated user succefully.",
        data: {
          user: UserService.toSafeUserType(updatedUser),
        },
      };
    },
    {
      body: "user.put.me.request.body",
    }
  )
  .group(`/:${userTable.user_name.name}`, (app) =>
    app
      .guard({
        params: "user.all.user_name.request.params",
      })
      .resolve(async (context) => {
        const matchedUser = await UserService.getUserByUserName(
          context.params.user_name
        );

        if (!matchedUser)
          throw new ParamsValidationError(
            [{ path: "user_name", message: "Invalid value." }],
            "User not found."
          );

        return { receiverUser: UserService.toSafeUserType(matchedUser) };
      })
      .get("", ({ receiverUser }) => {
        return {
          success: true,
          message: "Retrived user succefully.",
          data: {
            user: receiverUser,
          },
        };
      })
      .use(privateMessageRoutes)
  );
