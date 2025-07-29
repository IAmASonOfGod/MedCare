"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import CustomFormField from "./CustomFormField";
import { FormFieldType } from "./forms/PatientForm";
import SubmitButton from "./SubmitButton";
import { SelectItem } from "./ui/select";

const PracticeSettingsSchema = z.object({
  // Operating Hours
  mondayOpen: z.string().optional(),
  mondayClose: z.string().optional(),
  mondayClosed: z.boolean(),
  tuesdayOpen: z.string().optional(),
  tuesdayClose: z.string().optional(),
  tuesdayClosed: z.boolean(),
  wednesdayOpen: z.string().optional(),
  wednesdayClose: z.string().optional(),
  wednesdayClosed: z.boolean(),
  thursdayOpen: z.string().optional(),
  thursdayClose: z.string().optional(),
  thursdayClosed: z.boolean(),
  fridayOpen: z.string().optional(),
  fridayClose: z.string().optional(),
  fridayClosed: z.boolean(),
  saturdayOpen: z.string().optional(),
  saturdayClose: z.string().optional(),
  saturdayClosed: z.boolean(),
  sundayOpen: z.string().optional(),
  sundayClose: z.string().optional(),
  sundayClosed: z.boolean(),
  publicHolidaysOpen: z.string().optional(),
  publicHolidaysClose: z.string().optional(),
  publicHolidaysClosed: z.boolean(),
  // Consultation Intervals
  consultationInterval: z.enum(["15", "30", "60", "120"]),
});

type PracticeSettingsFormData = z.infer<typeof PracticeSettingsSchema>;

interface PracticeSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PracticeSettingsModal: React.FC<PracticeSettingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PracticeSettingsFormData>({
    resolver: zodResolver(PracticeSettingsSchema) as any,
    defaultValues: {
      // Operating Hours
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
      sundayClosed: true,
      publicHolidaysOpen: "09:00",
      publicHolidaysClose: "17:00",
      publicHolidaysClosed: true,
      // Consultation Intervals
      consultationInterval: "30",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Practice settings data:", data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving practice settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            ⚙️ Practice Settings
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Consultation Intervals Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                📅 Booking Intervals
              </h3>
              <p className="text-gray-300 text-sm">
                Choose your preferred booking time intervals for appointments.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <CustomFormField
                  fieldType={FormFieldType.SELECT}
                  name="consultationInterval"
                  label="Booking Interval"
                  placeholder="Select booking interval"
                  control={form.control}
                  selectContentClassName="shad-select-content-scrollable"
                >
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </CustomFormField>
              </div>
            </div>

            {/* Operating Hours Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                ⏰ Operating Hours
              </h3>
              <p className="text-gray-300 text-sm">
                Set your practice operating hours for each day of the week.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                ].map((day) => {
                  const closedKey =
                    `${day}Closed` as keyof PracticeSettingsFormData;
                  return (
                    <div key={day} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          name={`${day}Open`}
                          label={`${
                            day.charAt(0).toUpperCase() + day.slice(1)
                          } Open`}
                          placeholder="09:00"
                          control={form.control}
                          disabled={form.watch(closedKey) as boolean}
                        />
                      </div>
                      <div className="flex-1">
                        <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          name={`${day}Close`}
                          label="Close"
                          placeholder="17:00"
                          control={form.control}
                          disabled={form.watch(closedKey) as boolean}
                        />
                      </div>
                      <div className="flex items-center h-full">
                        <CustomFormField
                          fieldType={FormFieldType.CHECKBOX}
                          name={`${day}Closed`}
                          label="Closed"
                          control={form.control}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-4 items-end w-full md:col-span-2">
                  <div className="flex-1">
                    <CustomFormField
                      fieldType={FormFieldType.INPUT}
                      name="sundayOpen"
                      label="Sunday Open"
                      placeholder="09:00"
                      control={form.control}
                      disabled={form.watch("sundayClosed") as boolean}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomFormField
                      fieldType={FormFieldType.INPUT}
                      name="sundayClose"
                      label="Close"
                      placeholder="17:00"
                      control={form.control}
                      disabled={form.watch("sundayClosed") as boolean}
                    />
                  </div>
                  <div className="flex items-center h-full">
                    <CustomFormField
                      fieldType={FormFieldType.CHECKBOX}
                      name="sundayClosed"
                      label="Closed"
                      control={form.control}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomFormField
                      fieldType={FormFieldType.INPUT}
                      name="publicHolidaysOpen"
                      label="Public Holidays Open"
                      placeholder="09:00"
                      control={form.control}
                      disabled={form.watch("publicHolidaysClosed") as boolean}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomFormField
                      fieldType={FormFieldType.INPUT}
                      name="publicHolidaysClose"
                      label="Close"
                      placeholder="17:00"
                      control={form.control}
                      disabled={form.watch("publicHolidaysClosed") as boolean}
                    />
                  </div>
                  <div className="flex items-center h-full">
                    <CustomFormField
                      fieldType={FormFieldType.CHECKBOX}
                      name="publicHolidaysClosed"
                      label="Closed"
                      control={form.control}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <SubmitButton isLoading={isLoading}>
                Save Practice Settings
              </SubmitButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PracticeSettingsModal;
