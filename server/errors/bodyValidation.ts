import { ValidationError } from "./base";
import { ValidationErrorPayload } from "@/server/types";

export class BodyValidationError extends ValidationError {
  constructor(public all: ValidationErrorPayload[]) {
    super("Validation error occured on body.", all);
  }
}
