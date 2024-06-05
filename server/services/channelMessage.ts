import db from "@/server/db";
import {
  fileTable,
  channelMessageFileTable,
  channelMessageTable,
} from "@/server/db/schema";
import {
  FileType,
  JWTPayloadType,
  ChannelMessageInsertPayloadType,
  ChannelMessageSuccessResponseBodyDataType,
  ChannelMessageType,
  SafeFileType,
  SafeChannelType,
} from "@/server/models";
import { and, desc, eq, sql } from "drizzle-orm";
import { FileService } from "./file";

export abstract class ChannelMessageService {
  static async sendMessage(
    senderUser: JWTPayloadType,
    receiverChannel: SafeChannelType,
    payload: ChannelMessageInsertPayloadType
  ): Promise<ChannelMessageType> {
    const { channel_message_content, replied_message_id } = payload;

    const insertedMessage = await db
      .insert(channelMessageTable)
      .values({
        sender_id: senderUser.user_id,
        channel_id: receiverChannel.channel_id,
        channel_message_content,
        replied_message_id,
      })
      .returning();

    return insertedMessage[0];
  }

  static async getMessage(
    receiverChannel: SafeChannelType,
    channel_message_id: number
  ): Promise<ChannelMessageSuccessResponseBodyDataType> {
    const messageList = await db
      .select({
        channel_message_id: channelMessageTable.channel_message_id,
        channel_message_content: channelMessageTable.channel_message_content,
        sender_id: channelMessageTable.sender_id,
        channel_id: channelMessageTable.channel_id,
        replied_message_id: channelMessageTable.replied_message_id,
        is_edited: channelMessageTable.is_edited,
        created_at: channelMessageTable.created_at,
        updated_at: channelMessageTable.updated_at,
        files: sql`json_agg(json_build_object(
        'created_at', public."File".created_at,
        'file_id', public."File".file_id,
        'file_name', public."File".file_name,
        'file_size', public."File".file_size,
        'file_type', public."File".file_type,
        'file_path', public."File".file_path
      )
    )`,
      })
      .from(channelMessageTable)
      .leftJoin(
        channelMessageFileTable,
        eq(
          channelMessageFileTable.channel_message_id,
          channelMessageTable.channel_message_id
        )
      )
      .leftJoin(
        fileTable,
        eq(fileTable.file_id, channelMessageFileTable.file_id)
      )
      .where(
        and(
          eq(channelMessageTable.channel_message_id, channel_message_id),
          eq(channelMessageTable.channel_id, receiverChannel.channel_id)
        )
      )
      .groupBy(channelMessageTable.channel_message_id);

    return messageList[0] as ChannelMessageSuccessResponseBodyDataType;
  }

  static async getMessages(
    receiverChannel: SafeChannelType
  ): Promise<ChannelMessageSuccessResponseBodyDataType[]> {
    const messageList = await db
      .select({
        channel_message_id: channelMessageTable.channel_message_id,
        channel_message_content: channelMessageTable.channel_message_content,
        sender_id: channelMessageTable.sender_id,
        channel_id: channelMessageTable.channel_id,
        replied_message_id: channelMessageTable.replied_message_id,
        is_edited: channelMessageTable.is_edited,
        created_at: channelMessageTable.created_at,
        updated_at: channelMessageTable.updated_at,
        files: sql`json_agg(json_build_object(
        'created_at', public."File".created_at,
        'file_id', public."File".file_id,
        'file_name', public."File".file_name,
        'file_size', public."File".file_size,
        'file_type', public."File".file_type,
        'file_path', public."File".file_path
      )
    )`,
      })
      .from(channelMessageTable)
      .leftJoin(
        channelMessageFileTable,
        eq(
          channelMessageFileTable.channel_message_id,
          channelMessageTable.channel_message_id
        )
      )
      .leftJoin(
        fileTable,
        eq(fileTable.file_id, channelMessageFileTable.file_id)
      )
      .where(eq(channelMessageTable.channel_id, receiverChannel.channel_id))
      .groupBy(channelMessageTable.channel_message_id)
      .orderBy(desc(channelMessageTable.created_at));

    for (const message of messageList) {
      message.files = (message.files as SafeFileType[]).filter(
        (messageFile) => messageFile.file_id
      );
    }

    return messageList as ChannelMessageSuccessResponseBodyDataType[];
  }

  static async updateMessage(
    channel_message_id: number,
    channel_message_content: string
  ): Promise<ChannelMessageType> {
    const insertedMessage = await db
      .update(channelMessageTable)
      .set({ channel_message_content, is_edited: true })
      .where(eq(channelMessageTable.channel_message_id, channel_message_id))
      .returning();

    return insertedMessage[0];
  }

  static async deleteMessage(
    channel_message_id: number
  ): Promise<ChannelMessageType> {
    const deletedMessage = await db
      .delete(channelMessageTable)
      .where(eq(channelMessageTable.channel_message_id, channel_message_id))
      .returning();

    return deletedMessage[0];
  }

  static async getFilesByMessageId(
    channel_message_id: number
  ): Promise<FileType[] | null> {
    const channelMessageFileRow = await db
      .select()
      .from(channelMessageFileTable)
      .where(
        and(eq(channelMessageFileTable.channel_message_id, channel_message_id))
      );

    if (channelMessageFileRow.length > 0) {
      const fileIdList = channelMessageFileRow.map(
        (channelMessageFile) => channelMessageFile.file_id
      );

      return FileService.getFiles(fileIdList);
    }

    return null;
  }

  static async getFileByMessageId(
    channel_message_id: number,
    file_id: number
  ): Promise<FileType | null> {
    const channelMessageFileRow = await db
      .select()
      .from(channelMessageFileTable)
      .where(
        and(
          eq(channelMessageFileTable.channel_message_id, channel_message_id),
          eq(channelMessageFileTable.file_id, file_id)
        )
      );

    if (channelMessageFileRow.length > 0) {
      return FileService.getFile(file_id);
    }

    return null;
  }
}
