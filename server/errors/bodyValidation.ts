import { ValidationError } from "./base";
import { ValidationErrorPayload } from "@/server/types";

export class BodyValidationError extends ValidationError {
  constructor(
    public all: ValidationErrorPayload[],
    message: string = "Validation error occured on body."
  ) {
    super(message, all);
  }
}
