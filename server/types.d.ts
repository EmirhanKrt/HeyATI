import { Context } from "elysia";
import { JWTPayloadType } from "@/server/models";

export type ValidationErrorPayload = {
  path: string;
  message: string;
};

export type ValidationErrorData = {
  field: string;
  message: string;
};

export type BodyValidationErrorResponseData = {
  body: ValidationErrorData[];
};

export type ParamsValidationErrorResponseData = {
  params: ValidationErrorData[];
};

export type ValidationErrorResponseData =
  | BodyValidationErrorResponseData
  | ParamsValidationErrorResponseData;

export interface ContextWithJWT extends Context {
  jwt: {
    readonly sign: (
      morePayload: Record<string, string | number>
    ) => Promise<string>;
    readonly verify: (
      jwt?: string | undefined
    ) => Promise<false | Record<string, string | number>>;
  };
  bearer: string;
}

export interface ContextWithUser extends Context {
  user: JWTPayloadType;
}
