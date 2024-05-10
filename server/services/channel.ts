import { eq } from "drizzle-orm";
import db from "@/server/db";
import { channelTable } from "@/server/db/schema";
import {
  ChannelType,
  SafeChannelType,
  ChannelUpdatePayloadType,
  ChannelInsertPayloadType,
} from "@/server/models";

export abstract class ChannelService {
  static async insertOneChannel(
    payload: ChannelInsertPayloadType
  ): Promise<ChannelType> {
    const channelList = await db
      .insert(channelTable)
      .values(payload)
      .returning();

    return channelList[0];
  }

  static async getChannel(channel_id: number): Promise<ChannelType> {
    const channelList = await db
      .select()
      .from(channelTable)
      .where(eq(channelTable.channel_id, channel_id));

    return channelList[0];
  }

  static async getChannels(server_id: number): Promise<ChannelType[]> {
    const channelList = await db
      .select()
      .from(channelTable)
      .where(eq(channelTable.server_id, server_id));

    return channelList;
  }

  static async updateChannel(
    payload: ChannelUpdatePayloadType,
    channel_id: number
  ): Promise<ChannelType> {
    const channelList = await db
      .update(channelTable)
      .set(payload)
      .where(eq(channelTable.channel_id, channel_id))
      .returning();

    return channelList[0];
  }

  static async deleteChannel(channel_id: number): Promise<ChannelType> {
    const channelList = await db
      .delete(channelTable)
      .where(eq(channelTable.channel_id, channel_id))
      .returning();

    return channelList[0];
  }

  static toSafeChannelType(channel: ChannelType): SafeChannelType {
    const { updated_at, ...restOfChannel } = channel;

    return restOfChannel;
  }
}
