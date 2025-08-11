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
import { Buffer } from "buffer";

export const createUser = async (
  user: CreateUserParams & { practiceId?: string }
) => {
  console.log("User :", user);
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );
    // Do not create a patient document here; the full patient record (with required fields)
    // is created in registerPatient after file upload and additional details are provided.
    return parseStringify(newUser);
  } catch (error: any) {
    console.error("Error creating user:", error);
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

export const getPatient = async (patientIdOrUserId: string) => {
  try {
    // First, try to get the document directly (in case it's a patient document ID)
    try {
      const patient = await databases.getDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        patientIdOrUserId
      );
      return parseStringify(patient);
    } catch (error) {
      // If that fails, try to find by userId
      if (patientIdOrUserId && patientIdOrUserId.trim() !== "") {
        const patients = await databases.listDocuments(
          DATABASE_ID!,
          PATIENT_COLLECTION_ID!,
          [Query.equal("userId", [patientIdOrUserId])]
        );
        return parseStringify(patients.documents[0]);
      }
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const findPatientByEmailAndPhone = async (
  email: string,
  phone: string,
  practiceId: string
) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [
        Query.equal("email", [email]),
        Query.equal("phone", [phone]),
        Query.equal("practiceId", [practiceId]),
      ]
    );

    if (patients.documents.length > 0) {
      return parseStringify(patients.documents[0]);
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  console.log(
    "identication Document AND patient:",
    identificationDocument,
    patient
  );
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
    } else {
      // Ensure fields exist to satisfy Appwrite required attributes
      // Use nulls for ID and URL when no document is provided
      // file remains undefined
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ?? null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.log(error);
  }
};
