import { BaseError } from "./base";

export class ConflictError extends BaseError {
  constructor(public message: string) {
    super(message);
    this.statusCode = 429;
  }
}
