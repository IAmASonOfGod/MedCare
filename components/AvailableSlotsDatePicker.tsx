"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormControl } from "@/components/ui/form";
import Image from "next/image";
import { getAvailableSlotsForDate } from "@/lib/appointment-validation";
import { generateTimeSlots } from "@/lib/utils";
import { getPracticeSettings, getBusinessDaysFromSettings } from "@/lib/actions/practice.actions";

interface AvailableSlotsDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  dateFormat?: string;
  showTimeSelect?: boolean;
  wrapperClassName?: string;
  error?: string;
  practiceId: string; // Add practiceId prop
}

const AvailableSlotsDatePicker: React.FC<AvailableSlotsDatePickerProps> = ({
  selected,
  onChange,
  dateFormat = "MM/dd/yyyy",
  showTimeSelect = false,
  wrapperClassName = "date-picker",
  error,
  practiceId,
}) => {
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [previousSelection, setPreviousSelection] = useState<Date | null>(null);
  const [businessDays, setBusinessDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default to Monday-Friday

  // Filter time options to only show available slots
  const filterTime = (time: Date) => {
    // Check if this time is in the available slots
    const timeString = time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });

    const isAvailable = availableSlots.some((slot) => {
      const slotString = slot.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      });
      return slotString === timeString;
    });

    console.log(`Filtering time ${timeString}, available: ${isAvailable}`);
    return isAvailable;
  };

  // Custom onChange handler to control when the calendar closes
  const handleDateChange = (date: Date | null) => {
    onChange(date);

    if (date && showTimeSelect) {
      // Check if this is a time selection (same date, different time)
      if (
        previousSelection &&
        previousSelection.getDate() === date.getDate() &&
        previousSelection.getMonth() === date.getMonth() &&
        previousSelection.getFullYear() === date.getFullYear() &&
        (previousSelection.getHours() !== date.getHours() ||
          previousSelection.getMinutes() !== date.getMinutes())
      ) {
        // Time was selected, close the calendar
        setIsOpen(false);
      } else {
        // Date was selected, keep calendar open for time selection
        setIsOpen(true);
      }
    } else if (date && !showTimeSelect) {
      // If no time selection needed, close immediately
      setIsOpen(false);
    }

    setPreviousSelection(date);
  };

  // Load practice settings to get business days and time settings
  useEffect(() => {
    if (practiceId) {
      getPracticeSettings(practiceId)
        .then((settings) => {
          if (settings) {
            const days = getBusinessDaysFromSettings(settings);
            setBusinessDays(days);
          }
        })
        .catch((error) => {
          console.error("Error loading practice settings:", error);
          // Keep default business days
        });
    }
  }, [practiceId]);

  // Get dynamic time settings from practice settings
  const getTimeSettings = () => {
    // Default values
    let minTime = new Date(new Date().setHours(8, 0, 0, 0));
    let maxTime = new Date(new Date().setHours(17, 0, 0, 0));
    let timeIntervals = 30;

    // These will be updated when practice settings are loaded
    return { minTime, maxTime, timeIntervals };
  };

  const { minTime, maxTime, timeIntervals } = getTimeSettings();

  // Load available slots when date changes
  useEffect(() => {
    if (selected && practiceId) {
      setIsLoading(true);
      getAvailableSlotsForDate(selected, practiceId)
        .then((slots) => {
          setAvailableSlots(slots);
        })
        .catch((error) => {
          console.error("Error loading available slots:", error);
          setAvailableSlots([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setAvailableSlots([]);
      setIsLoading(false);
    }
  }, [selected, practiceId]);

  // Show different placeholder based on loading state
  const getPlaceholderText = () => {
    if (isLoading) return "Loading available slots...";
    return "Select date and time";
  };

  return (
    <div className="space-y-2">
      <div className="flex rounded-md border border-dark-500 bg-dark-400">
        <Image
          src="/assets/icons/calendar.svg"
          height={24}
          width={24}
          alt="calendar"
          className="ml-2"
        />
        <FormControl>
          <div className="relative flex-1 date-picker-wrapper">
            <DatePicker
              selected={selected}
              onChange={handleDateChange}
              dateFormat={dateFormat}
              showTimeSelect={showTimeSelect}
              timeInputLabel="Time"
              wrapperClassName={wrapperClassName}
              filterTime={filterTime}
              timeFormat="HH:mm"
              timeIntervals={timeIntervals} // This will be overridden by practice settings
              minTime={minTime} // This will be overridden by practice settings
              maxTime={maxTime} // This will be overridden by practice settings
              filterDate={(date) => {
                // Use dynamic business days from practice settings
                const day = date.getDay();
                return businessDays.includes(day);
              }}
              placeholderText={getPlaceholderText()}
              isClearable
              showPopperArrow={false}
              disabled={isLoading}
              popperClassName="datepicker-popper"
              open={isOpen}
              onCalendarOpen={() => setIsOpen(true)}
              onCalendarClose={() => setIsOpen(false)}
            />
            {isLoading && (
              <div className="loading-circle">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </FormControl>
      </div>
      {error && (
        <div className="text-red-500 text-sm font-medium px-2">{error}</div>
      )}
    </div>
  );
};

export default AvailableSlotsDatePicker;
