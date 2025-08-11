"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormControl } from "@/components/ui/form";
import Image from "next/image";
import { getAvailableSlotsForDate } from "@/lib/appointment-validation";
import { generateTimeSlots } from "@/lib/utils";
import { getPracticeSettings } from "@/lib/actions/practice.actions";

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
  const [previousSelection, setPreviousSelection] = useState<Date | null>(null);
  const [businessDays, setBusinessDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default to Monday-Friday
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);
  const [timeIntervals, setTimeIntervals] = useState<number>(30);
  const [minTime, setMinTime] = useState<Date>(
    new Date(new Date().setHours(8, 0, 0, 0))
  );
  const [maxTime, setMaxTime] = useState<Date>(
    new Date(new Date().setHours(17, 0, 0, 0))
  );
  // Bump this when practice settings are saved elsewhere to refresh locally
  const [settingsVersion, setSettingsVersion] = useState<number>(0);

  const getBusinessDaysFromSettingsLocal = (settings: any): number[] => {
    const business: number[] = [];
    const dayChecks = [
      { day: 1, closed: settings.mondayClosed, open: settings.mondayOpen },
      { day: 2, closed: settings.tuesdayClosed, open: settings.tuesdayOpen },
      {
        day: 3,
        closed: settings.wednesdayClosed,
        open: settings.wednesdayOpen,
      },
      { day: 4, closed: settings.thursdayClosed, open: settings.thursdayOpen },
      { day: 5, closed: settings.fridayClosed, open: settings.fridayOpen },
      { day: 6, closed: settings.saturdayClosed, open: settings.saturdayOpen },
      { day: 0, closed: settings.sundayClosed, open: settings.sundayOpen },
    ];
    dayChecks.forEach(({ day, closed, open }) => {
      if (!closed && open) business.push(day);
    });
    return business;
  };

  const getHoursForDay = (settings: any, dayOfWeek: number) => {
    const map: any = {
      0: {
        open: settings.sundayOpen,
        close: settings.sundayClose,
        closed: settings.sundayClosed,
      },
      1: {
        open: settings.mondayOpen,
        close: settings.mondayClose,
        closed: settings.mondayClosed,
      },
      2: {
        open: settings.tuesdayOpen,
        close: settings.tuesdayClose,
        closed: settings.tuesdayClosed,
      },
      3: {
        open: settings.wednesdayOpen,
        close: settings.wednesdayClose,
        closed: settings.wednesdayClosed,
      },
      4: {
        open: settings.thursdayOpen,
        close: settings.thursdayClose,
        closed: settings.thursdayClosed,
      },
      5: {
        open: settings.fridayOpen,
        close: settings.fridayClose,
        closed: settings.fridayClosed,
      },
      6: {
        open: settings.saturdayOpen,
        close: settings.saturdayClose,
        closed: settings.saturdayClosed,
      },
    };

    const entry = map[dayOfWeek];
    if (!entry || entry.closed || !entry.open || !entry.close) return null;

    const [startHourRaw, startMinuteRaw] = String(entry.open).split(":");
    const [endHourRaw, endMinuteRaw] = String(entry.close).split(":");
    const startHour = Number(startHourRaw);
    const startMinute = Number(startMinuteRaw);
    const endHour = Number(endHourRaw);
    const endMinute = Number(endMinuteRaw);
    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMinute) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMinute)
    )
      return null;
    return { startHour, startMinute, endHour, endMinute } as const;
  };

  // Filter time options to only show available slots
  const filterTime = (time: Date) => {
    // While loading, don't disable any times
    if (isLoading) return true;
    if (!selected) return true;

    const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();
    const timeMinutes = minutesOfDay(time);

    const isAvailable = availableSlots.some(
      (slot) => minutesOfDay(slot) === timeMinutes
    );

    return isAvailable;
  };

  // Custom onChange handler to control when the calendar closes
  const handleDateChange = (date: Date | null) => {
    onChange(date);
    setPreviousSelection(date);
  };

  // Load practice settings to get business days
  useEffect(() => {
    if (practiceId) {
      getPracticeSettings(practiceId)
        .then((settings) => {
          if (settings) {
            const days = getBusinessDaysFromSettingsLocal(settings);
            setBusinessDays(Array.isArray(days) ? days : []);
            setSettingsLoaded(true);
            try {
              const dayNames = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ];
              console.log("[DatePicker] Settings fetched:", settings);
              console.log("[DatePicker] Business days (numbers):", days);
              console.log(
                "[DatePicker] Business days (names):",
                (Array.isArray(days) ? days : []).map((d) => dayNames[d])
              );
            } catch {}
          } else {
            // No settings found; use default weekdays but mark not loaded
            setSettingsLoaded(false);
            setBusinessDays([1, 2, 3, 4, 5]);
          }
        })
        .catch((error) => {
          console.error("Error loading practice settings:", error);
          // Keep default business days
          setSettingsLoaded(false);
        });
    }
  }, [practiceId, settingsVersion]);

  // Load dynamic time settings (intervals and day hours) based on practice settings and selected date
  useEffect(() => {
    if (!practiceId) return;
    getPracticeSettings(practiceId)
      .then((settings) => {
        if (!settings) return;
        const intervalRaw = (settings as any).consultationInterval;
        const intervalNum = Number(intervalRaw);
        setTimeIntervals(
          Number.isFinite(intervalNum) && intervalNum > 0 ? intervalNum : 30
        );
        console.log(
          "[DatePicker] Interval minutes:",
          Number.isFinite(intervalNum) && intervalNum > 0 ? intervalNum : 30
        );

        const target =
          selected instanceof Date && !isNaN(selected as any)
            ? selected
            : new Date();
        const hours = getHoursForDay(settings as any, target.getDay());
        // If the day is closed, ensure UI disables it
        if (!hours) {
          const day = target.getDay();
          const updatedDays = getBusinessDaysFromSettingsLocal(settings as any);
          setBusinessDays(Array.isArray(updatedDays) ? updatedDays : []);
          setSettingsLoaded(true);
        }
        if (hours) {
          const min = new Date(target);
          min.setHours(hours.startHour, hours.startMinute, 0, 0);
          const max = new Date(target);
          max.setHours(hours.endHour, hours.endMinute, 0, 0);
          setMinTime(min);
          setMaxTime(max);
          console.log("[DatePicker] Hours for day", target.getDay(), hours);
          console.log("[DatePicker] Min/Max time:", min, max);
        } else {
          // Fallback defaults if day is closed or invalid
          setMinTime(new Date(new Date().setHours(8, 0, 0, 0)));
          setMaxTime(new Date(new Date().setHours(17, 0, 0, 0)));
          console.log(
            "[DatePicker] Day closed or invalid, using defaults 08:00-17:00"
          );
        }
      })
      .catch(() => {
        // Keep defaults
      });
  }, [practiceId, selected, settingsVersion]);

  // Listen for practice settings save events to refresh dynamically
  useEffect(() => {
    const handler = () => setSettingsVersion((v) => v + 1);
    if (typeof window !== "undefined") {
      window.addEventListener(
        "practice-settings:saved",
        handler as EventListener
      );
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "practice-settings:saved",
          handler as EventListener
        );
      }
    };
  }, []);

  // When no available slots are returned (e.g., no settings yet), fall back to allowing selection
  const hasAnySlots = availableSlots.length > 0;

  // Load available slots when date changes
  useEffect(() => {
    if (selected && practiceId) {
      setIsLoading(true);
      getAvailableSlotsForDate(selected, practiceId)
        .then((slots) => {
          setAvailableSlots(slots);
          console.log(
            "[DatePicker] Selected:",
            selected,
            "Available slots count:",
            Array.isArray(slots) ? slots.length : 0
          );
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
          style={{ height: "auto", width: 24 }}
          priority={false}
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
              filterTime={hasAnySlots ? filterTime : undefined}
              timeFormat="HH:mm"
              timeIntervals={timeIntervals} // This will be overridden by practice settings
              minTime={minTime} // This will be overridden by practice settings
              maxTime={maxTime} // This will be overridden by practice settings
              preventOpenOnFocus
              shouldCloseOnSelect={false}
              filterDate={(date) => {
                const day = date.getDay();
                const allowedDays = settingsLoaded
                  ? businessDays
                  : [1, 2, 3, 4, 5];
                return allowedDays.includes(day);
              }}
              dayClassName={(date): string | null => {
                const day = date.getDay();
                const allowedDays = settingsLoaded
                  ? businessDays
                  : [1, 2, 3, 4, 5];
                return allowedDays.includes(day)
                  ? null
                  : "react-datepicker__day--disabled";
              }}
              placeholderText={getPlaceholderText()}
              isClearable
              showPopperArrow={false}
              disabled={false}
              popperClassName="datepicker-popper"
            />
            <div className="loading-circle">
              <div className="relative h-5 w-5">
                {isLoading && (
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                )}
                <div className="absolute inset-[3px] rounded-full bg-blue-600"></div>
              </div>
            </div>
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
