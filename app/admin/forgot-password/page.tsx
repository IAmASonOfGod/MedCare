"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import { FormFieldType } from "@/components/forms/PatientForm";
import SubmitButton from "@/components/SubmitButton";

const Schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof Schema>>({ resolver: zodResolver(Schema) });

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    setIsLoading(true);
    await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email }),
    });
    setIsLoading(false);
    setDone(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-dark-400 border border-dark-500 rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Forgot password</h1>
        {done ? (
          <p className="text-gray-300">If an account exists, a reset link has been sent.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                name="email"
                label="Email"
                type="email"
                control={form.control}
                autoComplete="email"
              />
              <SubmitButton isLoading={isLoading}>Send reset link</SubmitButton>
            </form>
          </Form>
        )}
      </div>
    </main>
  );
}




