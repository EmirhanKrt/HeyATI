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
  index,
} from "drizzle-orm/pg-core";

const created_at = timestamp("created_at", { mode: "string" })
  .notNull()
  .defaultNow();

const updated_at = timestamp("updated_at", { mode: "string" })
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
  server_description: text("server_description").notNull().default(""),
  owner_id: integer("owner_id")
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
      .references(() => serverTable.server_id, { onDelete: "cascade" }),
    owner_id: integer("owner_id")
      .notNull()
      .references(() => userTable.user_id),
    server_invite_code: uuid("server_invite_code")
      .unique()
      .notNull()
      .defaultRandom(),
    max_use_count: integer("max_use_count").notNull().default(100),
    due_date: timestamp("due_date", { mode: "string" })
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
    };
  }
);

export const roleType = pgEnum("role_type", [
  "owner",
  "administrator",
  "moderator",
  "user",
]);

export const serverUserTable = pgTable(
  "ServerUser",
  {
    server_user_id: serial("server_user_id").primaryKey().notNull(),
    server_id: integer("server_id")
      .notNull()
      .references(() => serverTable.server_id, { onDelete: "cascade" }),
    user_id: integer("user_id")
      .notNull()
      .references(() => userTable.user_id),
    server_invite_code_id: integer("server_invite_code_id").references(
      () => serverInviteCodeTable.server_invite_code_id
    ),
    role: roleType("role").default("user").notNull(),
    is_user_active: boolean("is_user_active").notNull().default(true),
    is_user_banned: boolean("is_user_banned").notNull().default(false),
    user_banned_until_date: timestamp("user_banned_until_date", {
      mode: "string",
    }),
    updated_at,
    created_at,
  },
  (table) => ({
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
      .references(() => serverTable.server_id, { onDelete: "cascade" }),
    owner_id: integer("owner_id")
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

export const privateMessageTable = pgTable(
  "PrivateMessage",
  {
    private_message_id: serial("private_message_id").primaryKey().notNull(),
    private_message_content: text("private_message_content").notNull(),
    sender_id: integer("sender_id")
      .notNull()
      .references(() => userTable.user_id),
    receiver_id: integer("receiver_id")
      .notNull()
      .references(() => userTable.user_id),
    replied_message_id: integer("replied_message_id"),
    is_edited: boolean("is_edited").notNull().default(false),
    updated_at,
    created_at,
  },
  (table) => ({
    private_message_receiver_id_index: index(
      "private_message_receiver_id_index"
    ).on(table.receiver_id),
  })
);

export const channelMessageTable = pgTable(
  "ChannelMessage",
  {
    channel_message_id: serial("channel_message_id").primaryKey().notNull(),
    channel_message_content: text("channel_message_content").notNull(),
    sender_id: integer("sender_id")
      .notNull()
      .references(() => userTable.user_id),
    channel_id: integer("channel_id")
      .notNull()
      .references(() => channelTable.channel_id, { onDelete: "cascade" }),
    replied_message_id: integer("replied_message_id"),
    is_edited: boolean("is_edited").notNull().default(false),
    updated_at,
    created_at,
  },
  (table) => ({
    channel_message_channel_id_index: index(
      "channel_message_channel_id_index"
    ).on(table.channel_id),
  })
);

export const eventTable = pgTable(
  "Event",
  {
    event_id: serial("event_id").primaryKey().notNull(),
    event_title: text("event_title").notNull(),
    event_description: text("event_description").notNull(),
    owner_id: integer("owner_id")
      .notNull()
      .references(() => userTable.user_id),
    channel_id: integer("channel_id")
      .notNull()
      .references(() => channelTable.channel_id, { onDelete: "cascade" }),
    event_start_date: timestamp("event_start_date", {
      mode: "string",
    }).notNull(),
    event_finish_date: timestamp("event_finish_date", {
      mode: "string",
    }).notNull(),
    updated_at,
    created_at,
  },
  (table) => ({
    event_channel_id_index: index("event_channel_id_index").on(
      table.channel_id
    ),
  })
);
