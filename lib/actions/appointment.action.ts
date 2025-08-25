"use server";

import { ID, Query } from "node-appwrite";
import {
  APPOINTMENT_COLLECTION_ID,
  PATIENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";
import { validateAppointmentSlot } from "../appointment-validation";
import {
  getPracticeSettings,
  getBusinessHoursForDay,
} from "./practice.actions";
import { sendAppointmentEmail } from "@/lib/notifications/email";
import { sendSms } from "@/lib/notifications/sms";

// Patient-initiated appointment creation (no admin auth required)
export const createPatientAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    console.log(
      "Creating patient appointment for practice:",
      appointment.practiceId
    );

    // Validate the appointment slot before creating
    const validation = await validateAppointmentSlot(
      appointment.schedule,
      appointment.practiceId
    );

    if (!validation.isValid) {
      throw new Error(validation.message || "Invalid appointment slot");
    }

    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    // Notify patient and admin (basic example)
    try {
      const patient = await databases.getDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        appointment.patientId
      );
      const schedule = new Date(appointment.schedule).toLocaleString();
      if ((patient as any)?.email) {
        await sendAppointmentEmail({
          to: (patient as any).email,
          subject: "Your appointment is scheduled",
          html: `<p>Your appointment is scheduled for ${schedule}.</p>`,
        });
      }
      if ((patient as any)?.phone) {
        await sendSms(
          (patient as any).phone,
          `Appointment scheduled: ${schedule}`
        );
      }
    } catch (_) {}

        // Invalidate multiple paths to ensure dashboard updates
    revalidatePath("/admin");
    revalidatePath("/");

    return parseStringify(newAppointment);
  } catch (error: any) {
    console.error("Error in createPatientAppointment:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      appointmentData: appointment,
    });
    throw error; // Re-throw to handle in the UI
  }
};

// Admin-initiated appointment creation (requires admin auth)
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    console.log("Creating appointment for practice:", appointment.practiceId);

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET environment variable is not set in appointment creation"
      );
      throw new Error("Server configuration error: JWT_SECRET missing");
    }

    const { requireAdmin } = await import("@/lib/auth/requireAdmin");
    console.log("Attempting to authenticate admin for appointment creation");

    const claims = await requireAdmin();
    console.log("Admin authenticated, practice ID:", claims.practiceId);

    if (claims.practiceId !== appointment.practiceId) {
      console.error("Practice ID mismatch:", {
        tokenPracticeId: claims.practiceId,
        appointmentPracticeId: appointment.practiceId,
      });
      throw new Error("Forbidden");
    }
    // Validate the appointment slot before creating
    const validation = await validateAppointmentSlot(
      appointment.schedule,
      appointment.practiceId
    );

    if (!validation.isValid) {
      throw new Error(validation.message || "Invalid appointment slot");
    }

    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    // Notify patient and admin (basic example)
    try {
      const patient = await databases.getDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        appointment.patientId
      );
      const schedule = new Date(appointment.schedule).toLocaleString();
      if ((patient as any)?.email) {
        await sendAppointmentEmail({
          to: (patient as any).email,
          subject: "Your appointment is scheduled",
          html: `<p>Your appointment is scheduled for ${schedule}.</p>`,
        });
      }
      if ((patient as any)?.phone) {
        await sendSms(
          (patient as any).phone,
          `Appointment scheduled: ${schedule}`
        );
      }
    } catch (_) {}

        // Invalidate multiple paths to ensure dashboard updates
    revalidatePath("/admin");
    revalidatePath("/");

    return parseStringify(newAppointment);
  } catch (error: any) {
    console.error("Error in createAppointment:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      appointmentData: appointment,
    });
    throw error; // Re-throw to handle in the UI
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (e) {
    console.log(e);
  }
};

export const getRecentAppointmentList = async (
  practiceId?: string,
  page: number = 1,
  limit: number = 20
) => {
  try {
    const offset = (page - 1) * limit;
    const queries = [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (practiceId) {
      queries.push(Query.equal("practiceId", [practiceId]));
    }

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    const patientIds = appointments.documents.map(
      (appointment: any) => appointment.patientId
    );
    const uniquePatientIds = [...new Set(patientIds)];

    let patientsMap = new Map();
    if (uniquePatientIds.length > 0) {
      const patients = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        [Query.equal("$id", uniquePatientIds)]
      );

      patients.documents.forEach((patient: any) => {
        patientsMap.set(patient.$id, patient);
      });
    }

    const appointmentsWithPatients = appointments.documents.map(
      (appointment: any) => ({
        ...appointment,
        patient: patientsMap.get(appointment.patientId) || null,
      })
    );

    const data = {
      totalCounts: appointments.total,
      documents: appointmentsWithPatients,
      pagination: {
        page,
        limit,
        total: appointments.total,
        totalPages: Math.ceil(appointments.total / limit),
        hasNextPage: page * limit < appointments.total,
        hasPreviousPage: page > 1,
      },
    };

    return parseStringify(data);
  } catch (error) {
    console.log(error);
  }
};

