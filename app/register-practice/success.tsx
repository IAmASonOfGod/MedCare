import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const PracticeRegistrationSuccess = () => {
  return (
    <div className="flex h-screen max-h-screen px-[5%]">
      <div className="success-img">
        <Link href="/">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="h-10 w-fit"
          />
        </Link>

        <section className="flex flex-col items-center">
          <Image
            src="/assets/gifs/success.gif"
            height={300}
            width={280}
            alt="success"
          />
          <h2 className="header mb-6 max-w-[600px] text-center">
            Congratulations!{" "}
            <span className="text-green-500">Your practice registration</span>{" "}
            has been received.
          </h2>
          <p className="text-center max-w-xl">
            Thank you for registering your practice with MedCare. Our team will
            review your details and contact you soon to complete the vetting
            process. We look forward to partnering with you!
          </p>
        </section>

        <Button
          variant="outline"
          className="shad-primary-btn border-none mt-8"
          asChild
        >
          <Link href="/">Back to Welcome Page</Link>
        </Button>

        <p className="copyright"> © 2025 MedCare</p>
      </div>
    </div>
  );
};

export default PracticeRegistrationSuccess;
