import * as sdk from "node-appwrite";

export const {
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  PRACTICES_COLLECTION_ID,
  NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
  NEXT_PUBLIC_ENDPOINT_ID: ENDPOINT,
} = process.env;

// Validate required environment variables
if (!PROJECT_ID) throw new Error("PROJECT_ID environment variable is not set");
if (!API_KEY) throw new Error("API_KEY environment variable is not set");
if (!DATABASE_ID)
  throw new Error("DATABASE_ID environment variable is not set");
if (!PATIENT_COLLECTION_ID)
  throw new Error("PATIENT_COLLECTION_ID environment variable is not set");
if (!APPOINTMENT_COLLECTION_ID)
  throw new Error("APPOINTMENT_COLLECTION_ID environment variable is not set");
if (!PRACTICES_COLLECTION_ID)
  throw new Error("PRACTICES_COLLECTION_ID environment variable is not set");
if (!ENDPOINT)
  throw new Error("NEXT_PUBLIC_ENDPOINT_ID environment variable is not set");

const client = new sdk.Client();

client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

export const databases = new sdk.Databases(client);
export const storage = new sdk.Storage(client);
export const messaging = new sdk.Messaging(client);
export const users = new sdk.Users(client);
