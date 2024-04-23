import { eq, or } from "drizzle-orm";
import db from "@/server/db";
import { userTable } from "@/server/db/schema";
import {
  JWTPayloadType,
  SafeUserType,
  UserInsertType,
  UserType,
} from "@/server/models";

export abstract class UserService {
  static async insertOneUser({
    first_name,
    last_name,
    user_name,
    user_email,
    user_password,
  }: UserInsertType): Promise<UserType> {
    const userList = await db
      .insert(userTable)
      .values({
        first_name,
        last_name,
        user_name,
        user_email,
        user_password,
      })
      .returning();

    return userList[0];
  }

  static async getUserByUserID(user_id: number): Promise<UserType | null> {
    const userList = await db
      .select()
      .from(userTable)
      .where(eq(userTable.user_id, user_id));

    if (userList.length === 1) {
      return userList[0];
    }

    return null;
  }

  static async getUserByUserName(user_name: string): Promise<UserType | null> {
    const userList = await db
      .select()
      .from(userTable)
      .where(eq(userTable.user_name, user_name));

    if (userList.length === 1) {
      return userList[0];
    }

    return null;
  }

  static async getUserByUserEmail(
    user_email: string
  ): Promise<UserType | null> {
    const userList = await db
      .select()
      .from(userTable)
      .where(eq(userTable.user_email, user_email));

    if (userList.length === 1) {
      return userList[0];
    }

    return null;
  }

  static async getUserByUserNameOrUserEmail(
    user_email: string,
    user_name: string
  ): Promise<UserType[] | null> {
    const userList = await db
      .select()
      .from(userTable)
      .where(
        or(
          eq(userTable.user_email, user_email),
          eq(userTable.user_name, user_name)
        )
      );

    if (userList.length !== 0) {
      return userList;
    }

    return null;
  }

  static toSafeUserType(user: UserType): SafeUserType {
    const { user_password, updated_at, ...restOfUser } = user;

    return restOfUser;
  }

  static toJWTPayloadType(user: UserType): JWTPayloadType {
    const { user_id, user_name, user_email } = user;

    return {
      user_id,
      user_name,
      user_email,
    };
  }
}
