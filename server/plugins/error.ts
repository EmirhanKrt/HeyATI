import Elysia from "elysia";

import * as CustomError from "@/server/errors";
import {
  ValidationErrorPayload,
  ValidationErrorResponseData,
} from "@/server/types";

const mapMessage: (message: string) => string = (message: string) => {
  switch (true) {
    case message == "Unexpected property":
      return "Invalid property.";

    case message == "Expected union value":
    case message.includes("to match"):
      return "Invalid value.";

    case message == "Expected string":
    case message == "Required property":
      return "Input is required.";

    case message.includes("string length greater"):
      return `Input must contain at least ${
        message.split(" ").slice(-1)[0]
      } characters.`;

    case message.includes("string length less"):
      return `Input must be no longer than ${
        message.split(" ").slice(-1)[0]
      } characters.`;

    default:
      return message;
  }
};

const generateValidationErrorData: (
  errorList: ValidationErrorPayload[],
  errorOn: "params" | "body"
) => ValidationErrorResponseData = (errorList, errorOn) => {
  const errorPaths = new Set();
  const bailedErrorList: ValidationErrorPayload[] = [];

  errorList.forEach((item) => {
    if (!errorPaths.has(item.path)) {
      errorPaths.add(item.path);
      bailedErrorList.push(item);
    }
  });

  const readableErrorDataList = bailedErrorList.map(
    ({ path, message }: ValidationErrorPayload) => ({
      field: path.split("/").slice(-1)[0],
      message: mapMessage(message),
    })
  );

  switch (true) {
    case errorOn == "params":
      return {
        params: readableErrorDataList,
      };

    case errorOn == "body":
    default:
      return {
        body: readableErrorDataList,
      };
  }
};

export const errorPlugin = (app: Elysia) => {
  return app
    .error({
      ...CustomError,
    })
    .onError((handler) => {
      const success = false;
      let message = handler.error.message;
      let data = null;

      handler.set.status = 500;

      const isCustomError =
        handler.code === "ConflictError" ||
        handler.code === "ForbiddenError" ||
        handler.code === "UnauthorizedError" ||
        handler.code === "ParamsValidationError" ||
        handler.code === "BodyValidationError";

      const isValidationError =
        handler.code === "VALIDATION" ||
        handler.code === "ParamsValidationError" ||
        handler.code === "BodyValidationError";

      const isNotFoundError = handler.code === "NOT_FOUND";

      if (isCustomError) {
        handler.set.status = handler.error.statusCode;
      }

      if (isValidationError) {
        handler.set.status = 400;
        let errorOn: "params" | "body" =
          handler.code === "ParamsValidationError" ? "params" : "body";

        if (!isCustomError) {
          errorOn = JSON.parse(handler.error.message).on;
          message = `Validation error occurred on ${errorOn}.`;
        }

        data = generateValidationErrorData(handler.error.all, errorOn);
      }

      if (isNotFoundError) {
        handler.set.status = 404;
        message = "Path not found.";
        data = {
          path: new URL(handler.request.url).pathname,
        };
      }

      return {
        success,
        message,
        data,
      };
    });
};
