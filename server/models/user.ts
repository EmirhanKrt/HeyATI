import { Elysia, Static, t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { userTable } from "@/server/db/schema";
import { generateSuccessReponseBodySchema } from "@/server/utils";

const schemaRules = {
  user_name: t.String({ maxLength: 16, minLength: 3 }),
  user_email: t.String({ format: "email" }),
  user_password: t.String({ maxLength: 32, minLength: 8 }),
  first_name: t.String({ maxLength: 16, minLength: 1 }),
  last_name: t.String({ maxLength: 16, minLength: 1 }),
};

export const userSelectSchema = createSelectSchema(userTable, schemaRules);

export const userSelectSchemaWithoutSensitiveData = t.Omit(userSelectSchema, [
  "user_password",
  "updated_at",
]);

export const userInsertSchema = createInsertSchema(userTable, schemaRules);

export const userInsertSchemaWithoutUserId = t.Omit(userInsertSchema, [
  "user_id",
  "created_at",
  "updated_at",
]);

const userUpdateRequestBodySchema = t.Object({
  first_name: t.Optional(schemaRules.first_name),
  last_name: t.Optional(schemaRules.last_name),
  old_user_password: t.Optional(schemaRules.user_password),
  new_user_password: t.Optional(schemaRules.user_password),
  new_user_password_confirm: t.Optional(schemaRules.user_password),
});

const userSuccessResponseBodyDataSchema = t.Object({
  user: userSelectSchemaWithoutSensitiveData,
});

const userByUserNameRequestParamsSchema = t.Object({
  user_name: schemaRules.user_name,
});

const userMeAndUserByUserNameSuccessResponseBodySchema =
  generateSuccessReponseBodySchema(userSuccessResponseBodyDataSchema);

export type UserType = Static<typeof userSelectSchema>;

export type SafeUserType = Static<typeof userSelectSchemaWithoutSensitiveData>;

export type UserInsertType = Static<typeof userInsertSchemaWithoutUserId>;

export type UserMeAndAnyUserByUserNameSuccessResponseType = Static<
  typeof userMeAndUserByUserNameSuccessResponseBodySchema
>;

export type UserUpdatePayloadType = Static<typeof userUpdateRequestBodySchema>;

export const userModel = new Elysia().model({
  "user.all.response.body": userMeAndUserByUserNameSuccessResponseBodySchema,
  "user.put.me.request.body": userUpdateRequestBodySchema,
  "user.all.user_name.request.params": userByUserNameRequestParamsSchema,
});
