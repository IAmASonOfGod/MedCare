import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { fetchPractices } from "@/lib/actions/practice.actions";

interface SuccessPageProps {
  params: { practiceId: string };
  searchParams: { appointmentId?: string; userId?: string };
}

interface Practice {
  $id: string;
  practiceName: string;
  // add other fields as needed
}

const AppointmentSuccess = async ({
  params: { practiceId },
  searchParams,
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
            <span className="text-green-500">Your appointment</span> has been
            booked successfully.
          </h2>
          <p className="text-center max-w-xl">
            Thank you for booking with {practice?.practiceName || "MedCare"}.
            You will receive a confirmation shortly.
          </p>
        </section>

        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            className="shad-primary-btn border-none"
            asChild
          >
            <Link
              href={`/patients/${practiceId}/new-appointment/${
                searchParams.userId || "new"
              }`}
            >
              Book Another Appointment
            </Link>
          </Button>
        </div>

        <p className="copyright"> © 2025 MedCare</p>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
