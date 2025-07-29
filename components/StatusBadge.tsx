import { StatusIcon } from "@/constants";
import clsx from "clsx";
import Image from "next/image";
import React from "react";
import { Status } from "@/types/appwrite.types";

const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <div
      className={clsx("status-badge", {
        "bg-green-600": status === "scheduled",
        "bg-gray-600": status === "pending",
        "bg-red-600": status === "cancelled",
        "bg-blue-600": status === "completed",
        "bg-yellow-600": status === "no-show",
      })}
    >
      <Image
        src={StatusIcon[status]}
        alt={status}
        width={24}
        height={24}
        className="h-fit w-3"
      />
      <p
        className={clsx("text-12-semibold capitalize", {
          "text-green-500": status === "scheduled",
          "text-gray-300": status === "pending",
          "text-red-500": status === "cancelled",
          "text-blue-500": status === "completed",
          "text-yellow-500": status === "no-show",
        })}
      >
        {status}
      </p>
    </div>
  );
};

export default StatusBadge;
