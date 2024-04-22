import { BaseError } from "./base";

export class UnauthorizedError extends BaseError {
  constructor(public message: string) {
    super(message);
    this.statusCode = 401;
  }
}
