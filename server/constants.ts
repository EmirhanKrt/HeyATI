import { AccessType } from "@/server/enums";
import { PermissionObjectType } from "@/server/types";

export const PathParserPattern =
  /\/api\/(\w+)(?:\/\d+)?(?:\/(\w+))?(?:\/\d+)?(?:\/(\w+))?/;

export const UserPermissions: PermissionObjectType = {
  unknown: AccessType.no_access,

  get_server: AccessType.full_access,
  get_server_user: AccessType.full_access,
  get_server_invite: AccessType.partial_access,
  get_server_channel: AccessType.full_access,
  get_server_channel_message: AccessType.full_access,
  get_server_channel_event: AccessType.full_access,

  post_server_invite: AccessType.full_access,
  post_server_channel: AccessType.no_access,
  post_server_channel_message: AccessType.full_access,
  post_server_channel_event: AccessType.no_access,

  put_server: AccessType.no_access,
  put_server_user: AccessType.no_access,
  put_server_invite: AccessType.partial_access,
  put_server_channel: AccessType.no_access,
  put_server_channel_message: AccessType.partial_access,
  put_server_channel_event: AccessType.no_access,

  delete_server: AccessType.no_access,
  delete_server_user: AccessType.no_access,
  delete_server_invite: AccessType.partial_access,
  delete_server_channel: AccessType.no_access,
  delete_server_channel_message: AccessType.partial_access,
  delete_server_channel_event: AccessType.no_access,
};

export const ModeratorPermissions: PermissionObjectType = {
  ...UserPermissions,

  get_server_invite: AccessType.full_access,

  delete_server_user: AccessType.full_access,
  delete_server_invite: AccessType.full_access,
  delete_server_channel_message: AccessType.full_access,
};

export const AdministratorPermissions: PermissionObjectType = {
  ...ModeratorPermissions,

  post_server_channel: AccessType.full_access,
  post_server_channel_event: AccessType.full_access,

  put_server_user: AccessType.full_access,
  put_server_channel: AccessType.full_access,
  put_server_channel_event: AccessType.full_access,

  delete_server_channel: AccessType.full_access,
  delete_server_channel_event: AccessType.full_access,
};

export const OwnerPermissions: PermissionObjectType = {
  ...AdministratorPermissions,

  put_server: AccessType.full_access,
  delete_server: AccessType.full_access,
};
