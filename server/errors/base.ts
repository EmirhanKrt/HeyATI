import { ValidationErrorPayload } from "@/server/types";

export class BaseError extends Error {
  statusCode: number = 500;

  constructor(public message: string) {
    super(message);
  }
}

export class ValidationError extends BaseError {
  constructor(public message: string, public all: ValidationErrorPayload[]) {
    super(message);

    this.statusCode = 400;
  }
}
