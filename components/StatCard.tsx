import clsx from "clsx";
import Image from "next/image";
import React from "react";

interface StatCardProps {
  type: "appointments" | "pending" | "cancelled";
  count: number;
  label: string;
  icon: string;
  isLoading?: boolean;
  isSelected?: boolean;
  isClickable?: boolean;
  isClicked?: boolean;
}

const StatCard = ({ count = 0, label, icon, type, isLoading = false, isSelected = false, isClickable = false, isClicked = false }: StatCardProps) => {
  return (
    <div
              className={clsx(
          "stat-card transition-all duration-300 relative overflow-hidden", 
          {
            "bg-appointments": type === "appointments",
            "bg-pending": type === "pending",
            "bg-cancelled": type === "cancelled",
            "ring-4 ring-blue-400 ring-opacity-70 shadow-lg scale-105": isSelected,
            "hover:scale-105 hover:shadow-lg cursor-pointer": isClickable && !isSelected,
            "cursor-pointer": isClickable,
            "animate-pulse scale-110": isClicked,
          }
        )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
          FILTERED
        </div>
      )}
      
      {/* Hover effect overlay */}
      {isClickable && (
        <div className={clsx(
          "absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-200",
          {
            "opacity-100": isSelected,
            "hover:opacity-100": !isSelected
          }
        )} />
      )}
      
      <div className="flex items-center gap-3 text-white relative z-10">
        <Image
          src={icon}
          height={24}
          width={24}
          alt="label"
          className="size-6 w-fit"
        />
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          </div>
        ) : (
          <h2 className="text-24-bold stat-card-count">{count}</h2>
        )}
      </div>
      <p className="text-12-regular text-white relative z-10">{label}</p>
      
      {/* Click hint for clickable cards */}
      {isClickable && !isSelected && (
        <div className="absolute bottom-2 right-2 opacity-60">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default StatCard;
