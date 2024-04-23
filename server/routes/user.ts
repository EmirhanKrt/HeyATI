import Elysia from "elysia";
import { userTable } from "@/server/db/schema";
import { userModel } from "@/server/models";
import { ContextWithUser } from "@/server/types";
import { UserService } from "@/server/services";
import { ParamsValidationError } from "@/server/errors";

export const userRoutes = new Elysia({
  name: "user-routes",
  prefix: "/user",
})
  .use(userModel)
  .get(
    "/me/",
    async (context) => {
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
    },
    {
      response: "user.get.me.response.body",
    }
  )
  .get(
    `/:${userTable.user_name.name}/`,
    async ({ params: { user_name } }) => {
      const matchedUser = await UserService.getUserByUserName(user_name);

      if (!matchedUser) {
        throw new ParamsValidationError(
          [{ path: "user_name", message: "Invalid value." }],
          "User not found."
        );
      }

      return {
        success: true,
        message: "Retrived user succefully.",
        data: {
          user: UserService.toSafeUserType(matchedUser),
        },
      };
    },
    {
      params: "user.get.user_name.request.params",
      response: "user.get.user_name.response.body",
    }
  );