// Get appointment counts for stats (without pagination)
export const getAppointmentCounts = async (practiceId?: string) => {
  try {
    const queries: any[] = [];

    if (practiceId) {
      queries.push(Query.equal("practiceId", [practiceId]));
    }

    console.log("Fetching appointment counts for practice:", practiceId);

    // Get all appointments for total count
    const allAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    const scheduledQuery = [...queries, Query.equal("status", ["scheduled"])];
    const scheduledAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      scheduledQuery
    );

    const pendingQuery = [...queries, Query.equal("status", ["pending"])];
    const pendingAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      pendingQuery
    );

    const cancelledQuery = [...queries, Query.equal("status", ["cancelled"])];
    const cancelledAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      cancelledQuery
    );

    const completedQuery = [...queries, Query.equal("status", ["completed"])];
    const completedAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      completedQuery
    );

    const noShowQuery = [...queries, Query.equal("status", ["no-show"])];
    const noShowAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      noShowQuery
    );

    const counts = {
      totalCount: allAppointments.total,
      scheduledCount: scheduledAppointments.total,
      pendingCount: pendingAppointments.total,
      cancelledCount: cancelledAppointments.total,
      completedCount: completedAppointments.total,
      noShowCount: noShowAppointments.total,
    };

    console.log("Appointment counts:", counts);
    return counts;
  } catch (error) {
    console.error("Error fetching appointment counts:", error);
    return {
      totalCount: 0,
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      completedCount: 0,
      noShowCount: 0,
    };
  }
};

export const checkPatientExists = async (patientId: string) => {
  try {
    const patient = await databases.getDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId
    );
    console.log(`Patient ${patientId} exists:`, !!patient);
    return !!patient;
  } catch (error) {
    console.log(`Patient ${patientId} does not exist:`, error);
    return false;
  }
};

export const findOrphanedAppointments = async (practiceId?: string) => {
  try {
    const queries = [Query.orderDesc("$createdAt")];

    if (practiceId) {
      queries.push(Query.equal("practiceId", [practiceId]));
    }

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    const orphanedAppointments: any[] = [];

    for (const appointment of appointments.documents as any[]) {
      try {
        await databases.getDocument(
          DATABASE_ID!,
          PATIENT_COLLECTION_ID!,
          appointment.patientId
        );
      } catch (error) {
        orphanedAppointments.push({
          appointmentId: appointment.$id,
          patientId: appointment.patientId,
          schedule: appointment.schedule,
          status: appointment.status,
        });
      }
    }

    console.log("Orphaned appointments found:", orphanedAppointments);
    return orphanedAppointments;
  } catch (error) {
    console.log("Error finding orphaned appointments:", error);
    return [];
  }
};

export const updateAppointment = async ({
  appointmentId,
  appointment,
  type,
  userId,
}: UpdateAppointmentParams) => {
  try {
    const { requireAdmin } = await import("@/lib/auth/requireAdmin");
    const claims = await requireAdmin();
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) {
      throw new Error("Appointment not found");
    }

        // Invalidate multiple paths to ensure dashboard updates
    revalidatePath("/admin");
    revalidatePath("/");

    // Notifications on status changes
    try {
      const updated = await databases.getDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        appointmentId
      );
      const patient = await databases.getDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        (updated as any).patientId
      );
      const schedule = new Date((updated as any).schedule).toLocaleString();
      const status = (updated as any).status;
      if ((patient as any)?.email) {
        await sendAppointmentEmail({
          to: (patient as any).email,
          subject: `Appointment ${status}`,
          html: `<p>Your appointment is ${status} for ${schedule}.</p>`,
        });
      }
      if ((patient as any)?.phone) {
        await sendSms(
          (patient as any).phone,
          `Appointment ${status}: ${schedule}`
        );
      }
    } catch (_) {}

    return parseStringify(updatedAppointment);
  } catch (error) {
    console.log(error);
  }
};

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.log(error);
  }
};

