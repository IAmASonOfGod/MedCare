"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomFormField from "./CustomFormField";
import { Form } from "@/components/ui/form";
import { FormFieldType } from "./forms/PatientForm";
import { SelectItem } from "./ui/select";
import {
  PracticeSettings,
  getPracticeSettings,
  savePracticeSettings,
} from "@/lib/actions/practice.actions";
import { z } from "zod";

const PracticeSettingsSchema = z.object({
  practiceName: z.string().optional(),
  practiceType: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  streetAddress: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  consultationInterval: z
    .string()
    .refine((v) => ["5", "10", "15", "30", "60", "120"].includes(v), {
      message:
        "Consultation interval must be 5, 10, 15, 30, 60, or 120 minutes",
    }),
  mondayOpen: z.string().optional(),
  mondayClose: z.string().optional(),
  mondayClosed: z.boolean().default(false),
  tuesdayOpen: z.string().optional(),
  tuesdayClose: z.string().optional(),
  tuesdayClosed: z.boolean().default(false),
  wednesdayOpen: z.string().optional(),
  wednesdayClose: z.string().optional(),
  wednesdayClosed: z.boolean().default(false),
  thursdayOpen: z.string().optional(),
  thursdayClose: z.string().optional(),
  thursdayClosed: z.boolean().default(false),
  fridayOpen: z.string().optional(),
  fridayClose: z.string().optional(),
  fridayClosed: z.boolean().default(false),
  saturdayOpen: z.string().optional(),
  saturdayClose: z.string().optional(),
  saturdayClosed: z.boolean().default(false),
  sundayOpen: z.string().optional(),
  sundayClose: z.string().optional(),
  sundayClosed: z.boolean().default(false),
  publicHolidaysOpen: z.string().optional(),
  publicHolidaysClose: z.string().optional(),
  publicHolidaysClosed: z.boolean().default(false),
});

interface PracticeSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practiceId: string;
}

