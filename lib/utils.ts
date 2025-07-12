import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  BUSINESS_HOURS,
  BUSINESS_DAYS,
  APPOINTMENT_SLOT_DURATION,
} from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date | string) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    // weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    year: "numeric", // numeric year (e.g., '2023')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function encryptKey(passkey: string) {
  return btoa(passkey);
}

export function decryptKey(passkey: string) {
  return atob(passkey);
}

// APPOINTMENT VALIDATION FUNCTIONS
export function isWithinBusinessHours(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  const minute = date.getMinutes();

  // Check if it's a business day
  if (!BUSINESS_DAYS.includes(dayOfWeek)) {
    return false;
  }

  // Check if it's within business hours
  const totalMinutes = hour * 60 + minute;
  const startMinutes =
    BUSINESS_HOURS.startHour * 60 + BUSINESS_HOURS.startMinute;
  const endMinutes = BUSINESS_HOURS.endHour * 60 + BUSINESS_HOURS.endMinute;

  return totalMinutes >= startMinutes && totalMinutes < endMinutes;
}

export function isSlotAligned(date: Date): boolean {
  const minute = date.getMinutes();
  return minute % APPOINTMENT_SLOT_DURATION === 0;
}

export function generateTimeSlots(date: Date): Date[] {
  const slots: Date[] = [];
  const startDate = new Date(date);
  startDate.setHours(
    BUSINESS_HOURS.startHour,
    BUSINESS_HOURS.startMinute,
    0,
    0
  );

  const endDate = new Date(date);
  endDate.setHours(BUSINESS_HOURS.endHour, BUSINESS_HOURS.endMinute, 0, 0);

  let currentSlot = new Date(startDate);

  while (currentSlot < endDate) {
    slots.push(new Date(currentSlot));
    currentSlot.setMinutes(
      currentSlot.getMinutes() + APPOINTMENT_SLOT_DURATION
    );
  }

  return slots;
}

export function filterAvailableSlots(
  allSlots: Date[],
  bookedSlots: Date[],
  selectedDoctor?: string
): Date[] {
  return allSlots.filter((slot) => {
    // Check if slot is within business hours
    if (!isWithinBusinessHours(slot)) {
      return false;
    }

    // Check if slot is aligned with appointment duration
    if (!isSlotAligned(slot)) {
      return false;
    }

    // Check if slot conflicts with existing appointments
    const slotEnd = new Date(
      slot.getTime() + APPOINTMENT_SLOT_DURATION * 60000
    );

    const hasConflict = bookedSlots.some((bookedSlot) => {
      const bookedEnd = new Date(
        bookedSlot.getTime() + APPOINTMENT_SLOT_DURATION * 60000
      );
      return (
        (slot >= bookedSlot && slot < bookedEnd) ||
        (slotEnd > bookedSlot && slotEnd <= bookedEnd) ||
        (slot <= bookedSlot && slotEnd >= bookedEnd)
      );
    });

    return !hasConflict;
  });
}
