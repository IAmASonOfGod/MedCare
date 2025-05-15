"use server";

import { ID, Query } from "node-appwrite";
import { users } from "../appwrite.config";
import { parseStringify } from "../utils";

export const createUser = async (user: CreateUserParams) => {
  console.log("User :", user);

  try {
    console.log("User :", user);
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    console.log("New User :", { newUser });

    return parseStringify(newUser);
  } catch (error: any) {
    console.error("Error creating user:", error);
    //Check existing user

    if (error && error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      return existingUser.users[0];
    }
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.log(error);
  }
};
