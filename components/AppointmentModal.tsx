"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import AppointmentForm from "./forms/AppointmentForm";
import { Appointment } from "@/types/appwrite.types";

const AppointmentModal = ({
  type,
  patientId,
  userId,
  practiceId,
  appointment,
}: {
  type: "schedule" | "cancel" | "complete" | "no-show";
  patientId: string;
  userId: string;
  practiceId: string;
  appointment?: Appointment;
}) => {
  const [open, setOpen] = useState(false);
  console.log({ type, patientId, userId, appointment }, "from the Modal");

  const getButtonStyle = () => {
    switch (type) {
      case "schedule":
        return "text-green-500";
      case "cancel":
        return "text-red-500";
      case "complete":
        return "text-blue-500";
      case "no-show":
        return "text-yellow-500";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={`capitalize ${getButtonStyle()}`}>
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader mb-4 space-y-3>
          <DialogTitle className="capitalize">{type} Appointment</DialogTitle>
          <DialogDescription>
            Please fill in the details to {type} your appointment.
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm
          userId={userId}
          patientId={patientId}
          practiceId={practiceId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
