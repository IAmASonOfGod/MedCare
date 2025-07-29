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

export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    // Validate the appointment slot before creating
    const validation = await validateAppointmentSlot(appointment.schedule);

    if (!validation.isValid) {
      throw new Error(validation.message || "Invalid appointment slot");
    }

    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    return parseStringify(newAppointment);
  } catch (error) {
    console.log(error);
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

    // Add practice filter if practiceId is provided
    if (practiceId) {
      queries.push(Query.equal("practiceId", [practiceId]));
    }

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    // Fetch all patient data in a single query to avoid N+1 problem
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

      // Create a map for quick patient lookup
      patients.documents.forEach((patient: any) => {
        patientsMap.set(patient.$id, patient);
      });
    }

    // Attach patient data to appointments
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
    const queries = [];

    // Add practice filter if practiceId is provided
    if (practiceId) {
      queries.push(Query.equal("practiceId", [practiceId]));
    }

    // Get scheduled appointments count
    const scheduledQuery = [...queries, Query.equal("status", ["scheduled"])];
    const scheduledAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      scheduledQuery
    );

    // Get pending appointments count
    const pendingQuery = [...queries, Query.equal("status", ["pending"])];
    const pendingAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      pendingQuery
    );

    // Get cancelled appointments count
    const cancelledQuery = [...queries, Query.equal("status", ["cancelled"])];
    const cancelledAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      cancelledQuery
    );

    return {
      scheduledCount: scheduledAppointments.total,
      pendingCount: pendingAppointments.total,
      cancelledCount: cancelledAppointments.total,
    };
  } catch (error) {
    console.log(error);
    return {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };
  }
};

// Helper function to check if a patient exists
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

// Function to find and optionally delete orphaned appointments
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

    const orphanedAppointments = [];

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
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) {
      throw new Error("Appointment not found");
    }

    // const smsMessage = `
    // Hi, it's CarePulse.
    // ${
    //   type === "scheduled"
    //     ? `Your appointment has been scheduled for ${
    //         formatDateTime(appointment.schedule!).dateTime
    //       } with Dr. ${appointment.primaryPhysician}.`
    //     : `We regret to inform you that your appointment has been cancelled for the following reason: ${appointment.cancellationReason}.`
    // }`;

    // await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");

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
      Query.limit(100), // Reasonable limit for daily appointments
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

    return parseStringify(appointments);
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
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case "quarter":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        );
        break;
      default:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
    }

    const queries = [
      Query.equal("practiceId", [practiceId]),
      Query.greaterThanEqual("schedule", startDate.toISOString()),
      Query.lessThanEqual("schedule", now.toISOString()),
    ];

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    // Calculate analytics
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
    const noShows = appointments.documents.filter(
      (apt: any) => apt.status === "no-show"
    ).length;

    // Doctor-wise breakdown
    const doctorStats = new Map();
    appointments.documents.forEach((apt: any) => {
      const doctor = apt.primaryPhysician;
      if (!doctorStats.has(doctor)) {
        doctorStats.set(doctor, {
          total: 0,
          scheduled: 0,
          completed: 0,
          cancelled: 0,
          noShows: 0,
        });
      }
      const stats = doctorStats.get(doctor);
      stats.total++;
      stats[apt.status]++;
    });

    return {
      period,
      total,
      scheduled,
      completed,
      cancelled,
      noShows,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      cancellationRate: total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0,
      noShowRate: total > 0 ? ((noShows / total) * 100).toFixed(1) : 0,
      doctorStats: Object.fromEntries(doctorStats),
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Get appointment trends over time
export const getAppointmentTrends = async (
  practiceId: string,
  days: number = 30
) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const queries = [
      Query.equal("practiceId", [practiceId]),
      Query.greaterThanEqual("schedule", startDate.toISOString()),
      Query.lessThanEqual("schedule", now.toISOString()),
      Query.orderAsc("schedule"),
    ];

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    // Group by date
    const dailyStats = new Map();
    appointments.documents.forEach((apt: any) => {
      const date = new Date(apt.schedule).toISOString().split("T")[0];
      if (!dailyStats.has(date)) {
        dailyStats.set(date, {
          total: 0,
          scheduled: 0,
          completed: 0,
          cancelled: 0,
        });
      }
      const stats = dailyStats.get(date);
      stats.total++;
      stats[apt.status]++;
    });

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Get capacity utilization
export const getCapacityUtilization = async (
  practiceId: string,
  date: string
) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get appointments for the day
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

    // Get available providers for the practice
    // const providers = await getHealthcareProviders(practiceId); // This line is removed
    // const availableProviders = providers.documents.filter( // This line is removed
    //   (provider: any) => provider.isActive && provider.isAvailable // This line is removed
    // ); // This line is removed

    // Calculate total capacity based on available providers // This line is removed
    // Assuming 9 hours * 2 slots per hour = 18 slots per provider // This line is removed
    const slotsPerProvider = 18; // 9 hours * 2 slots per hour // This line is removed
    const totalCapacity = 0; // This line is removed

    const bookedSlots = appointments.documents.filter(
      (apt: any) => apt.status === "scheduled" || apt.status === "completed"
    ).length;

    return {
      date,
      totalCapacity,
      bookedSlots,
      availableSlots: totalCapacity - bookedSlots,
      utilizationRate:
        totalCapacity > 0
          ? ((bookedSlots / totalCapacity) * 100).toFixed(1)
          : "0",
      activeProviders: 0, // This line is removed
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
