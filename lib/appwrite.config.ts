import * as sdk from "node-appwrite";

// Read env with sensible fallbacks and clearer names
// Use fallback values during build time to prevent build failures
const isBuildTime =
  process.env.NODE_ENV === undefined ||
  process.env.NEXT_PHASE === "phase-production-build";

const PROJECT_ID =
  process.env.PROJECT_ID ||
  (isBuildTime ? "build-time-placeholder" : undefined);
const API_KEY =
  process.env.API_KEY || (isBuildTime ? "build-time-placeholder" : undefined);
const DATABASE_ID =
  process.env.DATABASE_ID ||
  (isBuildTime ? "build-time-placeholder" : undefined);
const PATIENT_COLLECTION_ID =
  process.env.PATIENT_COLLECTION_ID ||
  process.env.PATIENTS_COLLECTION_ID ||
  (isBuildTime ? "build-time-placeholder" : undefined);
const APPOINTMENT_COLLECTION_ID =
  process.env.APPOINTMENT_COLLECTION_ID ||
  (isBuildTime ? "build-time-placeholder" : undefined);
const PRACTICES_COLLECTION_ID =
  process.env.PRACTICES_COLLECTION_ID ||
  (isBuildTime ? "build-time-placeholder" : undefined);
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID;
const ENDPOINT =
  process.env.NEXT_PUBLIC_ENDPOINT ||
  process.env.NEXT_PUBLIC_ENDPOINT_ID ||
  process.env.APPWRITE_ENDPOINT ||
  (isBuildTime ? "https://build-time-placeholder" : undefined);

// Validate required environment variables with helpful messages (only at runtime)
if (!isBuildTime) {
  if (!PROJECT_ID) throw new Error("PROJECT_ID env var is not set");
  if (!API_KEY) throw new Error("API_KEY env var is not set");
  if (!DATABASE_ID) throw new Error("DATABASE_ID env var is not set");
  if (!PATIENT_COLLECTION_ID)
    throw new Error(
      "PATIENT_COLLECTION_ID env var is not set (try PATIENTS_COLLECTION_ID if using older naming)"
    );
  if (!APPOINTMENT_COLLECTION_ID)
    throw new Error("APPOINTMENT_COLLECTION_ID env var is not set");
  if (!PRACTICES_COLLECTION_ID)
    throw new Error("PRACTICES_COLLECTION_ID env var is not set");
  if (!ENDPOINT)
    throw new Error(
      "Appwrite endpoint env var is not set. Expected NEXT_PUBLIC_ENDPOINT or NEXT_PUBLIC_ENDPOINT_ID or APPWRITE_ENDPOINT"
    );
}

const client = new sdk.Client();

client.setEndpoint(ENDPOINT!).setProject(PROJECT_ID!).setKey(API_KEY!);

export {
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  PRACTICES_COLLECTION_ID,
  BUCKET_ID,
  ENDPOINT,
};
export const databases = new sdk.Databases(client);
export const storage = new sdk.Storage(client);
export const messaging = new sdk.Messaging(client);
export const users = new sdk.Users(client);

// Optional collections for admin onboarding
export const ADMINS_COLLECTION_ID = process.env.ADMINS_COLLECTION_ID;
export const ADMIN_INVITES_COLLECTION_ID =
  process.env.ADMIN_INVITES_COLLECTION_ID;
