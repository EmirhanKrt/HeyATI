import Elysia, { NotFoundError, t } from "elysia";
import { fileTable, privateMessageTable } from "@/server/db/schema";
import {
  FileInsertPayloadType,
  fileModel,
  privateMessageModel,
  PrivateMessageSuccessResponseBodyDataType,
  PrivateMessageType,
  SafeFileType,
  SafeUserType,
} from "@/server/models";
import { ContextWithUser } from "@/server/types";
import { FileService, PrivateMessageService } from "@/server/services";
import { ParamsValidationError } from "@/server/errors";

type ContextWithSenderAndReceiverUser = ContextWithUser & {
  receiverUser: SafeUserType;
};

type ContextWithMessage = ContextWithSenderAndReceiverUser & {
  message: PrivateMessageType;
};

const privateMessageFileRoutes = new Elysia({
  name: "private-message-file-routes",
})
  .use(fileModel)
  .guard({
    params: "file.all.file_id.request.params",
  })
  .get("", async (context) => {
    const { message } = context as ContextWithMessage;

    const file = await PrivateMessageService.getFileByMessageId(
      message.private_message_id,
      context.params.file_id
    );

    if (!file || !Bun.file(`./bucket/files/${file.file_path}`)) {
      throw new NotFoundError("File not found on bucket.");
    }

    context.set.headers["Content-Type"] = file.file_type;
    context.set.headers[
      "Content-Disposition"
    ] = `attachment; filename=${file.file_name}`;

    return Bun.file(`./bucket/files/${file.file_path}`);
  });

export const privateMessageRoutes = new Elysia({
  name: "private-message-routes",
})
  .use(privateMessageModel)
  .get(
    `/messages`,
    async (context) => {
      const { user: senderUser, receiverUser } =
        context as ContextWithSenderAndReceiverUser;

      const messageList = await PrivateMessageService.getMessages(
        senderUser,
        receiverUser
      );

      return {
        success: true,
        message: "Messages retrived succefully.",
        data: {
          message: messageList,
        },
      };
    },
    { response: "private_message.index.get.response.body" }
  )
  .post(
    `/message`,
    async (context) => {
      const { user: senderUser, receiverUser } =
        context as ContextWithSenderAndReceiverUser;

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
        receiverUser,
        { replied_message_id, private_message_content }
      );

      const responseMessageData: PrivateMessageSuccessResponseBodyDataType =
        message;

      if (insertedFileList.length) {
        const messageFileList = insertedFileList.map((insertedFile) => ({
          file_id: insertedFile.file_id,
          private_message_id: message.private_message_id,
        }));

        await FileService.mapWithPrivateMessage(messageFileList);

        responseMessageData.files = insertedFileList;
      }

      return {
        success: true,
        message: "Message sent succefully.",
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
  .group(`/message/:${privateMessageTable.private_message_id.name}`, (app) =>
    app
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

        const { user: senderUser, receiverUser } =
          context as ContextWithSenderAndReceiverUser;

        const message = await PrivateMessageService.getMessage(
          senderUser,
          receiverUser,
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
      .group(`/file/:${fileTable.file_id.name}`, (app) =>
        app.use(privateMessageFileRoutes)
      )
      .get("", (context) => {
        return {
          success: true,
          message: "Message retrived successfully.",
          data: {
            message: context.message,
          },
        };
      })
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
        "",
        async (context) => {
          const { message } = context as ContextWithMessage;

          const updatedMessage = await PrivateMessageService.updateMessage(
            message.private_message_id,
            context.body.private_message_content
          );

          return {
            success: true,
            message: "Message updated successfully.",
            data: {
              message: updatedMessage,
            },
          };
        },
        {
          body: "private_message.put.message_id.request.body",
        }
      )
      .delete("", async (context) => {
        const { message } = context as ContextWithMessage;

        const deletedMessage = await PrivateMessageService.deleteMessage(
          message.private_message_id
        );

        return {
          success: true,
          message: "Message deleted successfully.",
          data: {
            message: deletedMessage,
          },
        };
      })
  );
