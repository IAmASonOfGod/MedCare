"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import { useState } from "react";
import { PracticeRegistrationSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { FormFieldType } from "@/components/forms/PatientForm";
import { SelectItem } from "@/components/ui/select";
import { createPractice } from "@/lib/actions/practice.actions";
import { databases } from "@/lib/appwrite.config";

const PracticeRegistrationForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof PracticeRegistrationSchema>>({
    resolver: zodResolver(PracticeRegistrationSchema),
    defaultValues: {
      practiceName: "",
      practiceType: undefined,
      slug: "",
      registrationNumber: "",
      contactEmail: "",
      contactPhone: "",
      practiceDescription: "",
      website: "",
      streetAddress: "",
      suburb: "",
      city: "",
      province: "",
      postalCode: "",
      country: "",
      googleMapsLink: "",
      mondayOpen: "",
      mondayClose: "",
      tuesdayOpen: "",
      tuesdayClose: "",
      wednesdayOpen: "",
      wednesdayClose: "",
      thursdayOpen: "",
      thursdayClose: "",
      fridayOpen: "",
      fridayClose: "",
      saturdayOpen: "",
      saturdayClose: "",
      sundayOpen: "",
      sundayClose: "",
      mondayClosed: false,
      tuesdayClosed: false,
      wednesdayClosed: false,
      thursdayClosed: false,
      fridayClosed: false,
      saturdayClosed: false,
      sundayClosed: false,
      termsAndConditions: false,
      consentToVerification: false,
    },
  });

  async function onSubmit(data: z.infer<typeof PracticeRegistrationSchema>) {
    setIsLoading(true);

    try {
      // Generate slug from practice name
      const slug = data.practiceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const practiceData = { ...data, slug };

      // Add practice to the database
      await createPractice(practiceData);

      router.push("/register-practice/success");
    } catch (e) {
      console.log(e);
      alert("Registration failed. Please try again.");
    }
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-blue-950 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Header */}
              <section className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-4">
                  Register Your Practice
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-200">
                  Join MedCare and connect with more patients today.
                </p>
              </section>

              {/* Practice Details Section */}
              <section className="bg-white/90 dark:bg-black/80 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6 flex items-center">
                  🏥 Practice Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="practiceName"
                    label="Practice Name"
                    placeholder="e.g., Smith Family Medical Centre"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="practice"
                    control={form.control}
                  />

                  <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    name="practiceType"
                    label="Practice Type"
                    placeholder="Select practice type"
                    control={form.control}
                  >
                    <SelectItem value="GP">
                      General Practitioner (GP)
                    </SelectItem>
                    <SelectItem value="Dentist">Dentist</SelectItem>
                    <SelectItem value="Physio">Physiotherapist</SelectItem>

                    <SelectItem value="Clinical Psychologist">
                      Clinical Psychologist
                    </SelectItem>
                    <SelectItem value="Optometrist">Optometrist</SelectItem>
                    <SelectItem value="Audiologist">Audiologist</SelectItem>
                    <SelectItem value="Occupational Therapist">
                      Occupational Therapist
                    </SelectItem>
                    <SelectItem value="Speech Therapist">
                      Speech Therapist
                    </SelectItem>
                    <SelectItem value="Podiatrist">Podiatrist</SelectItem>
                    <SelectItem value="Specialist">Specialist</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </CustomFormField>

                  {/* Consultation Interval */}
                  <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    name="consultationInterval"
                    label="Consultation Interval (minutes)"
                    placeholder="Select interval"
                    control={form.control}
                  >
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </CustomFormField>

                  {/* Conditional field for Specialist or Other */}
                  {(form.watch("practiceType") === "Specialist" ||
                    form.watch("practiceType") === "Other") && (
                    <CustomFormField
                      fieldType={FormFieldType.INPUT}
                      name="specialistType"
                      label={
                        form.watch("practiceType") === "Specialist"
                          ? "Specialist Type"
                          : "Practice Type"
                      }
                      placeholder={
                        form.watch("practiceType") === "Specialist"
                          ? "e.g., Cardiologist, Dermatologist"
                          : "e.g., Chiropractor, Naturopath"
                      }
                      iconSrc="/assets/icons/user.svg"
                      iconAlt="specialist"
                      control={form.control}
                    />
                  )}

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="registrationNumber"
                    label="Registration Number"
                    placeholder="e.g., HPCSA / Practice Number"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="registration"
                    control={form.control}
                  />
                </div>

                {/* Contact and Website row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="contactEmail"
                    label="Contact Email"
                    placeholder="contact@practice.com"
                    iconSrc="/assets/icons/email.svg"
                    iconAlt="email"
                    control={form.control}
                  />

                  <CustomFormField
                    fieldType={FormFieldType.PHONE_INPUT}
                    name="contactPhone"
                    label="Contact Phone"
                    placeholder="+27 12 345 6789"
                    control={form.control}
                  />

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="website"
                    label="Website (optional)"
                    placeholder="https://www.practice.com"
                    iconSrc="/assets/icons/email.svg"
                    iconAlt="website"
                    control={form.control}
                  />
                </div>

                <div className="mt-6">
                  <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    name="practiceDescription"
                    label="Practice Description (optional)"
                    placeholder="Describe your practice, services offered, and any specializations..."
                    control={form.control}
                  />
                </div>
              </section>

              {/* Location Details Section */}
              <section className="bg-white/90 dark:bg-black/80 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6 flex items-center">
                  📍 Location Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <CustomFormField
                      fieldType={FormFieldType.INPUT}
                      name="streetAddress"
                      label="Street Address"
                      placeholder="123 Main Street"
                      iconSrc="/assets/icons/user.svg"
                      iconAlt="address"
                      control={form.control}
                    />
                  </div>

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="suburb"
                    label="Suburb / Area"
                    placeholder="e.g., Sandton"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="suburb"
                    control={form.control}
                  />

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="city"
                    label="City / Town"
                    placeholder="e.g., Johannesburg"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="city"
                    control={form.control}
                  />

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="province"
                    label="Province"
                    placeholder="e.g., Gauteng"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="province"
                    control={form.control}
                  />

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="postalCode"
                    label="Postal Code"
                    placeholder="e.g., 2196"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="postal"
                    control={form.control}
                  />

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    name="country"
                    label="Country"
                    placeholder="e.g., South Africa"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="country"
                    control={form.control}
                  />

                  <div className="md:col-span-2">
                    <CustomFormField
                      fieldType={FormFieldType.INPUT}
                      name="googleMapsLink"
                      label="Google Maps Link (optional)"
                      placeholder="https://maps.google.com/..."
                      iconSrc="/assets/icons/email.svg"
                      iconAlt="maps"
                      control={form.control}
                    />
                  </div>
                </div>
              </section>

              {/* Operating Hours Section */}
              <section className="bg-white/90 dark:bg-black/80 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6 flex items-center">
                  ⏰ Operating Hours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                  ].map((day) => {
                    const closedKey = `${day}Closed` as keyof z.infer<
                      typeof PracticeRegistrationSchema
                    >;
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
                  {/* Sunday and Public Holidays on the same row */}
                  <div className="flex gap-4 items-end w-full md:col-span-2">
                    {/* Sunday */}
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
                    {/* Public Holidays */}
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
              </section>

              {/* Declarations Section */}
              <section className="bg-white/90 dark:bg-black/80 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6 flex items-center">
                  Declaration & Submission
                </h2>
                <div className="space-y-4">
                  <CustomFormField
                    fieldType={FormFieldType.CHECKBOX}
                    name="termsAndConditions"
                    label="I agree to the Terms & Conditions"
                    control={form.control}
                  />
                  <CustomFormField
                    fieldType={FormFieldType.CHECKBOX}
                    name="consentToVerification"
                    label="I consent to verification of my practice details"
                    control={form.control}
                  />
                </div>
              </section>

              {/* Submit Button */}
              <div className="text-center">
                <SubmitButton isLoading={isLoading}>
                  Submit Practice
                </SubmitButton>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
};

export default PracticeRegistrationForm;
