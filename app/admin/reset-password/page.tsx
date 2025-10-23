"use client";

import React, { useEffect, useState, Suspense } from "react";
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
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function ResetContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof Schema>>({ resolver: zodResolver(Schema) });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/password-reset/validate?token=" + encodeURIComponent(token));
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d?.error || "Invalid link");
        }
      } catch (e: any) {
        setError(e.message || "Invalid or expired link");
      }
    })();
  }, [token]);

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    setIsLoading(true);
    setError(null);
    const res = await fetch("/api/auth/password-reset/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) {
      setError(data?.error || "Reset failed");
      return;
    }
    router.push("/admin-login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-dark-400 border border-dark-500 rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Set new password</h1>
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomFormField fieldType={FormFieldType.INPUT} name="password" label="Password" type="password" control={form.control} autoComplete="new-password" />
            <CustomFormField fieldType={FormFieldType.INPUT} name="confirm" label="Confirm Password" type="password" control={form.control} autoComplete="new-password" />
            <SubmitButton isLoading={isLoading}>Update password</SubmitButton>
          </form>
        </Form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center p-6"><div className="w-full max-w-md bg-dark-400 border border-dark-500 rounded-xl p-6"><div className="text-white">Loading...</div></div></main>}>
      <ResetContent />
    </Suspense>
  );
}




