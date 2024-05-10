import db from "@/server/db";
import {
  fileTable,
  privateMessageFileTable,
  privateMessageTable,
} from "@/server/db/schema";
import {
  FileType,
  JWTPayloadType,
  PrivateMessageInsertPayloadType,
  PrivateMessageSuccessResponseBodyDataType,
  PrivateMessageType,
  SafeFileType,
  SafeUserType,
} from "@/server/models";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { FileService } from "./file";

export abstract class PrivateMessageService {
  static async sendMessage(
    senderUser: JWTPayloadType,
    receiverUser: SafeUserType,
    payload: PrivateMessageInsertPayloadType
  ): Promise<PrivateMessageType> {
    const { private_message_content, replied_message_id } = payload;

    const insertedMessage = await db
      .insert(privateMessageTable)
      .values({
        sender_id: senderUser.user_id,
        receiver_id: receiverUser.user_id,
        private_message_content,
        replied_message_id,
      })
      .returning();

    return insertedMessage[0];
  }

  static async getMessage(
    senderUser: JWTPayloadType,
    receiverUser: SafeUserType,
    private_message_id: number
  ): Promise<PrivateMessageSuccessResponseBodyDataType> {
    const messageList = await db
      .select({
        private_message_id: privateMessageTable.private_message_id,
        private_message_content: privateMessageTable.private_message_content,
        sender_id: privateMessageTable.sender_id,
        receiver_id: privateMessageTable.receiver_id,
        replied_message_id: privateMessageTable.replied_message_id,
        is_edited: privateMessageTable.is_edited,
        created_at: privateMessageTable.created_at,
        updated_at: privateMessageTable.updated_at,
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
      .from(privateMessageTable)
      .leftJoin(
        privateMessageFileTable,
        eq(
          privateMessageFileTable.private_message_id,
          privateMessageTable.private_message_id
        )
      )
      .leftJoin(
        fileTable,
        eq(fileTable.file_id, privateMessageFileTable.file_id)
      )
      .where(
        and(
          eq(privateMessageTable.private_message_id, private_message_id),
          or(
            and(
              eq(privateMessageTable.sender_id, senderUser.user_id),
              eq(privateMessageTable.receiver_id, receiverUser.user_id)
            ),
            and(
              eq(privateMessageTable.sender_id, receiverUser.user_id),
              eq(privateMessageTable.receiver_id, senderUser.user_id)
            )
          )
        )
      )
      .groupBy(privateMessageTable.private_message_id);

    return messageList[0] as PrivateMessageSuccessResponseBodyDataType;
  }

  static async getMessages(
    senderUser: JWTPayloadType,
    receiverUser: SafeUserType
  ): Promise<PrivateMessageSuccessResponseBodyDataType[]> {
    const messageList = await db
      .select({
        private_message_id: privateMessageTable.private_message_id,
        private_message_content: privateMessageTable.private_message_content,
        sender_id: privateMessageTable.sender_id,
        receiver_id: privateMessageTable.receiver_id,
        replied_message_id: privateMessageTable.replied_message_id,
        is_edited: privateMessageTable.is_edited,
        created_at: privateMessageTable.created_at,
        updated_at: privateMessageTable.updated_at,
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
      .from(privateMessageTable)
      .leftJoin(
        privateMessageFileTable,
        eq(
          privateMessageFileTable.private_message_id,
          privateMessageTable.private_message_id
        )
      )
      .leftJoin(
        fileTable,
        eq(fileTable.file_id, privateMessageFileTable.file_id)
      )
      .where(
        or(
          and(
            eq(privateMessageTable.sender_id, senderUser.user_id),
            eq(privateMessageTable.receiver_id, receiverUser.user_id)
          ),
          and(
            eq(privateMessageTable.sender_id, receiverUser.user_id),
            eq(privateMessageTable.receiver_id, senderUser.user_id)
          )
        )
      )
      .groupBy(privateMessageTable.private_message_id)
      .orderBy(desc(privateMessageTable.created_at));

    for (const message of messageList) {
      message.files = (message.files as SafeFileType[]).filter(
        (messageFile) => messageFile.file_id
      );
    }

    return messageList as PrivateMessageSuccessResponseBodyDataType[];
  }

  static async updateMessage(
    private_message_id: number,
    private_message_content: string
  ): Promise<PrivateMessageType> {
    const insertedMessage = await db
      .update(privateMessageTable)
      .set({ private_message_content })
      .where(eq(privateMessageTable.private_message_id, private_message_id))
      .returning();

    return insertedMessage[0];
  }

  static async deleteMessage(
    private_message_id: number
  ): Promise<PrivateMessageType> {
    const deletedMessage = await db
      .delete(privateMessageTable)
      .where(eq(privateMessageTable.private_message_id, private_message_id))
      .returning();

    return deletedMessage[0];
  }

  static async getFilesByMessageId(
    private_message_id: number
  ): Promise<FileType[] | null> {
    const privateMessageFileRow = await db
      .select()
      .from(privateMessageFileTable)
      .where(
        and(eq(privateMessageFileTable.private_message_id, private_message_id))
      );

    if (privateMessageFileRow.length > 0) {
      const fileIdList = privateMessageFileRow.map(
        (privateMessageFile) => privateMessageFile.file_id
      );

      return FileService.getFiles(fileIdList);
    }

    return null;
  }

  static async getFileByMessageId(
    private_message_id: number,
    file_id: number
  ): Promise<FileType | null> {
    const privateMessageFileRow = await db
      .select()
      .from(privateMessageFileTable)
      .where(
        and(
          eq(privateMessageFileTable.private_message_id, private_message_id),
          eq(privateMessageFileTable.file_id, file_id)
        )
      );

    if (privateMessageFileRow.length > 0) {
      return FileService.getFile(file_id);
    }

    return null;
  }
}
