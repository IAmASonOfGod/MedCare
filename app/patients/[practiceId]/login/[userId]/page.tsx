// OLD LOGIN PAGE - DEPRECATED
// This page is no longer used. The new login page is at /patients/[practiceId]/login/page.tsx
// This file can be safely removed.

/*
'use client';
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import { FormFieldType } from "@/components/forms/PatientForm";
import SubmitButton from "@/components/SubmitButton";
import { useState, useEffect } from "react";
import { fetchPractices } from "@/lib/actions/practice.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

interface Practice {
  $id: string;
  practiceName: string;
  // add other fields as needed
}

interface LoginPageProps {
  params: { practiceId: string; userId: string };
}

const LoginPage = ({ params: { practiceId, userId } }: LoginPageProps) => {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPractice() {
      const practices = await fetchPractices({});
      const found = (practices || []).find((p: any) => p.$id === practiceId) as Practice | undefined;
      setPractice(found);
      setLoading(false);
    }
    fetchPractice();
  }, [practiceId]);

  function PatientLoginForm() {
    const form = useForm<{ email: string; phone: string }>({
      defaultValues: {
        email: "",
        phone: "",
      },
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(values: { email: string; phone: string }) {
      setIsLoading(true);
      setError(null);

      try {
        // Find user by email/phone (you'll need to implement this function)
        // For now, we'll use the userId from the URL if it's not 'new'
        let targetUserId = userId;
        
        if (userId === 'new') {
          // TODO: Implement findUserByEmailOrPhone function
          // const user = await findUserByEmailOrPhone(values.email, values.phone);
          // if (!user) {
          //   setError("User not found. Please check your credentials.");
          //   setIsLoading(false);
          //   return;
          // }
          // targetUserId = user.$id;
          setError("Please use the registration link to create an account first.");
          setIsLoading(false);
          return;
        }
        
        // Find patient record by userId and practiceId
        const patient = await getPatient(targetUserId);
        if (!patient) {
          setError("Patient record not found. Please contact support.");
          setIsLoading(false);
          return;
        }
        
        // Check if patient belongs to this practice
        if (patient.practiceId !== practiceId) {
          setError("Patient record not found for this practice.");
          setIsLoading(false);
          return;
        }
        
        // Login successful, redirect to appointment page
        router.push(`/patients/${practiceId}/new-appointment/${patient.$id}`);
        
      } catch (e) {
        setError("Login failed. Please check your credentials and try again.");
      }

      setIsLoading(false);
    }

    return (
      <Form {...form}>
        {error && (
          <div className="text-red-600 text-center mb-4">
            {error}
          </div>
        )}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 flex-1"
        >
          <section className="mb-12 space-y-4">
            <h1 className="header">Hi there 👋</h1>
            <p className="text-dark-700">Schedule your appointment.</p>
          </section>
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="email"
            label="Email"
            placeholder="e.g markj@thejohnsons.com"
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
          <SubmitButton isLoading={isLoading}>Login</SubmitButton>
          <div className="mt-2 text-center">
            <span>New patient? </span>
            <a
              href={`/patients/${practiceId}/register/new`}
              className="text-blue-600 hover:underline"
            >
              Register here
            </a>
          </div>
        </form>
      </Form>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="flex h-screen items-center justify-center text-xl text-red-600">
        Practice not found.
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[496px]">
          <span className="font-bold text-lg mb-12 block text-center">
            {practice.practiceName}
          </span>
          <PatientLoginForm />
          <p className="copyright py-12 text-center"> © 2025 MedCare</p>
        </div>
      </section>
      <Image
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[50%]"
      />
    </div>
  );
};

export default LoginPage;
*/

// Placeholder export to prevent build errors
export default function DeprecatedLoginPage() {
  return (
    <div className="flex h-screen items-center justify-center text-xl text-red-600">
      This login page is deprecated. Please use the new login page.
    </div>
  );
}
