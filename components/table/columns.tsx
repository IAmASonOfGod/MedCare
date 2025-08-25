"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import StatusBadge from "../StatusBadge";
import { formatDateTime } from "@/lib/utils";

import Image from "next/image";
import AppointmentModal from "../AppointmentModal";
import { Appointment } from "@/types/appwrite.types";

export const columns: ColumnDef<Appointment>[] = [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "patientId",
    header: "Patient",
    cell: ({ row }) => {
      const patient = row.original.patient;
      const patientId = row.original.patientId;

      if (!patient) {
        return (
          <div className="text-14-medium">
            <p className="text-red-500">Patient Deleted</p>
            <p className="text-xs text-gray-500">ID: {patientId}</p>
          </div>
        );
      }

      return <p className="text-14-medium">{patient.name}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={row.original.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Appointment",
    cell: ({ row }) => (
      <p className="text-14-regular min-w-[100px]">
        {formatDateTime(row.original.schedule).dateTime}
      </p>
    ),
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row: { original: data } }) => {
      return (
        <div className="flex gap-1">
          <AppointmentModal
            type="schedule"
            patientId={data.patientId}
            userId={data.userId}
            practiceId={data.practiceId}
            appointment={data}
          />

          <AppointmentModal
            type="cancel"
            patientId={data.patientId}
            userId={data.userId}
            practiceId={data.practiceId}
            appointment={data}
          />

          <AppointmentModal
            type="complete"
            patientId={data.patientId}
            userId={data.userId}
            practiceId={data.practiceId}
            appointment={data}
          />

          <AppointmentModal
            type="no-show"
            patientId={data.patientId}
            userId={data.userId}
            practiceId={data.practiceId}
            appointment={data}
          />
        </div>
      );
    },
  },
];
