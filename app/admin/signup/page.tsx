"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import { FormFieldType } from "@/components/forms/PatientForm";
import SubmitButton from "@/components/SubmitButton";

const Schema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^a-zA-Z0-9]/),
    confirm: z.string(),
    recoveryEmail: z.string().email(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default function AdminSignupPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [email, setEmail] = useState<string>("");
  const [practiceId, setPracticeId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "/api/admin/signup/validate?token=" + encodeURIComponent(token)
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Invalid invite");
        setEmail(data.email);
        setPracticeId(data.practiceId);
      } catch (e: any) {
        setError(e.message || "Invalid or expired invite");
      }
    })();
  }, [token]);

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    setIsLoading(true);
    setError(null);
    const res = await fetch("/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: values.password,
        recoveryEmail: values.recoveryEmail,
      }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) {
      setError(data?.error || "Signup failed");
      return;
    }
    router.push("/admin");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-dark-400 border border-dark-500 rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Create admin account
        </h1>
        {email && <p className="text-gray-300 mb-4">For: {email}</p>}
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              name="password"
              label="Password"
              type="password"
              control={form.control}
              autoComplete="new-password"
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              name="confirm"
              label="Confirm Password"
              type="password"
              control={form.control}
              autoComplete="new-password"
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              name="recoveryEmail"
              label="Recovery Email"
              type="email"
              control={form.control}
              autoComplete="email"
            />
            <SubmitButton isLoading={isLoading}>Create Account</SubmitButton>
          </form>
        </Form>
      </div>
    </main>
  );
}
