import { ValidationError } from "./base";
import { ValidationErrorPayload } from "@/server/types";

export class ParamsValidationError extends ValidationError {
  constructor(
    public all: ValidationErrorPayload[],
    message: string = "Validation error occured on params."
  ) {
    super(message, all);
  }
}
