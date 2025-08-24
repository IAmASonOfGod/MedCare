"use server";
import { ID, Query } from "node-appwrite";
import { databases, PRACTICES_COLLECTION_ID } from "../appwrite.config";

// Validate environment variables
const DATABASE_ID = process.env.DATABASE_ID;
const PATIENTS_COLLECTION_ID = process.env.PATIENT_COLLECTION_ID;

if (!DATABASE_ID) {
  throw new Error("DATABASE_ID environment variable is not set");
}

if (!PATIENTS_COLLECTION_ID) {
  throw new Error("PATIENT_COLLECTION_ID environment variable is not set");
}

if (!PRACTICES_COLLECTION_ID) {
  throw new Error("PRACTICES_COLLECTION_ID environment variable is not set");
}

// Type assertions after validation
const validatedDatabaseId = DATABASE_ID as string;
const validatedPatientsCollectionId = PATIENTS_COLLECTION_ID as string;
const validatedPracticesCollectionId = PRACTICES_COLLECTION_ID as string;

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
      validatedDatabaseId,
      validatedPracticesCollectionId,
      ID.unique(),
      {
        ...practice,
        consultationInterval:
          practice.consultationInterval != null
            ? Number(practice.consultationInterval)
            : practice.consultationInterval,
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
      validatedDatabaseId,
      validatedPracticesCollectionId,
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
      validatedDatabaseId,
      validatedPatientsCollectionId,
      patientId
    )) as { practiceId?: string };
    if (!patient.practiceId) return null;
    const practice = await databases.getDocument(
      validatedDatabaseId,
      validatedPracticesCollectionId,
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
  const queries = [] as any[];
  if (search) {
    queries.push(Query.search("searchable", search));
  }
  if (location) {
    queries.push(Query.equal("location", [location]));
  }
  // Add more filters as needed

  const result = await databases.listDocuments(
    validatedDatabaseId,
    validatedPracticesCollectionId,
    queries
  );
  return result.documents;
}

async function fetchPatientsForPractice(practiceId: string) {
  const result = await databases.listDocuments(
    validatedDatabaseId,
    validatedPatientsCollectionId,
    [Query.equal("practiceId", [practiceId])]
  );
  return result.documents;
}

// Updated interface to match your existing schema
export interface PracticeSettings {
  $id?: string;
  practiceName: string;
  practiceType: string;
  contactEmail: string;
  contactPhone: string;
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;

  // Operating hours fields
  mondayOpen?: string;
  mondayClose?: string;
  mondayClosed?: boolean;
  tuesdayOpen?: string;
  tuesdayClose?: string;
  tuesdayClosed?: boolean;
  wednesdayOpen?: string;
  wednesdayClose?: string;
  wednesdayClosed?: boolean;
  thursdayOpen?: string;
  thursdayClose?: string;
  thursdayClosed?: boolean;
  fridayOpen?: string;
  fridayClose?: string;
  fridayClosed?: boolean;
  saturdayOpen?: string;
  saturdayClose?: string;
  saturdayClosed?: boolean;
  sundayOpen?: string;
  sundayClose?: string;
  sundayClosed?: boolean;

  // Public holidays fields
  publicHolidaysOpen?: string;
  publicHolidaysClose?: string;
  publicHolidaysClosed?: boolean;

  // Booking interval
  consultationInterval?: number;

  $createdAt?: string;
  $updatedAt?: string;
}

export const savePracticeSettings = async (
  practiceId: string,
  settings: Partial<PracticeSettings>
) => {
  try {
    // AuthZ: ensure the caller owns this practice
    const { requireAdmin } = await import("@/lib/auth/requireAdmin");
    const claims = await requireAdmin();
    if (claims.practiceId !== practiceId) throw new Error("Forbidden");
    // Update the existing practice document with new settings
    const result = await databases.updateDocument(
      validatedDatabaseId,
      validatedPracticesCollectionId,
      practiceId,
      {
        ...settings,
        consultationInterval:
          settings.consultationInterval != null
            ? Number(settings.consultationInterval)
            : settings.consultationInterval,
      }
    );
    return result;
  } catch (error) {
    console.error("Error saving practice settings:", error);
    // Throw a user-friendly error message
    throw new Error("Failed to save practice settings. Please try again.");
  }
};

