import Elysia from "elysia";
import {
  AuthLoginRequestBodyType,
  AuthRegisterAndLoginSuccessResponseType,
  AuthRegisterRequestBodyType,
  authModel,
} from "@/server/models";
import { getBaseUrl } from "@/lib/api";
import { ContextWithJWT } from "@/server/types";
import { AuthService, UserService } from "@/server/services";

export const authRoutes = new Elysia({ name: "auth-routes", prefix: "/auth" })
  .onBeforeHandle(async (context) => {
    const contextWithJWT = context as ContextWithJWT;

    if (contextWithJWT.bearer) {
      const user = await contextWithJWT.jwt.verify(contextWithJWT.bearer);

      if (user) contextWithJWT.set.redirect = getBaseUrl() + "/";
    }
  })
  .use(authModel)
  .post(
    "/login/",
    async (context): Promise<AuthRegisterAndLoginSuccessResponseType> => {
      const contextWithJWT = context as ContextWithJWT;

      const loginPayload = contextWithJWT.body as AuthLoginRequestBodyType;

      const user = await AuthService.logInUser(loginPayload);

      const token = await contextWithJWT.jwt.sign(
        UserService.toJWTPayloadType(user)
      );

      return {
        success: true,
        message: "User logged in successfully!",
        data: {
          user: UserService.toSafeUserType(user),
          token,
        },
      };
    },
    {
      body: "auth.post.login.request.body",
      response: "auth.post.login.response.body",
    }
  )
  .post(
    "/register/",
    async (context): Promise<AuthRegisterAndLoginSuccessResponseType> => {
      const contextWithJWT = context as ContextWithJWT;

      const registerPayload =
        contextWithJWT.body as AuthRegisterRequestBodyType;

      const user = await AuthService.registerUser(registerPayload);

      const token = await contextWithJWT.jwt.sign(
        UserService.toJWTPayloadType(user)
      );

      return {
        success: true,
        message: "User registered successfully!",
        data: {
          user: UserService.toSafeUserType(user),
          token,
        },
      };
    },
    {
      body: "auth.post.register.request.body",
      response: "auth.post.register.response.body",
    }
  );
