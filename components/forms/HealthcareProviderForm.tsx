import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Form } from "../ui/form";
import { FormFieldType } from "./PatientForm";
import FileUploader from "../FileUploader";

const HealthcareProviderSchema = z.object({
  providerType: z.string().min(2, "Professional title is required"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone is required"),
  specialty: z.string().min(2, "Specialty is required"),
  practiceNumber: z.string().min(2, "Practice number is required"),
  identification: z
    .any()
    .refine(
      (file) => file && file.length > 0,
      "Identification document is required"
    ),
});

type HealthcareProviderFormValues = z.infer<typeof HealthcareProviderSchema>;

const defaultValues: HealthcareProviderFormValues = {
  providerType: "",
  name: "",
  email: "",
  phone: "",
  specialty: "",
  practiceNumber: "",
  identification: [],
};

const HealthcareProviderForm = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (values: HealthcareProviderFormValues) => void;
  isLoading: boolean;
}) => {
  const form = useForm<HealthcareProviderFormValues>({
    resolver: zodResolver(HealthcareProviderSchema),
    defaultValues,
  });

  // Watch provider type to adapt the form
  const providerType = form.watch("providerType");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full"
      >
        {/* Professional Title - full width */}
        <div>
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="providerType"
            label="Professional Title"
            placeholder="e.g. General Practitioner"
            control={form.control}
          />
        </div>
        {/* Two-column grid for main fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="name"
            label={`Full Name`}
            placeholder={`e.g. Dr. Jane Doe`}
            control={form.control}
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="email"
            label="Email"
            placeholder="jane@hospital.com"
            control={form.control}
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="phone"
            label="Phone Number"
            placeholder="012 345 6789"
            control={form.control}
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="practiceNumber"
            label="Practice Number"
            placeholder="123456"
            control={form.control}
          />
          {/* File uploaders side by side on desktop, stacked on mobile */}
          <CustomFormField
            fieldType={FormFieldType.SKELETON}
            name="identification"
            label="Identification Document"
            control={form.control}
            renderSkeleton={(field) => (
              <FileUploader
                files={field.value}
                onChange={field.onChange}
                // description="Upload a valid ID or professional document (PDF, PNG, JPG)"
              />
            )}
          />
          <CustomFormField
            fieldType={FormFieldType.SKELETON}
            name="profileImage"
            label="Professional Image"
            control={form.control}
            renderSkeleton={(field) => (
              <FileUploader
                files={field.value}
                onChange={field.onChange}
                // description="Upload a professional image (PNG, JPG)"
              />
            )}
          />
        </div>
        <div className="flex justify-end pt-2">
          <SubmitButton
            isLoading={isLoading}
            className="shad-primary-btn w-full md:w-auto"
          >
            Save Provider
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default HealthcareProviderForm;
