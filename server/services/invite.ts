/* import db from "@/server/db";
import { InviteType } from "@/server/models/invite";
import { serverInviteCodeTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const InviteService = {
  async createInvite(data: Partial<InviteType>) {
    const invite = await db
      .insert(serverInviteCodeTable)
      .values(data)
      .returning()
      .then(rows => rows[0]);
    return invite;
  },

  async updateInvite(data: Partial<InviteType>, invite_id: number) {
    const updatedInvite = await db
      .update(serverInviteCodeTable)
      .set(data)
      .where(eq(serverInviteCodeTable.server_invite_code_id, invite_id))
      .returning()
      .then(rows => rows[0]);
    return updatedInvite;
  },

  async deleteInvite(invite_id: number) {
    const deletedInvite = await db
      .delete(serverInviteCodeTable)
      .where(eq(serverInviteCodeTable.server_invite_code_id, invite_id))
      .returning()
      .then(rows => rows[0]);
    return deletedInvite;
  },

  async getInvite(invite_id: number) {
    const invite = await db
      .select()
      .from(serverInviteCodeTable)
      .where(eq(serverInviteCodeTable.server_invite_code_id, invite_id))
      .then(rows => rows[0]);
    return invite;
  },

  toSafeInviteType(invite: InviteType) {
    return invite;
  },
};
 */
