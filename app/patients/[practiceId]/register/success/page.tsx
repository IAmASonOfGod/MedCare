import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { fetchPractices } from "@/lib/actions/practice.actions";

interface SuccessPageProps {
  params: { practiceId: string };
}

interface Practice {
  $id: string;
  practiceName: string;
  // add other fields as needed
}

const PatientRegistrationSuccess = async ({
  params: { practiceId },
}: SuccessPageProps) => {
  const practices = await fetchPractices({});
  const practice = (practices || []).find((p: any) => p.$id === practiceId) as
    | Practice
    | undefined;

  return (
    <div className="flex h-screen max-h-screen px-[5%]">
      <div className="success-img">
        <h1 className="font-bold text-2xl mb-8 text-center">
          {practice?.practiceName || "MedCare Bookings"}
        </h1>

        <section className="flex flex-col items-center">
          <Image
            src="/assets/gifs/success.gif"
            height={300}
            width={280}
            alt="success"
          />
          <h2 className="header mb-6 max-w-[600px] text-center">
            Congratulations!{" "}
            <span className="text-green-500">Your registration</span> was
            successful.
          </h2>
          <p className="text-center max-w-xl">
            Thank you for registering with MedCare. You can now log in to book
            your appointment.
          </p>
        </section>

        <Button
          variant="outline"
          className="shad-primary-btn border-none mt-8"
          asChild
        >
          <Link href={`/patients/${practiceId}/login`}>Proceed to Login</Link>
        </Button>

        <p className="copyright"> © 2025 MedCare</p>
      </div>
    </div>
  );
};

export default PatientRegistrationSuccess;
