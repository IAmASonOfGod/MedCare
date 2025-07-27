import { Models } from "node-appwrite";

export type Gender = "male" | "female" | "other";
export type Status = "pending" | "scheduled" | "cancelled";

export interface Patient extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
  practiceId: string;
}

export interface Appointment extends Models.Document {
  patientId: string;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  userId: string;
  practiceId: string;
  cancellationReason: string | null;
  patient?: Patient | null; // Populated by batched data fetching
}

export interface Practice extends Models.Document {
  practiceName: string;
  adminEmail: string;
  address: string;
  phone: string;
  // Add other practice fields as needed
}