// Optimized appointment queries for better performance
export const getAppointmentsByDateRange = async (
  practiceId: string,
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 50
) => {
  try {
    const offset = (page - 1) * limit;
    const queries = [
      Query.equal("practiceId", [practiceId]),
      Query.greaterThanEqual("schedule", startDate),
      Query.lessThanEqual("schedule", endDate),
      Query.orderAsc("schedule"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    return parseStringify(appointments);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Get today's appointments for quick overview
export const getTodaysAppointments = async (practiceId: string) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    ).toISOString();

    const queries = [
      Query.equal("practiceId", [practiceId]),
      Query.greaterThanEqual("schedule", startOfDay),
      Query.lessThanEqual("schedule", endOfDay),
      Query.orderAsc("schedule"),
      Query.limit(100),
    ];

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    // Enrich with patient details like getRecentAppointmentList
    const patientIds = appointments.documents.map(
      (appointment: any) => appointment.patientId
    );
    const uniquePatientIds = [...new Set(patientIds)];

    let patientsMap = new Map();
    if (uniquePatientIds.length > 0) {
      const patients = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        [Query.equal("$id", uniquePatientIds)]
      );

      patients.documents.forEach((patient: any) => {
        patientsMap.set(patient.$id, patient);
      });
    }

    const appointmentsWithPatients = appointments.documents.map(
      (appointment: any) => ({
        ...appointment,
        patient: patientsMap.get(appointment.patientId) || null,
      })
    );

    const enriched = {
      ...appointments,
      documents: appointmentsWithPatients,
    } as any;

    return parseStringify(enriched);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Get upcoming appointments (next 7 days)
export const getUpcomingAppointments = async (
  practiceId: string,
  page: number = 1,
  limit: number = 50
) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const queries = [
      Query.equal("practiceId", [practiceId]),
      Query.greaterThanEqual("schedule", today.toISOString()),
      Query.lessThanEqual("schedule", nextWeek.toISOString()),
      Query.orderAsc("schedule"),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ];

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    // Enrich with patient details like getRecentAppointmentList
    const patientIds = appointments.documents.map(
      (appointment: any) => appointment.patientId
    );
    const uniquePatientIds = [...new Set(patientIds)];

    let patientsMap = new Map();
    if (uniquePatientIds.length > 0) {
      const patients = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        [Query.equal("$id", uniquePatientIds)]
      );

      patients.documents.forEach((patient: any) => {
        patientsMap.set(patient.$id, patient);
      });
    }

    const appointmentsWithPatients = appointments.documents.map(
      (appointment: any) => ({
        ...appointment,
        patient: patientsMap.get(appointment.patientId) || null,
      })
    );

    const enriched = {
      ...appointments,
      documents: appointmentsWithPatients,
    } as any;

    return parseStringify(enriched);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Analytics and reporting functions
export const getAppointmentAnalytics = async (
  practiceId: string,
  period: "week" | "month" | "quarter" = "month"
) => {
  try {
    console.log(
      "Getting appointment analytics for practice:",
      practiceId,
      "period:",
      period
    );
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "week":
        // Last 7 days + today + next 7 days (2 week window centered on today)
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        // Current month (from 1st to last day of current month)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "quarter":
        // Current quarter (3 months)
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0, 23, 59, 59, 999);
        break;
      default:
        // Default to current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    console.log(
      "Date range:",
      startDate.toISOString(),
      "to",
      endDate.toISOString()
    );

    const queries = [
      Query.equal("practiceId", [practiceId]),
      Query.greaterThanEqual("schedule", startDate.toISOString()),
      Query.lessThanEqual("schedule", endDate.toISOString()),
    ];

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    console.log("Found appointments:", appointments.total);

    const total = appointments.total;
    const scheduled = appointments.documents.filter(
      (apt: any) => apt.status === "scheduled"
    ).length;
    const completed = appointments.documents.filter(
      (apt: any) => apt.status === "completed"
    ).length;
    const cancelled = appointments.documents.filter(
      (apt: any) => apt.status === "cancelled"
    ).length;
    const pending = appointments.documents.filter(
      (apt: any) => apt.status === "pending"
    ).length;
    const noShows = appointments.documents.filter(
      (apt: any) => apt.status === "no-show"
    ).length;

    console.log("Status breakdown:", {
      total,
      scheduled,
      completed,
      cancelled,
      pending,
      noShows,
    });

    // Skip doctor stats for now since primaryPhysician field doesn't exist in schema
    const doctorStats = new Map();

    const analytics = {
      period,
      total,
      scheduled,
      completed,
      cancelled,
      pending,
      noShows,
      completionRate:
        total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0,
      cancellationRate:
        total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
      noShowRate: total > 0 ? Number(((noShows / total) * 100).toFixed(1)) : 0,
      doctorStats: Object.fromEntries(doctorStats),
    };

    console.log("Analytics result:", analytics);
    return analytics;
  } catch (error) {
    console.error("Error in getAppointmentAnalytics:", error);
    // Return default values instead of throwing
    return {
      period,
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      noShows: 0,
      completionRate: 0,
      cancellationRate: 0,
      noShowRate: 0,
      doctorStats: {},
    };
  }
};

