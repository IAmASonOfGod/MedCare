import clsx from "clsx";
import Image from "next/image";
import React from "react";

interface StatCardProps {
  type: "appointments" | "pending" | "cancelled";
  count: number;
  label: string;
  icon: string;
}

const StatCard = ({ count = 0, label, icon, type }: StatCardProps) => {
  return (
    <div
      className={clsx("stat-card transition-all duration-200", {
        "bg-appointments": type === "appointments",
        "bg-pending": type === "pending",
        "bg-cancelled": type === "cancelled",
      })}
    >
      <div className="flex items-center gap-3">
        <Image
          src={icon}
          height={24}
          width={24}
          alt="label"
          className="size-6 w-fit"
        />
        <h2 className="text-24-bold stat-card-count">{count}</h2>
      </div>
      <p className="text-12-regular">{label}</p>
    </div>
  );
};

export default StatCard;
