"use server";

import { ID, Query } from "node-appwrite";
import {
  APPOINTMENT_COLLECTION_ID,
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
    const validation = await validateAppointmentSlot(
      appointment.primaryPhysician,
      appointment.schedule
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

export const getRecentAppointmentList = async (practiceId?: string) => {
  try {
    const queries = [Query.orderDesc("$createdAt")];
    
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
    const patientIds = appointments.documents.map((appointment: any) => appointment.patientId);
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
    const appointmentsWithPatients = appointments.documents.map((appointment: any) => ({
      ...appointment,
      patient: patientsMap.get(appointment.patientId) || null
    }));

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = appointmentsWithPatients.reduce(
      (acc, appointment) => {
        if (appointment.status === "scheduled") {
          acc.scheduledCount += 1;
        } else if (appointment.status === "pending") {
          acc.pendingCount += 1;
        } else if (appointment.status === "cancelled") {
          acc.cancelledCount += 1;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCounts: appointments.total,
      ...counts,
      documents: appointmentsWithPatients,
    };

    return parseStringify(data);
  } catch (error) {
    console.log(error);
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