export const getPracticeSettings = async (
  practiceId: string
): Promise<PracticeSettings | null> => {
  try {
    // AuthZ: require admin token and restrict to own practice
    const { requireAdmin } = await import("@/lib/auth/requireAdmin");
    const claims = await requireAdmin();
    if (claims.practiceId !== practiceId) throw new Error("Forbidden");
    const result = await databases.getDocument(
      validatedDatabaseId,
      validatedPracticesCollectionId,
      practiceId
    );
    const coerced = {
      ...(result as any),
      consultationInterval:
        (result as any).consultationInterval != null
          ? Number((result as any).consultationInterval)
          : undefined,
    } as PracticeSettings;
    return coerced;
  } catch (error) {
    console.error("Error getting practice settings:", error);
    return null;
  }
};

// Helper function to get business days from practice settings
export const getBusinessDaysFromSettings = (
  settings: PracticeSettings
): number[] => {
  const businessDays: number[] = [];

  // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
  const dayChecks = [
    { day: 1, closed: settings.mondayClosed, open: settings.mondayOpen },
    { day: 2, closed: settings.tuesdayClosed, open: settings.tuesdayOpen },
    { day: 3, closed: settings.wednesdayClosed, open: settings.wednesdayOpen },
    { day: 4, closed: settings.thursdayClosed, open: settings.thursdayOpen },
    { day: 5, closed: settings.fridayClosed, open: settings.fridayOpen },
    { day: 6, closed: settings.saturdayClosed, open: settings.saturdayOpen },
    { day: 0, closed: settings.sundayClosed, open: settings.sundayOpen },
  ];

  dayChecks.forEach(({ day, closed, open }) => {
    if (!closed && open) {
      businessDays.push(day);
    }
  });

  return businessDays;
};

// Helper function to get business hours for a specific day
export const getBusinessHoursForDay = (
  settings: PracticeSettings,
  dayOfWeek: number
): {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
} | null => {
  const dayMappings = {
    0: {
      open: settings.sundayOpen,
      close: settings.sundayClose,
      closed: settings.sundayClosed,
    },
    1: {
      open: settings.mondayOpen,
      close: settings.mondayClose,
      closed: settings.mondayClosed,
    },
    2: {
      open: settings.tuesdayOpen,
      close: settings.tuesdayClose,
      closed: settings.tuesdayClosed,
    },
    3: {
      open: settings.wednesdayOpen,
      close: settings.wednesdayClose,
      closed: settings.wednesdayClosed,
    },
    4: {
      open: settings.thursdayOpen,
      close: settings.thursdayClose,
      closed: settings.thursdayClosed,
    },
    5: {
      open: settings.fridayOpen,
      close: settings.fridayClose,
      closed: settings.fridayClosed,
    },
    6: {
      open: settings.saturdayOpen,
      close: settings.saturdayClose,
      closed: settings.saturdayClosed,
    },
  } as const;

  const dayHours = dayMappings[dayOfWeek as keyof typeof dayMappings];

  console.log("[Hours] dayOfWeek:", dayOfWeek, "raw:", {
    open: dayHours?.open,
    close: dayHours?.close,
    closed: dayHours?.closed,
  });

  if (!dayHours || dayHours.closed || !dayHours.open || !dayHours.close)
    return null;

  // Ensure HH:MM format, otherwise bail out
  const openParts = String(dayHours.open).split(":");
  const closeParts = String(dayHours.close).split(":");
  if (openParts.length < 2 || closeParts.length < 2) return null;

  const [startHourRaw, startMinuteRaw] = openParts;
  const [endHourRaw, endMinuteRaw] = closeParts;
  const startHour = Number(startHourRaw);
  const startMinute = Number(startMinuteRaw);
  const endHour = Number(endHourRaw);
  const endMinute = Number(endMinuteRaw);

  console.log("[Hours] parsed:", {
    startHour,
    startMinute,
    endHour,
    endMinute,
  });

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return null;
  }

  return { startHour, startMinute, endHour, endMinute };
};
