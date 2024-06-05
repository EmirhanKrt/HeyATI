import { Context } from "elysia";
import {
  JWTPayloadType,
  SafeChannelType,
  SafeEventType,
  SafeServerType,
} from "@/server/models";

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
}

export interface ContextWithUser extends Context {
  user: JWTPayloadType;
}

export type RoleType = "owner" | "administrator" | "moderator" | "user";

export type PermissionKeys =
  | "unknown"
  | "get_server"
  | "get_server_user"
  | "get_server_invite"
  | "get_server_channel"
  | "get_server_channel_message"
  | "get_server_channel_event"
  | "post_server_invite"
  | "post_server_channel"
  | "post_server_channel_message"
  | "post_server_channel_event"
  | "put_server"
  | "put_server_user"
  | "put_server_invite"
  | "put_server_channel"
  | "put_server_channel_message"
  | "put_server_channel_event"
  | "delete_server"
  | "delete_server_user"
  | "delete_server_invite"
  | "delete_server_channel"
  | "delete_server_channel_message"
  | "delete_server_channel_event";

export type PermissionObjectType = {
  [key in PermissionKeys]: AccessType;
};

export type ServerDataType = {
  server_id: number;
  user_name_list: string[];
  channel_list: {
    channel_id: number;
    event_list: {
      event_id: number;
    }[];
  }[];
};

export type ServerDataListType = ServerDataType[];
