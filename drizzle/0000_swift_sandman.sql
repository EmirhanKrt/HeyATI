DO $$ BEGIN
 CREATE TYPE "receiver_type" AS ENUM('server_channel', 'private_channel');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "role_type" AS ENUM('creator', 'administrator', 'moderator', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Channel" (
	"channel_id" serial PRIMARY KEY NOT NULL,
	"channel_name" text NOT NULL,
	"server_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"event_id" serial PRIMARY KEY NOT NULL,
	"event_title" text NOT NULL,
	"event_description" text NOT NULL,
	"creator_id" integer NOT NULL,
	"channel_id" integer NOT NULL,
	"event_start_date" timestamp NOT NULL,
	"event_finish_date" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Message" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"message_content" text NOT NULL,
	"message_file" text,
	"sender_id" integer NOT NULL,
	"receiver_type" "receiver_type",
	"receiver_id" integer NOT NULL,
	"replied_message_id" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServerInviteCode" (
	"server_invite_code_id" serial PRIMARY KEY NOT NULL,
	"server_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"server_invite_code" uuid DEFAULT gen_random_uuid() NOT NULL,
	"max_use_count" integer DEFAULT 100 NOT NULL,
	"due_date" timestamp DEFAULT now() + interval '1 month' NOT NULL,
	"total_use_count" integer DEFAULT 0 NOT NULL,
	"is_in_use" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ServerInviteCode_server_invite_code_unique" UNIQUE("server_invite_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Server" (
	"server_id" serial PRIMARY KEY NOT NULL,
	"server_name" text NOT NULL,
	"creator_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServerUser" (
	"server_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"server_invite_code_id" integer,
	"is_user_kicked" boolean DEFAULT false NOT NULL,
	"is_user_banned" boolean DEFAULT false NOT NULL,
	"user_banned_until_date" timestamp,
	"role" "role_type",
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "server_user_id" PRIMARY KEY("server_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"user_password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_user_name_unique" UNIQUE("user_name"),
	CONSTRAINT "User_user_email_unique" UNIQUE("user_email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_server_id_index" ON "Channel" ("server_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_channel_id_index" ON "Event" ("channel_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_receiver_id_index" ON "Message" ("receiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invite_code_server_invite_code_index" ON "ServerInviteCode" ("server_invite_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invite_code_server_id_index" ON "ServerInviteCode" ("server_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invite_code_user_id_index" ON "ServerInviteCode" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_user_server_id_index" ON "ServerUser" ("server_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_user_user_id_index" ON "ServerUser" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_user_name_index" ON "User" ("user_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_user_email_index" ON "User" ("user_email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Channel" ADD CONSTRAINT "Channel_server_id_Server_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "Server"("server_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Channel" ADD CONSTRAINT "Channel_creator_id_User_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_creator_id_User_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_channel_id_Channel_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "Channel"("channel_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_User_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServerInviteCode" ADD CONSTRAINT "ServerInviteCode_server_id_Server_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "Server"("server_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServerInviteCode" ADD CONSTRAINT "ServerInviteCode_creator_id_User_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Server" ADD CONSTRAINT "Server_creator_id_User_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServerUser" ADD CONSTRAINT "ServerUser_server_id_Server_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "Server"("server_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServerUser" ADD CONSTRAINT "ServerUser_user_id_User_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServerUser" ADD CONSTRAINT "ServerUser_server_invite_code_id_ServerInviteCode_server_invite_code_id_fk" FOREIGN KEY ("server_invite_code_id") REFERENCES "ServerInviteCode"("server_invite_code_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
