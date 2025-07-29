"use server";

import { ID, Query } from "node-appwrite";
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
} from "./appwrite.config";
import { Appointment } from "@/types/appwrite.types";
import {
  isWithinBusinessHours,
  isSlotAligned,
  generateTimeSlots,
  filterAvailableSlots,
} from "./utils";

export const getBookedAppointmentsForDate = async (date: Date) => {
  try {
    // Get the start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Fetching appointments for ${date.toDateString()}`);

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.greaterThanEqual("schedule", startOfDay.toISOString()),
        Query.lessThanEqual("schedule", endOfDay.toISOString()),
        Query.equal("status", ["scheduled", "pending"]),
      ]
    );

    const bookedSlots = (appointments.documents as Appointment[]).map(
      (a) => new Date(a.schedule)
    );

    console.log(`Found ${bookedSlots.length} booked slots`);
    return bookedSlots;
  } catch (error) {
    console.error("Error fetching booked appointments:", error);
    return [];
  }
};

export const getAvailableSlotsForDate = async (date: Date) => {
  try {
    const bookedSlots = await getBookedAppointmentsForDate(date);
    const allSlots = generateTimeSlots(date);
    const availableSlots = filterAvailableSlots(allSlots, bookedSlots);

    return availableSlots;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const validateAppointmentSlot = async (
  proposedDate: Date
): Promise<{ isValid: boolean; message?: string }> => {
  try {
    // Check for conflicts only - UI handles business hours and slot alignment
    const bookedSlots = await getBookedAppointmentsForDate(proposedDate);
    const slotEnd = new Date(proposedDate.getTime() + 30 * 60000); // 30 minutes

    const hasConflict = bookedSlots.some((bookedSlot) => {
      const bookedEnd = new Date(bookedSlot.getTime() + 30 * 60000);
      return (
        (proposedDate >= bookedSlot && proposedDate < bookedEnd) ||
        (slotEnd > bookedSlot && slotEnd <= bookedEnd) ||
        (proposedDate <= bookedSlot && slotEnd >= bookedEnd)
      );
    });

    if (hasConflict) {
      return {
        isValid: false,
        message:
          "This time slot is already booked. Please select another time.",
      };
    }

    return { isValid: true };
  } catch (error) {
    console.log(error);
    return {
      isValid: false,
      message: "An error occurred while validating the appointment slot",
    };
  }
};
