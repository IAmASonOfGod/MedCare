"use server";
import { ID, Query } from "node-appwrite";
import { databases } from "../appwrite.config";

// Replace with your actual database and collection IDs
const DATABASE_ID = process.env.DATABASE_ID!;
const PRACTICES_COLLECTION_ID = process.env.PRACTICES_COLLECTION_ID!;
const PATIENTS_COLLECTION_ID = process.env.PATIENT_COLLECTION_ID!;

export async function createPractice(practice: Record<string, any>) {
  try {
    // Build the 'searchable' field, now including city
    const searchable = [
      practice.practiceName,
      practice.practiceType,
      practice.suburb,
      practice.province,
      practice.city, // Add this line for city/town
    ]
      .filter(Boolean)
      .join(" ");

    const response = await databases.createDocument(
      DATABASE_ID,
      PRACTICES_COLLECTION_ID,
      ID.unique(),
      {
        ...practice,
        searchable,
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating practice:", error);
    throw error;
  }
}

export async function fetchPracticeByAdminEmail(email: string) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      PRACTICES_COLLECTION_ID,
      [Query.equal("contactEmail", [email])]
    );
    return result.documents[0] || null;
  } catch (error) {
    console.error("Error fetching practice by admin email:", error);
    return null;
  }
}

export async function fetchPracticeByPatientId(patientId: string) {
  try {
    const patient = (await databases.getDocument(
      DATABASE_ID,
      PATIENTS_COLLECTION_ID,
      patientId
    )) as { practiceId?: string };
    if (!patient.practiceId) return null;
    const practice = await databases.getDocument(
      DATABASE_ID,
      PRACTICES_COLLECTION_ID,
      patient.practiceId
    );
    return practice || null;
  } catch (error) {
    console.error("Error fetching practice by patient ID:", error);
    return null;
  }
}

export async function fetchPractices({
  search,
  location,
}: {
  search?: string;
  location?: string;
}) {
  const queries = [];
  if (search) {
    queries.push(Query.search("searchable", search));
  }
  if (location) {
    queries.push(Query.equal("location", [location]));
  }
  // Add more filters as needed

  const result = await databases.listDocuments(
    DATABASE_ID,
    PRACTICES_COLLECTION_ID,
    queries
  );
  return result.documents;
}

async function fetchPatientsForPractice(practiceId: string) {
  const result = await databases.listDocuments(
    process.env.NEXT_PUBLIC_DATABASE_ID!,
    process.env.NEXT_PUBLIC_PATIENTS_COLLECTION_ID!,
    [Query.equal("practiceId", [practiceId])]
  );
  return result.documents;
}
