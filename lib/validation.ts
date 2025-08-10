import { z } from "zod";
import { SelectItem } from "@/components/ui/select";

export const UserFormValidation = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Invalid phone number"),
});

export const PatientFormValidation = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .refine((phone) => /^\+\d{10,15}$/.test(phone), "Invalid phone number"),
    birthDate: z.coerce.date(),
    gender: z.enum(["male", "female", "other"]),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(500, "Address must be at most 500 characters"),
    occupation: z
      .string()
      .min(2, "Occupation must be at least 2 characters")
      .max(500, "Occupation must be at most 500 characters"),
    emergencyContactName: z
      .string()
      .min(2, "Contact name must be at least 2 characters")
      .max(50, "Contact name must be at most 50 characters"),
    emergencyContactNumber: z
      .string()
      .refine(
        (emergencyContactNumber) =>
          /^\+\d{10,15}$/.test(emergencyContactNumber),
        "Invalid phone number"
      ),
    insuranceProvider: z
      .string()
      .min(2, "Insurance name must be at least 2 characters")
      .max(50, "Insurance name must be at most 50 characters"),
    insurancePolicyNumber: z
      .string()
      .min(2, "Policy number must be at least 2 characters")
      .max(50, "Policy number must be at most 50 characters"),
    allergies: z.string().optional(),
    currentMedication: z.string().optional(),
    familyMedicalHistory: z.string().optional(),
    pastMedicalHistory: z.string().optional(),
    identificationType: z.string().optional(),
    identificationNumber: z.string().optional(),
    identificationDocument: z.custom<File[]>().optional(),
    treatmentConsent: z.boolean().refine((value) => value === true, {
      message: "You must consent to treatment in order to proceed",
    }),
    disclosureConsent: z.boolean().refine((value) => value === true, {
      message: "You must consent to disclosure in order to proceed",
    }),
    privacyConsent: z.boolean().refine((value) => value === true, {
      message: "You must consent to privacy in order to proceed",
    }),
    practiceId: z
      .string()
      .min(1, "Practice ID is required")
      .max(36, "Practice ID is too long"),
  })
  .refine((data) => data.phone !== data.emergencyContactNumber, {
    message: "Emergency contact number cannot be the same as your own number.",
    path: ["emergencyContactNumber"],
  });

export const CreateAppointmentSchema = z.object({
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

// Minimal schema for actions that don't require extra input (complete, no-show)
export const MinimalAppointmentUpdateSchema = z.object({
  schedule: z.coerce.date().optional(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case "create":
      return CreateAppointmentSchema;
    case "cancel":
      return CancelAppointmentSchema;
    case "complete":
    case "no-show":
      return MinimalAppointmentUpdateSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}

export const PracticeRegistrationSchema = z.object({
  // Practice Details
  practiceName: z
    .string()
    .min(2, "Practice name must be at least 2 characters")
    .max(100, "Practice name must be at most 100 characters"),
  practiceType: z.enum(
    [
      "GP",
      "Dentist",
      "Physio",
      "Specialist",
      "Clinical Psychologist",
      "Optometrist",
      "Audiologist",
      "Occupational Therapist",
      "Speech Therapist",
      "Podiatrist",
      "Other",
    ],
    {
      required_error: "Please select a practice type",
    }
  ),
  specialistType: z.string().optional(),
  slug: z.string().optional(), // Auto-generated
  registrationNumber: z
    .string()
    .min(2, "Registration number must be at least 2 characters")
    .max(50, "Registration number must be at most 50 characters"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Invalid phone number"),
  practiceDescription: z
    .string()
    .max(500, "Practice description must be at most 500 characters")
    .optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),

  // Location Details
  streetAddress: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address must be at most 200 characters"),
  suburb: z
    .string()
    .min(2, "Suburb must be at least 2 characters")
    .max(100, "Suburb must be at most 100 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters"),
  province: z
    .string()
    .min(2, "Province must be at least 2 characters")
    .max(100, "Province must be at most 100 characters"),
  postalCode: z
    .string()
    .min(4, "Postal code must be at least 4 characters")
    .max(10, "Postal code must be at most 10 characters"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be at most 100 characters"),
  googleMapsLink: z
    .string()
    .url("Invalid Google Maps URL")
    .optional()
    .or(z.literal("")),

  // Operating Hours
  mondayOpen: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  mondayClose: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  tuesdayOpen: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  tuesdayClose: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  wednesdayOpen: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  wednesdayClose: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  thursdayOpen: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  thursdayClose: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  fridayOpen: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  fridayClose: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  saturdayOpen: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  saturdayClose: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  sundayOpen: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  sundayClose: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  mondayClosed: z.boolean().optional(),
  tuesdayClosed: z.boolean().optional(),
  wednesdayClosed: z.boolean().optional(),
  thursdayClosed: z.boolean().optional(),
  fridayClosed: z.boolean().optional(),
  saturdayClosed: z.boolean().optional(),
  sundayClosed: z.boolean().optional(),
  publicHolidaysOpen: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  publicHolidaysClose: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .or(z.literal(""))
    .optional(),
  publicHolidaysClosed: z.boolean().optional(),

  // Declarations
  termsAndConditions: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions",
  }),
  consentToVerification: z.boolean().refine((value) => value === true, {
    message: "You must consent to verification",
  }),
  consultationInterval: z
    .number()
    .min(5, "Consultation interval must be at least 5 minutes")
    .max(180, "Consultation interval must be at most 180 minutes"),
});
