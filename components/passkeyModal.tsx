"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { usePathname, useRouter } from "next/navigation";
import { decryptKey, encryptKey } from "@/lib/utils";

export default function PasskeyModal() {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(true);
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setOpen(true); // Always show the modal when the component mounts
  }, []);

  const validatePasskey = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      const encryptedKey = encryptKey(passkey);
      localStorage.setItem("accessKey", encryptedKey);
      localStorage.setItem("adminLoading", "true"); // Signal that admin is loading

      setIsLoading(true);
      setOpen(false);

      router.push("/admin");
    } else {
      setError("Invalid passkey. Please try again.");
    }
  };

  // Check if admin page is ready
  useEffect(() => {
    const checkAdminReady = () => {
      const adminReady = localStorage.getItem("adminReady");
      if (adminReady === "true") {
        setIsLoading(false);
        localStorage.removeItem("adminLoading");
        localStorage.removeItem("adminReady");
      }
    };

    if (isLoading) {
      const interval = setInterval(checkAdminReady, 100);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const closeModal = () => {
    setOpen(false); // Just close the modal, no redirect
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            <p className="text-white">
              Setting up your account, please wait...
            </p>
          </div>
        </div>
      ) : (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="shad-alert-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-start justify-between">
                Admin Access Verification
                <Image
                  src="/assets/icons/close.svg"
                  alt="close"
                  width={20}
                  height={20}
                  onClick={() => closeModal()}
                  className="cursor-pointer"
                />
              </AlertDialogTitle>
              <AlertDialogDescription>
                To access the admin page, please enter the passkey.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div>
              <InputOTP
                maxLength={6}
                value={passkey}
                onChange={(value) => setPasskey(value)}
              >
                <InputOTPGroup className="shad-otp">
                  <InputOTPSlot className="shad-otp-slot" index={0} />
                  <InputOTPSlot className="shad-otp-slot" index={1} />
                  <InputOTPSlot className="shad-otp-slot" index={2} />
                  <InputOTPSlot className="shad-otp-slot" index={3} />
                  <InputOTPSlot className="shad-otp-slot" index={4} />
                  <InputOTPSlot className="shad-otp-slot" index={5} />
                </InputOTPGroup>
              </InputOTP>
              {error && (
                <p className="shad-error text-14-regular mt-4 flex justify-center">
                  {error}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={(e) => validatePasskey(e)}
                className="shad-primary-btn w-full"
              >
                Enter Admin Passkey
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
