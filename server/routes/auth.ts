import Elysia from "elysia";
import {
  AuthLoginRequestBodyType,
  AuthRegisterAndLoginSuccessResponseType,
  AuthRegisterRequestBodyType,
  authModel,
} from "@/server/models";
import { ContextWithJWT } from "@/server/types";
import { AuthService, UserService } from "@/server/services";

export const authRoutes = new Elysia({ name: "auth-routes", prefix: "/auth" })
  .use(authModel)
  .post(
    "/login",
    async (context): Promise<AuthRegisterAndLoginSuccessResponseType> => {
      const contextWithJWT = context as ContextWithJWT;

      const loginPayload = contextWithJWT.body as AuthLoginRequestBodyType;

      const user = await AuthService.logInUser(loginPayload);

      const token = await contextWithJWT.jwt.sign(
        UserService.toJWTPayloadType(user)
      );

      context.set.cookie = {
        token: {
          value: token,
          httpOnly: true,
          path: "/",
          priority: "high",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          secure: process.env.ENVIRONMENT === "PRODUCTION",
        },
      };

      return {
        success: true,
        message: "User logged in successfully!",
        data: {
          user: UserService.toSafeUserType(user),
        },
      };
    },
    {
      body: "auth.post.login.request.body",
      response: "auth.post.login.response.body",
    }
  )
  .post(
    "/register",
    async (context): Promise<AuthRegisterAndLoginSuccessResponseType> => {
      const contextWithJWT = context as ContextWithJWT;

      const registerPayload =
        contextWithJWT.body as AuthRegisterRequestBodyType;

      const user = await AuthService.registerUser(registerPayload);

      const token = await contextWithJWT.jwt.sign(
        UserService.toJWTPayloadType(user)
      );

      context.set.cookie = {
        token: {
          value: token,
          httpOnly: true,
          path: "/",
          priority: "high",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          secure: process.env.ENVIRONMENT === "PRODUCTION",
        },
      };

      return {
        success: true,
        message: "User registered successfully!",
        data: {
          user: UserService.toSafeUserType(user),
        },
      };
    },
    {
      body: "auth.post.register.request.body",
      response: "auth.post.register.response.body",
    }
  )
  .post("/logout", (context) => {
    context.cookie.token.set({
      value: "",
      httpOnly: true,
      path: "/",
      priority: "high",
      sameSite: "strict",
      maxAge: 0,
      secure: process.env.ENVIRONMENT === "PRODUCTION",
    });

    return {
      success: true,
      message: "User logged out successfully!",
      data: null,
    };
  });
