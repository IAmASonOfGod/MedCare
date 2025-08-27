"use client";

import React, { useState } from "react";

interface CollapsibleSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const CollapsibleSection = ({
  title,
  children,
  isCollapsed,
  onToggle,
  className = "",
  ...rest
}: CollapsibleSectionProps) => {
  return (
    <section className={`w-full ${className}`} {...rest}>
      {/* Section Content or Expand Button */}
      {isCollapsed ? (
        <button
          onClick={onToggle}
          className="w-full h-16 bg-gray-100 dark:bg-dark-400 border-2 border-dashed border-gray-300 dark:border-dark-500 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      ) : (
        <div className="space-y-4">
          {/* Collapse Button */}
          <div className="flex justify-end">
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-400 hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
              title="Collapse section"
            >
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
          </div>
          {children}
        </div>
      )}
    </section>
  );
};

export default CollapsibleSection;
