import { Gender } from "@/types/appwrite.types";

export const GenderOptions = ["male", "female", "other"];

export const PatientFormDefaultValues = {
  name: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "male" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's License",
  "Medical Insurance Card/Policy",
  "National Identity Card",
  "Passport",
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
  completed: "/assets/icons/check-circle.svg",
  "no-show": "/assets/icons/close.svg",
};

// Business hours configuration
export const BUSINESS_HOURS = {
  startHour: 8, // 8 AM
  endHour: 17, // 5 PM
  startMinute: 0,
  endMinute: 0,
};

// Appointment slot configuration (in minutes)
export const APPOINTMENT_SLOT_DURATION = 30; // 30 minutes per appointment

// Days of the week (0 = Sunday, 1 = Monday, etc.)
export const BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday only
