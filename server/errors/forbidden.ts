import { BaseError } from "./base";

export class ForbiddenError extends BaseError {
  constructor(public message: string) {
    super(message);
    this.statusCode = 403;
  }
}
