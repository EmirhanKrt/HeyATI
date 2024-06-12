import Elysia from "elysia";
import { fileTable, privateMessageTable } from "@/server/db/schema";
import {
  FileInsertPayloadType,
  fileModel,
  FileType,
  privateMessageModel,
  PrivateMessageSuccessResponseBodyDataType,
  PrivateMessageType,
  SafeFileType,
  SafeUserType,
} from "@/server/models";
import { ContextWithUser } from "@/server/types";
import {
  FileService,
  PrivateMessageService,
  UserService,
} from "@/server/services";
import { ParamsValidationError } from "@/server/errors";
import WebSocketManager from "../websocket-data";

type ContextWithSenderAndTargetUser = ContextWithUser & {
  targetUser: SafeUserType;
};

type ContextWithMessage = ContextWithSenderAndTargetUser & {
  message: PrivateMessageType & { files: SafeFileType[] };
};

type ContextWithFile = ContextWithMessage & {
  file: FileType;
};

const getPrivateMessagesRoute = new Elysia({
  name: "get-private-messages-route",
})
  .use(privateMessageModel)
  .get(
    `/messages`,
    async (context) => {
      const { user: senderUser, targetUser } =
        context as ContextWithSenderAndTargetUser;

      const messageList = await PrivateMessageService.getMessages(
        senderUser,
        targetUser
      );

      return {
        success: true,
        message: "Messages retrived successfully.",
        data: {
          message: messageList,
        },
      };
    },
    { response: "private_message.index.get.response.body" }
  );

const privateMessageFileRoutes = new Elysia({
  name: "private-message-file-routes",
  prefix: `/:${privateMessageTable.private_message_id.name}/file`,
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

    const file = await PrivateMessageService.getFileByMessageId(
      message.private_message_id,
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

const crudPrivateMessageRoutes = new Elysia({
  name: "crud-private-message-routes",
  prefix: "/message",
})
  .use(privateMessageModel)
  .post(
    "",
    async (context) => {
      const { user: senderUser, targetUser } =
        context as ContextWithSenderAndTargetUser;

      const { files, replied_message_id, private_message_content } =
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

      const message = await PrivateMessageService.sendMessage(
        senderUser,
        targetUser,
        { replied_message_id, private_message_content }
      );

      const responseMessageData: PrivateMessageSuccessResponseBodyDataType = {
        ...message,
        files: [],
      };

      if (insertedFileList.length) {
        const messageFileList = insertedFileList.map((insertedFile) => ({
          file_id: insertedFile.file_id,
          private_message_id: message.private_message_id,
        }));

        await FileService.mapWithPrivateMessage(messageFileList);

        responseMessageData.files = insertedFileList;
      }

      const wsManager = await WebSocketManager;

      const websocket = wsManager.getUserConnection(targetUser.user_name);

      const user = await UserService.getUserByUserID(senderUser.user_id);

      if (websocket) {
        websocket.socket.send(
          JSON.stringify({
            success: true,
            message: "Message sent successfully.",
            data: {
              type: "post_private_message",
              user: user,
              message: responseMessageData,
            },
          })
        );
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
      body: "private_message.post.request.body",
      response: "private_message.all.response.body",
    }
  )
  .guard({
    params: "private_message.all.message_id.request.params",
    response: "private_message.all.response.body",
  })
  .resolve(async (context) => {
    if (context.params.private_message_id < 1)
      throw new ParamsValidationError(
        [{ path: "private_message_id", message: "Invalid value." }],
        "Private message not found."
      );

    const { user: senderUser, targetUser } =
      context as ContextWithSenderAndTargetUser;

    const message = await PrivateMessageService.getMessage(
      senderUser,
      targetUser,
      context.params.private_message_id
    );

    if (!message) {
      throw new ParamsValidationError(
        [{ path: "private_message_id", message: "Invalid value." }],
        "Private message not found."
      );
    }

    return { message };
  })
  .get(`/:${privateMessageTable.private_message_id.name}`, ({ message }) => {
    return {
      success: true,
      message: "Message retrived successfully.",
      data: {
        message,
      },
    };
  })
  .use(privateMessageFileRoutes)
  .onBeforeHandle(async (context) => {
    const { user: senderUser, message } = context as ContextWithMessage;

    if (message.sender_id !== senderUser.user_id) {
      throw new ParamsValidationError(
        [{ path: "private_message_id", message: "Invalid value." }],
        "User cannot perform the action."
      );
    }
  })
  .put(
    `/:${privateMessageTable.private_message_id.name}`,
    async (context) => {
      const { message, targetUser, user } = context as ContextWithMessage;

      const fileList = await PrivateMessageService.getFilesByMessageId(
        message.private_message_id
      );

      const updatedMessage = await PrivateMessageService.updateMessage(
        message.private_message_id,
        context.body.private_message_content
      );

      const responseMessageData = {
        ...updatedMessage,
        files: fileList ? fileList.map(FileService.toSafeFileType) : [],
      };

      const wsManager = await WebSocketManager;

      const websocket = wsManager.getUserConnection(targetUser.user_name);

      if (websocket) {
        websocket.socket.send(
          JSON.stringify({
            success: true,
            message: "Message updated successfully.",
            data: {
              type: "update_private_message",
              sender_user_name: user.user_name,
              message: responseMessageData,
            },
          })
        );
      }

      return {
        success: true,
        message: "Message updated successfully.",
        data: {
          message: responseMessageData,
        },
      };
    },
    {
      body: "private_message.put.message_id.request.body",
    }
  )
  .delete(
    `/:${privateMessageTable.private_message_id.name}`,
    async (context) => {
      const { message, user, targetUser } = context as ContextWithMessage;

      const fileList = await PrivateMessageService.getFilesByMessageId(
        message.private_message_id
      );

      const deletedMessage = await PrivateMessageService.deleteMessage(
        message.private_message_id
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

      const wsManager = await WebSocketManager;

      const websocket = wsManager.getUserConnection(targetUser.user_name);

      if (websocket) {
        websocket.socket.send(
          JSON.stringify({
            success: true,
            message: "Message deleted successfully.",
            data: {
              type: "delete_private_message",
              sender_user_name: user.user_name,
              message: responseMessageData,
            },
          })
        );
      }

      return {
        success: true,
        message: "Message deleted successfully.",
        data: {
          message: responseMessageData,
        },
      };
    }
  );

export const privateMessageRoutes = new Elysia({
  name: "private-message-routes",
})
  .use(getPrivateMessagesRoute)
  .use(crudPrivateMessageRoutes);
