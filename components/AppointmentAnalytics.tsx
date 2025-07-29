"use client";
import React, { useEffect, useState } from "react";
import {
  getAppointmentAnalytics,
  getCapacityUtilization,
} from "@/lib/actions/appointment.action";
import StatCard from "./StatCard";

interface AppointmentAnalyticsProps {
  practiceId: string;
}

const AppointmentAnalytics = ({ practiceId }: AppointmentAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [capacity, setCapacity] = useState<any>(null);
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!practiceId) return;

    setIsLoading(true);
    try {
      const [analyticsData, capacityData] = await Promise.all([
        getAppointmentAnalytics(practiceId, period),
        getCapacityUtilization(
          practiceId,
          new Date().toISOString().split("T")[0]
        ),
      ]);

      setAnalytics(analyticsData);
      setCapacity(capacityData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [practiceId, period]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!analytics || !capacity) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <h2 className="text-24-bold">Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("week")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              period === "week"
                ? "bg-gray-600 dark:bg-dark-500 text-white"
                : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              period === "month"
                ? "bg-gray-600 dark:bg-dark-500 text-white"
                : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod("quarter")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              period === "quarter"
                ? "bg-gray-600 dark:bg-dark-500 text-white"
                : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300"
            }`}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Appointments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.total}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
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

        <div className="bg-white dark:bg-dark-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-white">
                {analytics.completionRate}%
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400"
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

        <div className="bg-white dark:bg-dark-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cancellation Rate
              </p>
              <p className="text-2xl font-bold text-white">
                {analytics.cancellationRate}%
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-600 dark:text-red-400"
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

        <div className="bg-white dark:bg-dark-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Capacity Utilization
              </p>
              <p className="text-2xl font-bold text-white">
                {capacity.utilizationRate}%
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-600 dark:text-purple-400"
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
        {/* Status Breakdown */}
        <div className="bg-white dark:bg-dark-400 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Status Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Scheduled
              </span>
              <span className="font-semibold text-white">
                {analytics.scheduled}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Completed
              </span>
              <span className="font-semibold text-white">
                {analytics.completed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Cancelled
              </span>
              <span className="font-semibold text-white">
                {analytics.cancelled}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">No Shows</span>
              <span className="font-semibold text-white">
                {analytics.noShows}
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Info */}
        <div className="bg-white dark:bg-dark-400 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Today's Capacity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Total Slots
              </span>
              <span className="font-semibold text-white">
                {capacity.totalCapacity}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Booked Slots
              </span>
              <span className="font-semibold text-white">
                {capacity.bookedSlots}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Available Slots
              </span>
              <span className="font-semibold text-white">
                {capacity.availableSlots}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${capacity.utilizationRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentAnalytics;