// Get capacity utilization based on practice settings
export const getCapacityUtilization = async (
  practiceId: string,
  date: string
) => {
  try {
    console.log(
      "Getting capacity utilization for practice:",
      practiceId,
      "date:",
      date
    );
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("[Capacity] date:", date);

    const appointmentQueries = [
      Query.equal("practiceId", [practiceId]),
      Query.greaterThanEqual("schedule", startOfDay.toISOString()),
      Query.lessThanEqual("schedule", endOfDay.toISOString()),
    ];

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentQueries
    );

    console.log("[Capacity] appointments total:", appointments.total);

    const { getPracticeSettingsForAnalytics } = await import("./practice.actions");
    const settings = await getPracticeSettingsForAnalytics(practiceId);
    console.log(
      "[Capacity] settings interval/raw:",
      settings?.consultationInterval
    );
    if (!settings) {
      return {
        date,
        totalCapacity: 0,
        bookedSlots: 0,
        availableSlots: 0,
        utilizationRate: 0,
      };
    }

    const dayOfWeek = new Date(date).getDay();
    // In Next.js, functions exported from a "use server" module may be proxied and return a Promise
    // even if they are synchronous utilities. Await to handle both Promise and non-Promise returns.
    const hours = await (getBusinessHoursForDay as any)(
      settings as any,
      dayOfWeek
    );
    console.log("[Capacity] hours:", hours);
    if (!hours) {
      return {
        date,
        totalCapacity: 0,
        bookedSlots: 0,
        availableSlots: 0,
        utilizationRate: 0,
      };
    }

    let intervalMinutes = Number((settings as any).consultationInterval);
    if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0)
      intervalMinutes = 30;
    console.log("[Capacity] intervalMinutes:", intervalMinutes);

    const start = new Date(date);
    start.setHours(hours.startHour, hours.startMinute, 0, 0);
    const end = new Date(date);
    end.setHours(hours.endHour, hours.endMinute, 0, 0);

    const totalMinutesRaw = Math.floor(
      (end.getTime() - start.getTime()) / 60000
    );
    const totalMinutes =
      Number.isFinite(totalMinutesRaw) && totalMinutesRaw > 0
        ? totalMinutesRaw
        : 0;
    const totalCapacityRaw =
      intervalMinutes > 0 ? Math.floor(totalMinutes / intervalMinutes) : 0;
    const totalCapacity =
      Number.isFinite(totalCapacityRaw) && totalCapacityRaw >= 0
        ? totalCapacityRaw
        : 0;

    console.log(
      "[Capacity] totalMinutes:",
      totalMinutes,
      "totalCapacity:",
      totalCapacity
    );

    const bookedSlots = (appointments.documents as any[]).filter(
      (apt: any) => apt.status === "scheduled" || apt.status === "completed"
    ).length;
    console.log("[Capacity] bookedSlots:", bookedSlots);

    const availableSlotsRaw = totalCapacity - bookedSlots;
    const availableSlots = availableSlotsRaw > 0 ? availableSlotsRaw : 0;
    const utilizationRate =
      totalCapacity > 0
        ? Number(((bookedSlots / totalCapacity) * 100).toFixed(1))
        : 0;

    console.log(
      "[Capacity] availableSlots:",
      availableSlots,
      "utilizationRate:",
      utilizationRate
    );

    const result = {
      date,
      totalCapacity,
      bookedSlots,
      availableSlots,
      utilizationRate,
    };

    console.log("Capacity utilization result:", result);
    return result;
  } catch (error) {
    console.error("Error in getCapacityUtilization:", error);
    // Return default values instead of throwing
    return {
      date,
      totalCapacity: 0,
      bookedSlots: 0,
      availableSlots: 0,
      utilizationRate: 0,
    };
  }
};
