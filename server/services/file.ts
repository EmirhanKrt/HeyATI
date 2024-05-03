import db from "@/server/db";
import { fileTable, privateMessageFileTable } from "@/server/db/schema";
import {
  FileInsertPayloadType,
  FileType,
  SafeFileType,
} from "@/server/models/file";
import { eq } from "drizzle-orm";

export abstract class FileService {
  static async saveToBucket(file: File): Promise<FileInsertPayloadType> {
    const file_data = await file.arrayBuffer();

    const file_path = crypto.randomUUID() + file.name;

    await Bun.write(`./bucket/files/${file_path}`, file_data);

    return {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_path,
    };
  }

  static async insertFiles(
    fileDataList: FileInsertPayloadType[]
  ): Promise<FileType[]> {
    const files = await db.insert(fileTable).values(fileDataList).returning();

    return files;
  }

  static async getFile(file_id: number): Promise<FileType> {
    const files = await db
      .select()
      .from(fileTable)
      .where(eq(fileTable.file_id, file_id));

    return files[0];
  }

  static async mapWithPrivateMessage(
    messageFileMapped: {
      file_id: number;
      private_message_id: number | null;
    }[]
  ) {
    const files = await db
      .insert(privateMessageFileTable)
      .values(messageFileMapped)
      .returning();

    return files;
  }

  static toSafeFileType(file: FileType): SafeFileType {
    const { updated_at, ...restOfFile } = file;

    return restOfFile;
  }
}
