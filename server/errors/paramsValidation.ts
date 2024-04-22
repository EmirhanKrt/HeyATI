import { ValidationError } from "./base";
import { ValidationErrorPayload } from "@/server/types";

export class ParamsValidationError extends ValidationError {
  constructor(public all: ValidationErrorPayload[]) {
    super("Validation error occured on params.", all);
  }
}
