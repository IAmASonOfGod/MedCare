"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { userFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";
import { FormFieldType } from "./PatientForm";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Doctors, GenderOptions } from "@/constants";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { SelectItem } from "../ui/select";

const RegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof userFormValidation>>({
    resolver: zodResolver(userFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit({
    name,
    email,
    phone,
  }: z.infer<typeof userFormValidation>) {
    setIsLoading(true);

    try {
      const userData = { name, email, phone };

      const user = await createUser(userData);
      if (user) {
        console.log("User created:", user);
        router.push(`/patients/${user.$id}/register`);
      } else {
        console.log("Failed to create user");
      }
    } catch (e) {
      console.log(e);
    }

    setIsLoading(false);
  }

  console.log("Form Submission Triggered");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 flex-1"
      >
        <section className="space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">Let us know more about yourself.</p>
        </section>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Personal information</h2>
          </div>
        </section>

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          name="name"
          label="Full name"
          placeholder="Mark J"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
          control={form.control}
        />

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="email"
            label="Email"
            placeholder="markj@thejohnsons.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="user"
            control={form.control}
          />

          <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            name="phone"
            label="Phone number"
            placeholder="012 892 7658"
            control={form.control}
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.DATE_PICKER}
            name="birthDate"
            label="Date of Birth"
            control={form.control}
          />

          <CustomFormField
            fieldType={FormFieldType.SKELETON}
            name="gender"
            label="Gender"
            placeholder="012 892 7658"
            control={form.control}
            renderSkeleton={(field) => (
              <FormControl>
                <RadioGroup
                  className="flex h-11 gap-6 xl:justify-between"
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {GenderOptions.map((option) => (
                    <div key={option} className="radio-group">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="address"
            label="Address"
            placeholder="e.g 123 Main Street, Soweto.."
            control={form.control}
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="occupation"
            label="Occupation"
            placeholder="e.g Teacher, Police Officer.."
            iconSrc="/assets/icons/email.svg"
            iconAlt="user"
            control={form.control}
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="EmergencyContactName"
            label="Emergency contact name"
            placeholder="Guardian's name"
            control={form.control}
          />

          <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            name="emergencyContactNumber"
            label="Emergency contact number"
            placeholder="012 892 7658"
            control={form.control}
          />
        </div>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Medical information</h2>
          </div>
        </section>

        <CustomFormField
          fieldType={FormFieldType.SELECT}
          name="primaryPhysician"
          label="Primary Physician"
          placeholder="Select a physician"
          control={form.control}
        >
          {Doctors.map((doctor) => (
            <SelectItem key={doctor.name} value={doctor.name}>
              <div className="flex cursor-pointer items-center gap-2">
                <Image
                  src={doctor.image}
                  width={32}
                  height={32}
                  className="rounded-full border border-dark-500"
                  alt={"doctor.name"}
                />
                <p>{doctor.name}</p>
              </div>
            </SelectItem>
          ))}
        </CustomFormField>
        <div className="flex flex-col gap-6 xl:flex-row">
          {" "}
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="insuranceProvider"
            label="Insurance Provider"
            placeholder="e.g NovaCover"
            control={form.control}
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="insurancePolicyNumber"
            label="Insurance policy number"
            placeholder="e.g ABCD123456789"
            control={form.control}
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          {" "}
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            name="allergies"
            label="Allergies (if any)"
            placeholder="e.g Peanuts, Penicillin, Pollen"
            control={form.control}
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            name="currentMedication"
            label="Current Medication (if any)"
            placeholder="e.g Ibuprofen 200mg, Paracetamol 500mg"
            control={form.control}
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row"></div>

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default RegisterForm;
