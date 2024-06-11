import db from "@/server/db";
import { serverInviteCodeTable } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export const InviteService = {
  async createInvite(data: any) {
    const invites = await db
      .insert(serverInviteCodeTable)
      .values(data)
      .returning();

    return invites[0];
  },

  async updateInvite(data: any, invite_id: number) {
    const updatedInvite = await db
      .update(serverInviteCodeTable)
      .set(data)
      .where(eq(serverInviteCodeTable.server_invite_code_id, invite_id))
      .returning()
      .then((rows) => rows[0]);
    return updatedInvite;
  },

  async deleteInvite(invite_id: number) {
    const deletedInvite = await db
      .delete(serverInviteCodeTable)
      .where(eq(serverInviteCodeTable.server_invite_code_id, invite_id))
      .returning()
      .then((rows) => rows[0]);
    return deletedInvite;
  },

  async getInvite(invide_code: string) {
    const invite = await db
      .select()
      .from(serverInviteCodeTable)
      .where(
        and(
          eq(serverInviteCodeTable.server_invite_code, invide_code),
          eq(serverInviteCodeTable.is_in_use, true)
        )
      );

    return invite[0];
  },

  async getInviteByInviteId(server_id: number, server_invite_code_id: number) {
    const invite = await db
      .select()
      .from(serverInviteCodeTable)
      .where(
        and(
          eq(serverInviteCodeTable.server_id, server_id),
          eq(
            serverInviteCodeTable.server_invite_code_id,
            server_invite_code_id
          ),
          eq(serverInviteCodeTable.is_in_use, true)
        )
      );

    return invite[0];
  },

  async getSelfInvites(user_id: number, server_id: number) {
    const invite = await db
      .select()
      .from(serverInviteCodeTable)
      .where(
        and(
          eq(serverInviteCodeTable.owner_id, user_id),
          eq(serverInviteCodeTable.server_id, server_id),
          eq(serverInviteCodeTable.is_in_use, true)
        )
      );

    return invite;
  },

  async getServerInvites(server_id: number) {
    const invite = await db
      .select()
      .from(serverInviteCodeTable)
      .where(
        and(
          eq(serverInviteCodeTable.server_id, server_id),
          eq(serverInviteCodeTable.is_in_use, true)
        )
      );

    return invite;
  },
};
