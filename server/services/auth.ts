import {
  AuthLoginRequestBodyType,
  AuthRegisterRequestBodyType,
  UserType,
} from "@/server/models";
import { BodyValidationError } from "@/server/errors";
import { ValidationErrorPayload } from "@/server/types";
import { UserService } from "./user";

export abstract class AuthService {
  static async logInUser({
    user_email,
    user_password,
  }: AuthLoginRequestBodyType): Promise<UserType> {
    const user = await UserService.getUserByUserEmail(user_email);

    const validationError = new BodyValidationError(
      [
        { path: "user_email", message: "Invalid value." },
        { path: "user_password", message: "Invalid value." },
      ],
      "User email or password is not correct."
    );

    if (!user) throw validationError;

    const isUserPasswordMatched = Bun.password.verifySync(
      user_password,
      user.user_password
    );

    if (isUserPasswordMatched) return user;

    throw validationError;
  }

  static async registerUser({
    first_name,
    last_name,
    user_name,
    user_email,
    user_password,
    user_password_confirm,
  }: AuthRegisterRequestBodyType): Promise<UserType> {
    if (user_password !== user_password_confirm)
      throw new BodyValidationError(
        [{ path: "user_password_confirm", message: "Passwords not matched." }],
        "User Password and User Password Confirm are not matched."
      );

    const userList = await UserService.getUserByUserNameOrUserEmail(
      user_email,
      user_name
    );

    if (userList) {
      const errorList: ValidationErrorPayload[] = [];

      userList.forEach((user) => {
        if (user.user_email === user_email)
          errorList.push({
            path: "user_email",
            message: "User with this user email is already exists",
          });

        if (user.user_name === user_name)
          errorList.push({
            path: "user_name",
            message: "User with this user name is already exists",
          });
      });

      throw new BodyValidationError(errorList);
    }

    const hashedPassword = Bun.password.hashSync(user_password, {
      algorithm: "bcrypt",
      cost: 4,
    });

    const newUser = await UserService.insertOneUser({
      first_name,
      last_name,
      user_name,
      user_email,
      user_password: hashedPassword,
    });

    return newUser;
  }
}