const PracticeSettingsModal: React.FC<PracticeSettingsModalProps> = ({
  open,
  onOpenChange,
  practiceId,
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<z.infer<typeof PracticeSettingsSchema>>({
    resolver: zodResolver(PracticeSettingsSchema) as any,
    defaultValues: {
      practiceName: "",
      practiceType: "",
      contactEmail: "",
      contactPhone: "",
      streetAddress: "",
      suburb: "",
      city: "",
      province: "",
      postalCode: "",
      country: "",
      consultationInterval: "30",
      mondayOpen: "09:00",
      mondayClose: "17:00",
      mondayClosed: false,
      tuesdayOpen: "09:00",
      tuesdayClose: "17:00",
      tuesdayClosed: false,
      wednesdayOpen: "09:00",
      wednesdayClose: "17:00",
      wednesdayClosed: false,
      thursdayOpen: "09:00",
      thursdayClose: "17:00",
      thursdayClosed: false,
      fridayOpen: "09:00",
      fridayClose: "17:00",
      fridayClosed: false,
      saturdayOpen: "09:00",
      saturdayClose: "17:00",
      saturdayClosed: false,
      sundayOpen: "09:00",
      sundayClose: "17:00",
      sundayClosed: false,
      publicHolidaysOpen: "09:00",
      publicHolidaysClose: "17:00",
      publicHolidaysClosed: false,
    },
  });

  useEffect(() => {
    if (!open || !practiceId) return;
    (async () => {
      try {
        setIsInitializing(true);
        const settings = await getPracticeSettings(practiceId);
        if (settings) {
          form.reset({
            practiceName: (settings as any).practiceName || "",
            practiceType: (settings as any).practiceType || "",
            contactEmail: (settings as any).contactEmail || "",
            contactPhone: (settings as any).contactPhone || "",
            streetAddress: (settings as any).streetAddress || "",
            suburb: (settings as any).suburb || "",
            city: (settings as any).city || "",
            province: (settings as any).province || "",
            postalCode: (settings as any).postalCode || "",
            country: (settings as any).country || "",
            consultationInterval:
              (settings as PracticeSettings).consultationInterval !== undefined
                ? String((settings as PracticeSettings).consultationInterval)
                : "30",
            mondayOpen: (settings as any).mondayOpen || "09:00",
            mondayClose: (settings as any).mondayClose || "17:00",
            mondayClosed: Boolean((settings as any).mondayClosed) || false,
            tuesdayOpen: (settings as any).tuesdayOpen || "09:00",
            tuesdayClose: (settings as any).tuesdayClose || "17:00",
            tuesdayClosed: Boolean((settings as any).tuesdayClosed) || false,
            wednesdayOpen: (settings as any).wednesdayOpen || "09:00",
            wednesdayClose: (settings as any).wednesdayClose || "17:00",
            wednesdayClosed:
              Boolean((settings as any).wednesdayClosed) || false,
            thursdayOpen: (settings as any).thursdayOpen || "09:00",
            thursdayClose: (settings as any).thursdayClose || "17:00",
            thursdayClosed: Boolean((settings as any).thursdayClosed) || false,
            fridayOpen: (settings as any).fridayOpen || "09:00",
            fridayClose: (settings as any).fridayClose || "17:00",
            fridayClosed: Boolean((settings as any).fridayClosed) || false,
            saturdayOpen: (settings as any).saturdayOpen || "09:00",
            saturdayClose: (settings as any).saturdayClose || "17:00",
            saturdayClosed: Boolean((settings as any).saturdayClosed) || false,
            sundayOpen: (settings as any).sundayOpen || "09:00",
            sundayClose: (settings as any).sundayClose || "17:00",
            sundayClosed: Boolean((settings as any).sundayClosed) || false,
            publicHolidaysOpen: (settings as any).publicHolidaysOpen || "09:00",
            publicHolidaysClose:
              (settings as any).publicHolidaysClose || "17:00",
            publicHolidaysClosed:
              Boolean((settings as any).publicHolidaysClosed) || false,
          });
        }
      } catch (e) {
        console.error("Error loading practice settings:", e);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, [open, practiceId]);

  // Preserve scroll position when toggling closed checkboxes
  const wrapCheckboxToggle = (toggle: () => void) => {
    const container = scrollRef.current;
    const prev = container ? container.scrollTop : 0;
    toggle();
    requestAnimationFrame(() => {
      if (container) container.scrollTop = prev;
    });
  };

  const onSubmit = async (data: z.infer<typeof PracticeSettingsSchema>) => {
    try {
      setIsSaving(true);
      const payload: Partial<PracticeSettings> = {
        consultationInterval: Number(data.consultationInterval),
        mondayOpen: data.mondayClosed ? undefined : data.mondayOpen,
        mondayClose: data.mondayClosed ? undefined : data.mondayClose,
        mondayClosed: data.mondayClosed,
        tuesdayOpen: data.tuesdayClosed ? undefined : data.tuesdayOpen,
        tuesdayClose: data.tuesdayClosed ? undefined : data.tuesdayClose,
        tuesdayClosed: data.tuesdayClosed,
        wednesdayOpen: data.wednesdayClosed ? undefined : data.wednesdayOpen,
        wednesdayClose: data.wednesdayClosed ? undefined : data.wednesdayClose,
        wednesdayClosed: data.wednesdayClosed,
        thursdayOpen: data.thursdayClosed ? undefined : data.thursdayOpen,
        thursdayClose: data.thursdayClosed ? undefined : data.thursdayClose,
        thursdayClosed: data.thursdayClosed,
        fridayOpen: data.fridayClosed ? undefined : data.fridayOpen,
        fridayClose: data.fridayClosed ? undefined : data.fridayClose,
        fridayClosed: data.fridayClosed,
        saturdayOpen: data.saturdayClosed ? undefined : data.saturdayOpen,
        saturdayClose: data.saturdayClosed ? undefined : data.saturdayClose,
        saturdayClosed: data.saturdayClosed,
        sundayOpen: data.sundayClosed ? undefined : data.sundayOpen,
        sundayClose: data.sundayClosed ? undefined : data.sundayClose,
        sundayClosed: data.sundayClosed,
        publicHolidaysOpen: data.publicHolidaysClosed
          ? undefined
          : data.publicHolidaysOpen,
        publicHolidaysClose: data.publicHolidaysClosed
          ? undefined
          : data.publicHolidaysClose,
        publicHolidaysClosed: data.publicHolidaysClosed,
      };

      await savePracticeSettings(practiceId, payload);

      // Notify other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("practice-settings:saved"));
      }

      onOpenChange(false);
    } catch (e) {
      console.error("Error saving practice settings:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-gray-800"
        ref={scrollRef}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Practice Settings
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Booking Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  fieldType={FormFieldType.SELECT}
                  control={form.control}
                  name="consultationInterval"
                  label="Consultation Interval"
                  placeholder="Select interval"
                  selectContentClassName="shad-select-content-scrollable"
                >
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </CustomFormField>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Operating Hours
              </h3>
              {(
                [
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ] as const
              ).map((day) => {
                const closedKey = `${day}Closed` as const;
                const openKey = `${day}Open` as const;
                const closeKey = `${day}Close` as const;
                const toggle = () =>
                  form.setValue(closedKey, !form.watch(closedKey));
                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center gap-4">
                      <label className="font-medium min-w-[100px] capitalize text-white">
                        {day}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!form.watch(closedKey)}
                          onChange={() => wrapCheckboxToggle(toggle)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-300">Closed</span>
                      </div>
                    </div>
                    {!form.watch(closedKey) && (
                      <div className="grid grid-cols-2 gap-4 ml-4">
                        <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          control={form.control}
                          name={openKey}
                          label="Open"
                          type="time"
                        />
                        <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          control={form.control}
                          name={closeKey}
                          label="Close"
                          type="time"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between gap-4 pt-4 border-t border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isInitializing || isSaving}
                className="border border-gray-700 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInitializing || isSaving}
                className="bg-dark-400 hover:bg-dark-500 text-white border border-gray-700"
              >
                {isSaving
                  ? "Saving..."
                  : isInitializing
                  ? "Loading settings..."
                  : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PracticeSettingsModal;
