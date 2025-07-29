"use client";
import React, { useEffect, useState } from "react";
import { usePractice } from "@/components/PracticeContext";
import {
  getRecentAppointmentList,
  getAppointmentCounts,
  getTodaysAppointments,
  getUpcomingAppointments,
} from "@/lib/actions/appointment.action";
import StatCard from "@/components/StatCard";
import Image from "next/image";
import Link from "next/link";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import ThemeToggle from "@/components/ThemeToggle";
import AppointmentAnalytics from "@/components/AppointmentAnalytics";
import CollapsibleSection from "@/components/CollapsibleSection";
import { fetchPracticeByAdminEmail } from "@/lib/actions/practice.actions";
import PracticeSettingsModal from "@/components/PracticeSettingsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Admin = () => {
  const [appointments, setAppointments] = useState<any>(null);
  const [appointmentCounts, setAppointmentCounts] = useState<any>({
    scheduledCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "today" | "upcoming">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [collapsedSections, setCollapsedSections] = useState({
    analytics: false,
    appointments: false,
  });
  const [isPracticeSettingsOpen, setIsPracticeSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { practice } = usePractice();
  console.log("Practice Name in Admin Page:", practice?.practiceName);

  const fetchAppointments = async (page: number = 1) => {
    if (!practice?.$id) return;

    setIsLoading(true);
    try {
      let data;

      switch (viewMode) {
        case "today":
          data = await getTodaysAppointments(practice.$id);
          break;
        case "upcoming":
          data = await getUpcomingAppointments(practice.$id, page, 20);
          break;
        default:
          data = await getRecentAppointmentList(practice.$id, page, 20);
      }

      setAppointments(data);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCounts = async () => {
    if (!practice?.$id) return;

    try {
      const counts = await getAppointmentCounts(practice.$id);
      setAppointmentCounts(counts);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    if (practice?.$id) {
      fetchAppointments(1);
      fetchCounts();
      localStorage.setItem("adminReady", "true");
    }
  }, [practice?.$id]);

  // Auto-refresh appointments every 30 seconds (without loading state)
  useEffect(() => {
    if (!practice?.$id) return;

    const interval = setInterval(async () => {
      console.log("Auto-refreshing appointments...");
      // Auto-refresh without showing loading spinner
      try {
        const result = await getRecentAppointmentList(
          practice.$id,
          currentPage,
          20
        );
        if (result) {
          setAppointments(JSON.parse(result));
        }
      } catch (error) {
        console.error("Auto-refresh appointments error:", error);
      }

      try {
        const counts = await getAppointmentCounts(practice.$id);
        if (counts) {
          setAppointmentCounts(counts);
        }
      } catch (error) {
        console.error("Auto-refresh counts error:", error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [practice?.$id, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage) {
      fetchAppointments(newPage);
    }
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === statusFilter ? "" : status);
    setViewMode("all"); // Reset view mode when filtering by status
  };

  // Toggle collapsible sections
  const toggleSection = (section: "analytics" | "appointments") => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter appointments by status if statusFilter is set
  const getFilteredAppointments = () => {
    if (!appointments || !statusFilter) {
      return appointments;
    }

    const filteredData = {
      ...appointments,
      documents: appointments.documents.filter(
        (apt: any) => apt.status === statusFilter
      ),
      pagination: {
        ...appointments.pagination,
        total: appointments.documents.filter(
          (apt: any) => apt.status === statusFilter
        ).length,
      },
    };

    return filteredData;
  };

  // Provide default values if appointments is null
  const appointmentData = appointments || {
    documents: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <span className="font-bold text-lg text-white">
            {practice?.practiceName || "MedCare Bookings"}
          </span>
        </Link>
        <p className="text-16-semibold">Admin Dashboard</p>
      </header>
      <main className="admin-main">
        <section className="w-full space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="header">Welcome 👋 </h1>
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-dark-400 text-white border-dark-500 hover:bg-dark-500 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-dark-400 border-dark-500"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setIsPracticeSettingsOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="text-white hover:bg-dark-500 focus:bg-dark-500 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Practice Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    console.log("Payment clicked");
                    setIsDropdownOpen(false);
                  }}
                  className="text-white hover:bg-dark-500 focus:bg-dark-500 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // TODO: Implement logout functionality
                    console.log("Logout clicked");
                    setIsDropdownOpen(false);
                    // You can add logout logic here, e.g., redirect to login page
                  }}
                  className="text-white hover:bg-dark-500 focus:bg-dark-500 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>
        <section className="admin-stat">
          <div
            onClick={() => handleStatusFilter("scheduled")}
            className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              statusFilter === "scheduled"
                ? "ring-2 ring-blue-500 ring-opacity-50"
                : ""
            }`}
          >
            <StatCard
              type="appointments"
              count={appointmentCounts.scheduledCount}
              label="Scheduled appointments"
              icon="/assets/icons/appointments.svg"
            />
          </div>
          <div
            onClick={() => handleStatusFilter("pending")}
            className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              statusFilter === "pending"
                ? "ring-2 ring-blue-500 ring-opacity-50"
                : ""
            }`}
          >
            <StatCard
              type="pending"
              count={appointmentCounts.pendingCount}
              label="Pending appointments"
              icon="/assets/icons/pending.svg"
            />
          </div>
          <div
            onClick={() => handleStatusFilter("cancelled")}
            className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              statusFilter === "cancelled"
                ? "ring-2 ring-blue-500 ring-opacity-50"
                : ""
            }`}
          >
            <StatCard
              type="cancelled"
              count={appointmentCounts.cancelledCount}
              label="Cancelled appointments"
              icon="/assets/icons/cancelled.svg"
            />
          </div>
        </section>

        {/* Analytics Dashboard */}
        {practice?.$id && (
          <CollapsibleSection
            title="Analytics Dashboard"
            isCollapsed={collapsedSections.analytics}
            onToggle={() => toggleSection("analytics")}
          >
            <AppointmentAnalytics practiceId={practice.$id} />
          </CollapsibleSection>
        )}

        {/* Appointments Section */}
        <CollapsibleSection
          title="Appointments"
          isCollapsed={collapsedSections.appointments}
          onToggle={() => toggleSection("appointments")}
        >
          {/* Filtering and Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 my-6 p-4 bg-gray-50 dark:bg-dark-400 rounded-lg">
            {/* View Mode Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setViewMode("all");
                  fetchAppointments(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "all"
                    ? "bg-gray-600 dark:bg-dark-500 text-white"
                    : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-400"
                }`}
              >
                All Appointments
              </button>
              <button
                onClick={() => {
                  setViewMode("today");
                  fetchAppointments(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "today"
                    ? "bg-gray-600 dark:bg-dark-500 text-white"
                    : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-400"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setViewMode("upcoming");
                  fetchAppointments(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "upcoming"
                    ? "bg-gray-600 dark:bg-dark-500 text-white"
                    : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-400"
                }`}
              >
                Upcoming (7 days)
              </button>
            </div>

            {/* Search and Actions */}
            <div className="flex gap-2">
              {statusFilter && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Filtered by: {statusFilter}
                  </span>
                  <button
                    onClick={() => handleStatusFilter("")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </button>
                </div>
              )}
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <button
                onClick={async () => {
                  if (practice?.$id) {
                    console.log("Manual refresh triggered...");
                    setIsLoading(true);
                    try {
                      await fetchAppointments(currentPage);
                      await fetchCounts();
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold shadow-md bg-gray-600 dark:bg-dark-400 text-white hover:bg-gray-700 dark:hover:bg-dark-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh appointments data"
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
              <ThemeToggle />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={getFilteredAppointments()?.documents || []}
            />
          )}

          {/* Pagination Info */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-dark-400 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * 20 + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(
                    currentPage * 20,
                    getFilteredAppointments()?.pagination?.total || 0
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {getFilteredAppointments()?.pagination?.total || 0}
                </span>{" "}
                appointments
                {statusFilter && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    (filtered by {statusFilter})
                  </span>
                )}
              </div>
              {statusFilter && (
                <button
                  onClick={() => handleStatusFilter("")}
                  className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={
                  !appointmentData.pagination?.hasPreviousPage || isLoading
                }
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 dark:bg-dark-400 rounded-lg shadow-sm">
                <span className="text-gray-300">Page</span>
                <span className="font-semibold">{currentPage}</span>
                <span className="text-gray-300">of</span>
                <span className="font-semibold">
                  {appointmentData.pagination?.totalPages || 1}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!appointmentData.pagination?.hasNextPage || isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 shadow-sm"
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </CollapsibleSection>
      </main>

      <PracticeSettingsModal
        open={isPracticeSettingsOpen}
        onOpenChange={setIsPracticeSettingsOpen}
      />
    </div>
  );
};

export default Admin;
