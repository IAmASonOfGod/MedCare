import { fetchPractices } from "@/lib/actions/practice.actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Practice {
  $id: string;
  practiceName: string;
  // add other fields as needed
}

interface PracticePageProps {
  params: { practiceId: string };
}

const PracticeLanding = async ({
  params: { practiceId },
}: PracticePageProps) => {
  const practices = await fetchPractices({});
  const practice = (practices || []).find((p: any) => p.$id === practiceId) as
    | Practice
    | undefined;

  if (!practice) {
    return (
      <div className="flex h-screen items-center justify-center text-xl text-red-600">
        Practice not found.
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <span className="font-bold text-lg mb-12 block text-center">
            {practice.practiceName}
          </span>
          {/* Login form can go here, or a button to login/register */}
          <div className="flex flex-col gap-4 mt-8">
            <Link
              href={`/patients/${practiceId}/register/new`}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center"
            >
              Register as a New Patient
            </Link>
            <Link
              href={`/patients/${practiceId}/login/new`}
              className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-center"
            >
              Book an Appointment
            </Link>
          </div>
          <p className="copyright py-12 text-center"> © 2025 MedCare</p>
        </div>
      </section>
      <Image
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="practice"
        className="side-img max-w-[50%]"
      />
    </div>
  );
};

export default PracticeLanding;
