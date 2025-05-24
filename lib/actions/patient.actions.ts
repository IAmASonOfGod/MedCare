"use server";

import { ID, Query } from "node-appwrite";
import {
  BUCKET_ID,
  DATABASE_ID,
  databases,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite";
import { Blob } from "buffer";

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

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;

    if (identificationDocument) {
      const fileEntry = identificationDocument.get("blobFile");
      const blobFile = fileEntry as unknown as Blob; // Type assertion
      const fileName = identificationDocument.get("fileName") as string;

      // Runtime check (recommended)
      if (!(blobFile instanceof Blob)) {
        throw new Error("Expected a Blob object");
      }

      const arrayBuffer = await blobFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const inputFile = InputFile.fromBuffer(buffer, fileName);

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient,
      }
    );
  } catch (error) {
    console.log(error);
  }
};
