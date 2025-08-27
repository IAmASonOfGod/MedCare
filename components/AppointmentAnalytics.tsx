"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getAppointmentAnalytics,
  getCapacityUtilization,
} from "@/lib/actions/appointment.action";
import StatCard from "./StatCard";

interface AppointmentAnalyticsProps {
  practiceId: string;
  timePeriod: "today" | "week" | "month" | "quarter" | "year" | "all-time";
}

type PeriodType = "today" | "week" | "month" | "quarter";

const AppointmentAnalytics = ({ practiceId, timePeriod }: AppointmentAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [capacity, setCapacity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // todayIso removed - capacity now uses same period as analytics

  const fetchAnalytics = async (showLoading: boolean = true) => {
    if (!practiceId) {
      console.log("No practiceId, skipping analytics fetch");
      return;
    }
    console.log(
      "Fetching analytics for practice:",
      practiceId,
      "period:",
      timePeriod,
      "showLoading:",
      showLoading
    );
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    try {
      console.log("Calling analytics functions...");
      const [analyticsData, capacityData] = await Promise.all([
        getAppointmentAnalytics(practiceId, timePeriod),
        getCapacityUtilization(practiceId, timePeriod),
      ]);
      console.log("Analytics data received:", analyticsData);
      console.log("Capacity data received:", capacityData);
      setAnalytics(analyticsData);
      setCapacity(capacityData);
    } catch (e: any) {
      console.error("Error fetching analytics:", e);
      console.error("Error details:", e.message, e.stack);
      if (showLoading) {
        setError("Unable to load analytics right now. Please try again.");
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [practiceId, timePeriod]);

  // Auto-refresh every 30 seconds in background (no loading state)
  useEffect(() => {
    if (!practiceId) return;

    const interval = setInterval(() => {
      console.log("Analytics: Background auto-refresh (no loading)");
      fetchAnalytics(false); // false = don't show loading state
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [practiceId, timePeriod]);

  // Manual refresh via custom events and midnight rollover
  useEffect(() => {
    function handleUpdated() {
      console.log(
        "Analytics: appointments:updated event received, refreshing analytics"
      );
      fetchAnalytics(false); // false = don't show loading state for event-driven updates
    }

    if (typeof window !== "undefined") {
      window.addEventListener("appointments:updated", handleUpdated);
      window.addEventListener("practice-settings:saved", handleUpdated);

      // Midnight rollover
      const now = new Date();
      const msToMidnight =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        ).getTime() - now.getTime();
      const timer = setTimeout(() => {
        fetchAnalytics(false); // false = don't show loading state for midnight rollover
      }, msToMidnight + 1000);

      return () => {
        window.removeEventListener("appointments:updated", handleUpdated);
        window.removeEventListener("practice-settings:saved", handleUpdated);
        clearTimeout(timer);
      };
    }
  }, [practiceId, timePeriod]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
        <h3 className="text-red-200 font-semibold mb-2">
          Analytics Unavailable
        </h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button
          onClick={() => fetchAnalytics(true)}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || !capacity) return null;

  const periodLabel = timePeriod === "today"
    ? "Today's"
    : timePeriod === "week"
    ? "Weekly"
    : timePeriod === "month"
    ? "Monthly"
    : timePeriod === "quarter"
    ? "Quarterly"
    : timePeriod === "year"
    ? "Yearly"
    : "All-time";

  const periodDesc = timePeriod === "today"
    ? "Capacity for today only"
    : timePeriod === "week"
    ? "Capacity for the next 7 days (today + 6 days ahead)"
    : timePeriod === "month"
    ? "Capacity for the entire current month"
    : timePeriod === "quarter"
    ? "Capacity for the entire current quarter"
    : timePeriod === "year"
    ? "Capacity for the entire current year"
    : "Capacity across all time";

  return (
    <div className="space-y-6">
      {/* Header: Period + Refresh */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-24-bold text-white">Analytics</h2>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold shadow-md bg-dark-400 text-white hover:bg-dark-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh analytics"
        >
          {isLoading ? (
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Total Appointments</p>
              <p className="text-2xl font-bold text-white">{analytics.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-dark-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Completion Rate</p>
              <p className="text-2xl font-bold text-white">
                {analytics.completionRate}%
              </p>
            </div>
            <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-dark-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Cancellation Rate</p>
              <p className="text-2xl font-bold text-white">
                {analytics.cancellationRate}%
              </p>
            </div>
            <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-dark-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Capacity Utilization</p>
              <p className="text-2xl font-bold text-white">
                {capacity.utilizationRate}%
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-400 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Status Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Scheduled</span>
              <span className="font-semibold text-white">
                {analytics.scheduled}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Pending</span>
              <span className="font-semibold text-white">
                {analytics.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Completed</span>
              <span className="font-semibold text-white">
                {analytics.completed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Cancelled</span>
              <span className="font-semibold text-white">
                {analytics.cancelled}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">No Shows</span>
              <span className="font-semibold text-white">
                {analytics.noShows}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-dark-400 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-white">
            {periodLabel} Capacity
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            {periodDesc}
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Total {periodLabel} Slots</span>
              <span className="font-semibold text-white">
                {capacity.totalCapacity}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Booked {periodLabel} Slots</span>
              <span className="font-semibold text-white">
                {capacity.bookedSlots}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Available {periodLabel} Slots</span>
              <span className="font-semibold text-white">
                {capacity.availableSlots}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: String(capacity.utilizationRate) + "%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {capacity.utilizationRate}% of {periodLabel.toLowerCase()} capacity utilized
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentAnalytics;
