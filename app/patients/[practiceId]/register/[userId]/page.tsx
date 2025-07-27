import RegisterForm from "@/components/forms/RegisterForm";
import { getUser } from "@/lib/actions/patient.actions";
import { fetchPractices } from "@/lib/actions/practice.actions";
import SetPracticeContext from "@/components/SetPracticeContext";
import Image from "next/image";
import React from "react";

interface Practice {
  $id: string;
  practiceName: string;
  // add other fields as needed
}

interface RegisterPageProps {
  params: { practiceId: string };
}

const Register = async ({ params: { practiceId } }: RegisterPageProps) => {
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
      <SetPracticeContext practice={practice} />
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <span className="font-bold text-lg mb-12 block text-center">
            {practice.practiceName}
          </span>
          <RegisterForm practiceId={practiceId} />
          <p className="copyright py-12 text-center"> © 2025 MedCare</p>
        </div>
      </section>
      <Image
        src="/assets/images/register-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};

export default Register;
