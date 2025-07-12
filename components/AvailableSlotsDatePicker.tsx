"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormControl } from "@/components/ui/form";
import Image from "next/image";
import { getAvailableSlotsForDoctor } from "@/lib/appointment-validation";
import { generateTimeSlots } from "@/lib/utils";

interface AvailableSlotsDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  doctorName: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  wrapperClassName?: string;
  error?: string;
}

const AvailableSlotsDatePicker: React.FC<AvailableSlotsDatePickerProps> = ({
  selected,
  onChange,
  doctorName,
  dateFormat = "MM/dd/yyyy",
  showTimeSelect = false,
  wrapperClassName = "date-picker",
  error,
}) => {
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [previousSelection, setPreviousSelection] = useState<Date | null>(null);

  // Filter time options to only show available slots
  const filterTime = (time: Date) => {
    if (!doctorName) return true; // If no doctor selected, allow all times

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

  // Load available slots when doctor or date changes
  useEffect(() => {
    if (doctorName && selected) {
      setIsLoading(true);
      getAvailableSlotsForDoctor(doctorName, selected)
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
  }, [doctorName, selected]);

  // Show different placeholder based on doctor selection
  const getPlaceholderText = () => {
    if (isLoading) return "Loading available slots...";
    if (!doctorName) return "Please select a doctor first";
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
              timeIntervals={30}
              minTime={new Date(new Date().setHours(8, 0, 0, 0))}
              maxTime={new Date(new Date().setHours(17, 0, 0, 0))}
              filterDate={(date) => {
                // Only allow weekdays (Monday = 1, Friday = 5)
                const day = date.getDay();
                return day >= 1 && day <= 5;
              }}
              placeholderText={getPlaceholderText()}
              isClearable
              showPopperArrow={false}
              disabled={isLoading || !doctorName}
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
