import { desc, eq, inArray, or, sql } from "drizzle-orm";
import db from "@/server/db";
import { privateMessageTable, userTable } from "@/server/db/schema";
import {
  JWTPayloadType,
  SafeUserType,
  UserInsertType,
  UserType,
  UserUpdatePayloadType,
} from "@/server/models";
import { BodyValidationError } from "../errors";

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

  static async updateUser(
    {
      first_name,
      last_name,
      old_user_password,
      new_user_password,
      new_user_password_confirm,
    }: UserUpdatePayloadType,
    matchedUser: UserType
  ): Promise<UserType> {
    const updatePayload: {
      first_name?: string;
      last_name?: string;
      user_password?: string;
    } = {};

    const validationErrorData: { path: string; message: string }[] = [];

    if (first_name) updatePayload.first_name = first_name;
    if (last_name) updatePayload.last_name = last_name;

    const passwordList = [
      old_user_password,
      new_user_password,
      new_user_password_confirm,
    ];

    const areAllPasswordFieldsProvided = passwordList.every(
      (password) => password !== undefined && password !== ""
    );

    const isSomePasswordFieldProvided = passwordList.some(
      (password) => password !== undefined && password !== ""
    );

    if (areAllPasswordFieldsProvided) {
      if (new_user_password !== new_user_password_confirm) {
        validationErrorData.push({
          path: "new_user_password_confirm",
          message: "New Passwords are not matched",
        });

        throw new BodyValidationError(
          validationErrorData,
          "Password change error."
        );
      }

      const isPasswordMatched = Bun.password.verifySync(
        old_user_password!,
        matchedUser.user_password
      );

      if (!isPasswordMatched) {
        validationErrorData.push({
          path: "old_user_password",
          message: "Old password is not correct.",
        });

        throw new BodyValidationError(
          validationErrorData,
          "Password change error."
        );
      }

      const hashedPassword = Bun.password.hashSync(new_user_password!, {
        algorithm: "bcrypt",
        cost: 4,
      });

      updatePayload.user_password = hashedPassword;
    } else if (isSomePasswordFieldProvided) {
      if (!old_user_password)
        validationErrorData.push({
          path: "old_user_password",
          message: "Old Password is required",
        });

      if (!new_user_password)
        validationErrorData.push({
          path: "new_user_password",
          message: "New Password is required",
        });

      if (!new_user_password_confirm)
        validationErrorData.push({
          path: "new_user_password_confirm",
          message: "New Password Confirm is required",
        });

      throw new BodyValidationError(
        validationErrorData,
        "Password change error."
      );
    }

    const updatedUser = await db
      .update(userTable)
      .set(updatePayload)
      .where(eq(userTable.user_id, matchedUser.user_id))
      .returning();

    return updatedUser[0];
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

  static async getOrderedInteractionWithUsersByUserId(user_id: number) {
    const interactions = (await db
      .select({
        interactingUserId: privateMessageTable.sender_id,
        lastInteraction: sql`MAX(${privateMessageTable.created_at})`.as(
          "last_interaction"
        ),
      })
      .from(privateMessageTable)
      .where(eq(privateMessageTable.receiver_id, user_id))
      .groupBy(privateMessageTable.sender_id)
      .unionAll(
        db
          .select({
            interactingUserId: privateMessageTable.receiver_id,
            lastInteraction: sql`MAX(${privateMessageTable.created_at})`.as(
              "last_interaction"
            ),
          })
          .from(privateMessageTable)
          .where(eq(privateMessageTable.sender_id, user_id))
          .groupBy(privateMessageTable.receiver_id)
      )) as {
      interactingUserId: number;
      lastInteraction: string;
    }[];

    interactions.sort((a, b) =>
      b.lastInteraction.localeCompare(a.lastInteraction)
    );

    const latestInteractions = new Map<
      number,
      {
        interactingUserId: number;
        lastInteraction: string;
      }
    >();

    for (const interaction of interactions) {
      if (
        !latestInteractions.has(interaction.interactingUserId) ||
        latestInteractions.get(interaction.interactingUserId)!.lastInteraction <
          interaction.lastInteraction
      ) {
        latestInteractions.set(interaction.interactingUserId, interaction);
      }
    }

    const distinctLatestInteractions = Array.from(latestInteractions.values());

    const distinctLatestInteractedUserIdList = distinctLatestInteractions.map(
      (interaction) => interaction.interactingUserId
    );

    if (distinctLatestInteractedUserIdList.length === 0)
      return [] as UserType[];

    const interactedUsers = await db
      .select()
      .from(userTable)
      .where(inArray(userTable.user_id, distinctLatestInteractedUserIdList));

    const userIdOrder = new Map<number, number>(
      distinctLatestInteractions.map((interaction, index) => [
        interaction.interactingUserId,
        index,
      ])
    );

    interactedUsers.sort((a, b) => {
      const orderA = userIdOrder.get(a.user_id) || 0;
      const orderB = userIdOrder.get(b.user_id) || 0;
      return orderA - orderB;
    });

    return interactedUsers;
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
