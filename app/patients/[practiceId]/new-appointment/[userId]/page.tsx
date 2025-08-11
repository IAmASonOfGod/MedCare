"use client";
import AppointmentForm from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";
import { fetchPractices } from "@/lib/actions/practice.actions";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface Practice {
  $id: string;
  practiceName: string;
  // add other fields as needed
}

interface AppointmentPageProps {
  params: { practiceId: string; userId: string };
}

const MAX_RETRIES = 10;
const RETRY_INTERVAL = 500; // ms

const NewAppointment = ({
  params: { practiceId, userId },
}: AppointmentPageProps) => {
  const [patient, setPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practice, setPractice] = useState<Practice | undefined>(undefined);
  const [practiceLoading, setPracticeLoading] = useState(true);

  useEffect(() => {
    let retries = 0;
    let cancelled = false;
    async function fetchPatientWithRetry() {
      while (retries < MAX_RETRIES && !cancelled) {
        const result = await getPatient(userId);
        if (result) {
          setPatient(result);
          // Only set loading to false if practice is also loaded
          if (!practiceLoading) {
            setLoading(false);
          }
          return;
        }
        retries++;
        await new Promise((res) => setTimeout(res, RETRY_INTERVAL));
      }
      // Only set loading to false if practice is also loaded
      if (!practiceLoading) {
        setLoading(false);
      }
      setError(
        "Sorry, we couldn't find your patient record. Please contact support or try registering again."
      );
    }
    fetchPatientWithRetry();
    return () => {
      cancelled = true;
    };
  }, [userId, practiceLoading]);

  useEffect(() => {
    async function fetchPractice() {
      const practices = await fetchPractices({});
      const found = (practices || []).find((p: any) => p.$id === practiceId) as
        | Practice
        | undefined;
      setPractice(found);
      setPracticeLoading(false);
      // Only set loading to false if patient is also loaded
      if (patient !== null) {
        setLoading(false);
      }
    }
    fetchPractice();
  }, [practiceId, patient]);

  if (loading || practiceLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          <p className="text-white">Setting up your account, please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-xl text-white">
        {error}
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
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <span className="font-bold text-lg mb-12 block text-center">
            {practice.practiceName}
          </span>
          <AppointmentForm
            type="create"
            userId={patient?.userId}
            patientId={patient?.$id}
            practiceId={practiceId}
          />
          <p className="copyright py-12"> © 2025 MedCare</p>
        </div>
      </section>
      <Image
        src="/assets/images/appointment-img.png"
        height={1000}
        width={1000}
        alt="appointment"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
};

export default NewAppointment;
