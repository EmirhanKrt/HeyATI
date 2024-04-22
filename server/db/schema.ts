import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

const created_at = timestamp("created_at").notNull().defaultNow();
const updated_at = timestamp("updated_at")
  .notNull()
  .defaultNow()
  .$onUpdateFn(() => sql`now()`);

export const userTable = pgTable(
  "User",
  {
    user_id: serial("user_id").primaryKey().notNull(),
    user_name: text("user_name").unique().notNull(),
    user_email: text("user_email").unique().notNull(),
    user_password: text("user_password").notNull(),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    updated_at,
    created_at,
  },
  (table) => {
    return {
      user_user_name_index: uniqueIndex("user_user_name_index").on(
        table.user_name
      ),
      user_user_email_index: uniqueIndex("user_user_email_index").on(
        table.user_email
      ),
    };
  }
);

export const serverTable = pgTable("Server", {
  server_id: serial("server_id").primaryKey().notNull(),
  server_name: text("server_name").notNull(),
  creator_id: integer("creator_id")
    .notNull()
    .references(() => userTable.user_id),
  updated_at,
  created_at,
});

export const serverInviteCodeTable = pgTable(
  "ServerInviteCode",
  {
    server_invite_code_id: serial("server_invite_code_id")
      .primaryKey()
      .notNull(),
    server_id: integer("server_id")
      .notNull()
      .references(() => serverTable.server_id),
    creator_id: integer("creator_id")
      .notNull()
      .references(() => userTable.user_id),
    server_invite_code: uuid("server_invite_code")
      .unique()
      .notNull()
      .defaultRandom(),
    max_use_count: integer("max_use_count").notNull().default(100),
    due_date: timestamp("due_date")
      .notNull()
      .default(sql`now() + interval '1 month'`),
    total_use_count: integer("total_use_count").notNull().default(0),
    is_in_use: boolean("is_in_use").notNull().default(true),
    updated_at,
    created_at,
  },
  (table) => {
    return {
      invite_code_server_invite_code_index: uniqueIndex(
        "invite_code_server_invite_code_index"
      ).on(table.server_invite_code),
      invite_code_server_id_index: index("invite_code_server_id_index").on(
        table.server_id
      ),
      invite_code_user_id_index: index("invite_code_user_id_index").on(
        table.creator_id
      ),
    };
  }
);

export const roleType = pgEnum("role_type", [
  "creator",
  "administrator",
  "moderator",
  "user",
]);

export const serverUserTable = pgTable(
  "ServerUser",
  {
    server_id: integer("server_id")
      .notNull()
      .references(() => serverTable.server_id),
    user_id: integer("user_id")
      .notNull()
      .references(() => userTable.user_id),
    server_invite_code_id: integer("server_invite_code_id").references(
      () => serverInviteCodeTable.server_invite_code_id
    ),
    is_user_kicked: boolean("is_user_kicked").notNull().default(false),
    is_user_banned: boolean("is_user_banned").notNull().default(false),
    user_banned_until_date: timestamp("user_banned_until_date"),
    role: roleType("role"),
    updated_at,
    created_at,
  },
  (table) => ({
    server_user_id: primaryKey({
      name: "server_user_id",
      columns: [table.server_id, table.user_id],
    }),
    server_user_server_id_index: index("server_user_server_id_index").on(
      table.server_id
    ),
    server_user_user_id_index: index("server_user_user_id_index").on(
      table.user_id
    ),
  })
);

export const channelTable = pgTable(
  "Channel",
  {
    channel_id: serial("channel_id").primaryKey().notNull(),
    channel_name: text("channel_name").notNull(),
    server_id: integer("server_id")
      .notNull()
      .references(() => serverTable.server_id),
    creator_id: integer("creator_id")
      .notNull()
      .references(() => userTable.user_id),
    updated_at,
    created_at,
  },
  (table) => ({
    channel_server_id_index: index("channel_server_id_index").on(
      table.server_id
    ),
  })
);

export const messageReceiverType = pgEnum("receiver_type", [
  "server_channel",
  "private_channel",
]);

export const messageTable = pgTable(
  "Message",
  {
    message_id: serial("message_id").primaryKey().notNull(),
    message_content: text("message_content").notNull(),
    message_file: text("message_file"),
    sender_id: integer("sender_id")
      .notNull()
      .references(() => userTable.user_id),
    receiver_type: messageReceiverType("receiver_type"),
    receiver_id: integer("receiver_id").notNull(),
    replied_message_id: integer("replied_message_id"),
    updated_at,
    created_at,
  },
  (table) => ({
    message_receiver_id_index: index("message_receiver_id_index").on(
      table.receiver_id
    ),
  })
);

export const eventTable = pgTable(
  "Event",
  {
    event_id: serial("event_id").primaryKey().notNull(),
    event_title: text("event_title").notNull(),
    event_description: text("event_description").notNull(),
    creator_id: integer("creator_id")
      .notNull()
      .references(() => userTable.user_id),
    channel_id: integer("channel_id")
      .notNull()
      .references(() => channelTable.channel_id),
    event_start_date: timestamp("event_start_date").notNull(),
    event_finish_date: timestamp("event_finish_date").notNull(),
    updated_at,
    created_at,
  },
  (table) => ({
    event_channel_id_index: index("event_channel_id_index").on(
      table.channel_id
    ),
  })
);
