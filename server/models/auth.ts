import { Elysia, Static, t } from "elysia";
import {
  userInsertSchemaWithoutUserId,
  userSelectSchema,
  userSelectSchemaWithoutSensitiveData,
} from "./user";
import { generateSuccessReponseBodySchema } from "@/server/utils";

const authRegisterRequestBodySchema = t.Object({
  ...userInsertSchemaWithoutUserId.properties,
  user_password_confirm: t.String({ maxLength: 32, minLength: 8 }),
});

const authLoginRequestBodySchema = t.Pick(userSelectSchema, [
  "user_email",
  "user_password",
]);

const authRegisterAndLoginSuccessResponseBodySchema = t.Object({
  user: userSelectSchemaWithoutSensitiveData,
});

const authRegisterAndLoginSuccessResponseSchema =
  generateSuccessReponseBodySchema(
    authRegisterAndLoginSuccessResponseBodySchema
  );

export type AuthRegisterRequestBodyType = Static<
  typeof authRegisterRequestBodySchema
>;

export type AuthLoginRequestBodyType = Static<
  typeof authLoginRequestBodySchema
>;

export type AuthRegisterAndLoginSuccessResponseType = Static<
  typeof authRegisterAndLoginSuccessResponseSchema
>;

export const authModel = new Elysia().model({
  "auth.post.register.request.body": authRegisterRequestBodySchema,
  "auth.post.register.response.body": authRegisterAndLoginSuccessResponseSchema,
  "auth.post.login.request.body": authLoginRequestBodySchema,
  "auth.post.login.response.body": authRegisterAndLoginSuccessResponseSchema,
});
