import Elysia from "elysia";
import {
  fileTable,
  channelMessageTable,
  channelTable,
} from "@/server/db/schema";
import {
  FileInsertPayloadType,
  fileModel,
  FileType,
  channelMessageModel,
  ChannelMessageSuccessResponseBodyDataType,
  ChannelMessageType,
  SafeFileType,
  SafeChannelType,
} from "@/server/models";
import { ContextWithUser } from "@/server/types";
import {
  FileService,
  ChannelMessageService,
  ChannelService,
} from "@/server/services";
import { ParamsValidationError } from "@/server/errors";
import WebSocketManager from "../websocket-data";

type ContextWithSenderAndTargetChannel = ContextWithUser & {
  channel: SafeChannelType;
};

type ContextWithMessage = ContextWithSenderAndTargetChannel & {
  message: ChannelMessageType & { files: SafeFileType[] };
};

type ContextWithFile = ContextWithMessage & {
  file: FileType;
};

const getChannelMessagesRoute = new Elysia({
  name: "get-channel-messages-route",
})
  .use(channelMessageModel)
  .get(
    `/messages`,
    async (context) => {
      const { channel } = context as ContextWithSenderAndTargetChannel;

      const messageList = await ChannelMessageService.getMessages(channel);

      return {
        success: true,
        message: "Messages retrived successfully.",
        data: {
          message: messageList,
        },
      };
    },
    { response: "channel_message.index.get.response.body" }
  );

const channelMessageFileRoutes = new Elysia({
  name: "channel-message-file-routes",
  prefix: `/:${channelMessageTable.channel_message_id.name}/file`,
})
  .use(fileModel)
  .guard({
    params: "file.all.file_id.request.params",
  })
  .resolve(async (context) => {
    if (context.params.file_id < 1)
      throw new ParamsValidationError(
        [{ path: "file_id", message: "Invalid value." }],
        "File not found."
      );

    const { message } = context as ContextWithMessage;

    const file = await ChannelMessageService.getFileByMessageId(
      message.channel_message_id,
      context.params.file_id
    );

    if (!file) {
      throw new ParamsValidationError(
        [{ path: "file_id", message: "Invalid value." }],
        "File not found."
      );
    }

    const isFileExistsOnBucket = await Bun.file(
      `./bucket/files/${file.file_path}`
    ).exists();

    if (!isFileExistsOnBucket) {
      throw new ParamsValidationError(
        [{ path: "file_id", message: "Invalid value." }],
        "File not found."
      );
    }

    return { file };
  })
  .get(`/:${fileTable.file_id.name}`, async (context) => {
    const { file } = context as ContextWithFile;

    context.set.headers["Content-Type"] = file.file_type;
    context.set.headers[
      "Content-Disposition"
    ] = `attachment; filename=${file.file_name}`;

    return Bun.file(`./bucket/files/${file.file_path}`);
  });

const crudChannelMessageRoutes = new Elysia({
  name: "crud-channel-message-routes",
  prefix: "/message",
})
  .use(channelMessageModel)
  .post(
    "",
    async (context) => {
      const { user: senderUser, channel } =
        context as ContextWithSenderAndTargetChannel;

      const { files, replied_message_id, channel_message_content } =
        context.body;

      const insertedFileList: SafeFileType[] = [];

      if (files) {
        const fileDataList: FileInsertPayloadType[] = [];

        for (const file of files) {
          const fileData = await FileService.saveToBucket(file);

          fileDataList.push(fileData);
        }

        const insertedFiles = await FileService.insertFiles(fileDataList);

        insertedFileList.push(...insertedFiles.map(FileService.toSafeFileType));
      }

      const message = await ChannelMessageService.sendMessage(
        senderUser,
        channel,
        { replied_message_id, channel_message_content }
      );

      const responseMessageData: ChannelMessageSuccessResponseBodyDataType = {
        ...message,
        files: [],
      };

      if (insertedFileList.length) {
        const messageFileList = insertedFileList.map((insertedFile) => ({
          file_id: insertedFile.file_id,
          channel_message_id: message.channel_message_id,
        }));

        await FileService.mapWithChannelMessage(messageFileList);

        responseMessageData.files = insertedFileList;
      }

      return {
        success: true,
        message: "Message sent successfully.",
        data: {
          message: responseMessageData,
        },
      };
    },
    {
      type: "multipart/form-data",
      body: "channel_message.post.request.body",
      response: "channel_message.all.response.body",
    }
  )
  .guard({
    params: "channel_message.all.message_id.request.params",
    response: "channel_message.all.response.body",
  })
  .resolve(async (context) => {
    if (context.params.channel_message_id < 1)
      throw new ParamsValidationError(
        [{ path: "channel_message_id", message: "Invalid value." }],
        "Channel message not found."
      );

    const { channel } = context as ContextWithSenderAndTargetChannel;

    const message = await ChannelMessageService.getMessage(
      channel,
      context.params.channel_message_id
    );

    if (!message) {
      throw new ParamsValidationError(
        [{ path: "channel_message_id", message: "Invalid value." }],
        "Channel message not found."
      );
    }

    return { message };
  })
  .get(`/:${channelMessageTable.channel_message_id.name}`, ({ message }) => {
    return {
      success: true,
      message: "Message retrived successfully.",
      data: {
        message,
      },
    };
  })
  .use(channelMessageFileRoutes)
  .onBeforeHandle(async (context) => {
    const { user: senderUser, message } = context as ContextWithMessage;

    if (message.sender_id !== senderUser.user_id) {
      throw new ParamsValidationError(
        [{ path: "channel_message_id", message: "Invalid value." }],
        "User cannot perform the action."
      );
    }
  })
  .put(
    `/:${channelMessageTable.channel_message_id.name}`,
    async (context) => {
      const { message, channel, user } = context as ContextWithMessage;

      const fileList = await ChannelMessageService.getFilesByMessageId(
        message.channel_message_id
      );

      const updatedMessage = await ChannelMessageService.updateMessage(
        message.channel_message_id,
        context.body.channel_message_content
      );

      const responseMessageData = {
        ...updatedMessage,
        files: fileList ? fileList.map(FileService.toSafeFileType) : [],
      };

      return {
        success: true,
        message: "Message updated successfully.",
        data: {
          message: responseMessageData,
        },
      };
    },
    {
      body: "channel_message.put.message_id.request.body",
    }
  )
  .delete(
    `/:${channelMessageTable.channel_message_id.name}`,
    async (context) => {
      const { message, channel } = context as ContextWithMessage;

      const fileList = await ChannelMessageService.getFilesByMessageId(
        message.channel_message_id
      );

      const deletedMessage = await ChannelMessageService.deleteMessage(
        message.channel_message_id
      );

      if (fileList) {
        for (const file of fileList) {
          await FileService.deleteFromBucket(file);
        }
      }

      const responseMessageData = {
        ...deletedMessage,
        files: fileList ? fileList.map(FileService.toSafeFileType) : [],
      };

      return {
        success: true,
        message: "Message deleted successfully.",
        data: {
          message: responseMessageData,
        },
      };
    }
  );

export const channelMessageRoutes = new Elysia({
  name: "channel-message-routes",
  prefix: `/channel/:${channelTable.channel_id.name}`,
})
  .use(getChannelMessagesRoute)
  .use(crudChannelMessageRoutes);
