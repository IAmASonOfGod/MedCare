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
import { getPracticeSettings, getBusinessDaysFromSettings, getBusinessHoursForDay } from "./actions/practice.actions";

export const getBookedAppointmentsForDate = async (date: Date, practiceId: string) => {
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
        Query.equal("practiceId", practiceId),
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

export const getAvailableSlotsForDate = async (date: Date, practiceId: string) => {
  try {
    const bookedSlots = await getBookedAppointmentsForDate(date, practiceId);
    const allSlots = await generateTimeSlotsWithSettings(date, practiceId);
    const availableSlots = filterAvailableSlots(allSlots, bookedSlots);

    return availableSlots;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// New function to generate time slots using practice settings
export const generateTimeSlotsWithSettings = async (date: Date, practiceId: string) => {
  try {
    const practiceSettings = await getPracticeSettings(practiceId);
    
    if (!practiceSettings) {
      console.warn('No practice settings found, using default values');
      return generateTimeSlots(date);
    }

    const businessDays = getBusinessDaysFromSettings(practiceSettings);
    const dayOfWeek = date.getDay();
    
    // Check if the practice is open on this day
    if (!businessDays.includes(dayOfWeek)) {
      return [];
    }

    const businessHours = getBusinessHoursForDay(practiceSettings, dayOfWeek);
    if (!businessHours) {
      return [];
    }

    const slots: Date[] = [];
    const { startHour, startMinute, endHour, endMinute } = businessHours;
    const bookingInterval = practiceSettings.consultationInterval || 30; // Default to 30 minutes

    // Create slots based on practice settings
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    let currentSlot = new Date(startTime);
    
    while (currentSlot < endTime) {
      slots.push(new Date(currentSlot));
      currentSlot.setMinutes(currentSlot.getMinutes() + bookingInterval);
    }

    return slots;
  } catch (error) {
    console.error('Error generating time slots with settings:', error);
    return generateTimeSlots(date); // Fallback to default
  }
};

export const validateAppointmentSlot = async (
  proposedDate: Date,
  practiceId: string
): Promise<{ isValid: boolean; message?: string }> => {
  try {
    // Check for conflicts only - UI handles business hours and slot alignment
    const bookedSlots = await getBookedAppointmentsForDate(proposedDate, practiceId);
    
    // Get practice settings to determine slot duration
    const practiceSettings = await getPracticeSettings(practiceId);
    const slotDuration = practiceSettings?.consultationInterval || 30; // Default to 30 minutes
    
    const slotEnd = new Date(proposedDate.getTime() + slotDuration * 60000);

    const hasConflict = bookedSlots.some((bookedSlot) => {
      const bookedEnd = new Date(bookedSlot.getTime() + slotDuration * 60000);
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
