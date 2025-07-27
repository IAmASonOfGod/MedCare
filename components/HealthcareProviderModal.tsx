"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import HealthcareProviderForm from "./forms/HealthcareProviderForm";

const HealthcareProviderModal = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    // TODO: Save provider info to backend
    setTimeout(() => {
      setIsLoading(false);
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold shadow-md"
          title="Add a new healthcare provider"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Provider
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-2xl">
        <DialogHeader mb-4 space-y-3>
          <DialogTitle>Add Healthcare Provider</DialogTitle>
        </DialogHeader>
        <HealthcareProviderForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
};

export default HealthcareProviderModal;
