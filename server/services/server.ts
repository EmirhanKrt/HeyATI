import { and, eq } from "drizzle-orm";
import db from "@/server/db";
import { serverTable, serverUserTable } from "@/server/db/schema";
import {
  SafeServerType,
  ServerInsertPayloadType,
  ServerType,
  ServerUpdatePayloadType,
} from "@/server/models";

export abstract class ServerService {
  static async insertOneServer(
    payload: ServerInsertPayloadType
  ): Promise<ServerType> {
    const serverList = await db.insert(serverTable).values(payload).returning();

    return serverList[0];
  }

  static async getServer(server_id: number): Promise<ServerType> {
    const serverList = await db
      .select()
      .from(serverTable)
      .where(eq(serverTable.server_id, server_id));

    return serverList[0];
  }

  static async updateServer(
    payload: ServerUpdatePayloadType,
    server_id: number
  ): Promise<ServerType> {
    const serverList = await db
      .update(serverTable)
      .set(payload)
      .where(eq(serverTable.server_id, server_id))
      .returning();

    return serverList[0];
  }

  static async deleteServer(server_id: number): Promise<ServerType> {
    const serverList = await db
      .delete(serverTable)
      .where(eq(serverTable.server_id, server_id))
      .returning();

    return serverList[0];
  }

  static async getServerUserByServerAndUserId(
    user_id: number,
    server_id: number
  ) {
    const serverUserList = await db
      .select()
      .from(serverUserTable)
      .where(
        and(
          eq(serverUserTable.user_id, user_id),
          eq(serverUserTable.server_id, server_id)
        )
      );

    if (serverUserList.length === 1) {
      return serverUserList[0];
    }

    return null;
  }

  static async getServerListByUserId(user_id: number) {
    const serverList = await db
      .select({
        server_id: serverTable.server_id,
        server_name: serverTable.server_name,
        server_description: serverTable.server_description,
        owner_id: serverTable.owner_id,
        updated_at: serverTable.updated_at,
        created_at: serverTable.created_at,
      })
      .from(serverUserTable)
      .innerJoin(
        serverTable,
        eq(serverUserTable.server_id, serverTable.server_id)
      )
      .where(
        and(
          eq(serverUserTable.user_id, user_id),
          eq(serverUserTable.is_user_active, true)
        )
      );

    return serverList;
  }

  static toSafeServerType(server: ServerType): SafeServerType {
    const { updated_at, ...restOfServer } = server;

    return restOfServer;
  }
}
