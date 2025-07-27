"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CustomFormField from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import { Form } from "@/components/ui/form";
import { FormFieldType } from "@/components/forms/PatientForm";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { usePractice } from "@/components/PracticeContext";
import { fetchPracticeByAdminEmail } from "@/lib/actions/practice.actions";

const commonPasswords = [
  "123456",
  "password",
  "123456789",
  "12345678",
  "12345",
  "qwerty",
  "abc123",
  "football",
  "monkey",
  "letmein",
];

const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be at most 64 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain a symbol")
    .refine((val) => !commonPasswords.includes(val), {
      message: "Password is too common. Please choose a more secure password.",
    }),
});

const PasskeyModal = dynamic(() => import("@/components/passkeyModal"), {
  ssr: false,
});

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const { setPractice, practice } = usePractice();
  const form = useForm<z.infer<typeof AdminLoginSchema>>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof AdminLoginSchema>) {
    setIsLoading(true);
    // 1. Authenticate admin (your existing logic)
    // ...your login/auth code...

    // 2. Fetch the practice by admin email and set the practice name BEFORE showing the modal
    const practice = await fetchPracticeByAdminEmail(data.email as string);
    console.log("practice", practice);
    if (practice) {
      setPractice(practice);
    }
    console.log("practice from onSubmit", practice);

    // 3. Now show the passkey modal
    setTimeout(() => {
      setIsLoading(false);
      setShowPasskeyModal(true); // Show the passkey modal overlay
    }, 1000);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-blue-950 transition-colors">
      <div className="max-w-md w-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-black/70 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 text-center mb-2">
          Admin Login
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-6"
          >
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              name="email"
              label="Practice Email"
              placeholder="admin@practice.com"
              iconSrc="/assets/icons/email.svg"
              iconAlt="email"
              control={form.control}
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              name="password"
              label="Password"
              placeholder="Enter your password"
              control={form.control}
            />
            <div className="flex justify-between items-center">
              <Link href="#" className="text-blue-600 hover:underline text-sm">
                Forgot password?
              </Link>
            </div>
            <SubmitButton isLoading={isLoading}>Login</SubmitButton>
          </form>
        </Form>
      </div>
      {showPasskeyModal && <PasskeyModal />}
    </main>
  );
}
