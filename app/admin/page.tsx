"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePractice } from "@/components/PracticeContext";
import {
  getRecentAppointmentList,
  getAppointmentCounts,
  getTodaysAppointments,
  getUpcomingAppointments,
} from "@/lib/actions/appointment.action";
import { getAppointmentCountsByPeriod } from "@/lib/actions/appointment.action";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import AppointmentAnalytics from "@/components/AppointmentAnalytics";
import CollapsibleSection from "@/components/CollapsibleSection";
import PracticeSettingsModal from "@/components/PracticeSettingsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Admin = () => {
  const [appointments, setAppointments] = useState<any>(null);
  const [appointmentCounts, setAppointmentCounts] = useState<any>({
    totalCount: 0,
    scheduledCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
    completedCount: 0,
    noShowCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "today" | "upcoming">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  // Analytics period (drives AppointmentAnalytics)
  const [timePeriod, setTimePeriod] = useState<"today" | "week" | "month" | "quarter" | "year" | "all-time">("today");
  // Stat cards period (drives counts fetched for cards)
  const [cardsPeriod, setCardsPeriod] = useState<"today" | "week" | "month" | "quarter" | "year" | "all-time">("today");
  const [collapsedSections, setCollapsedSections] = useState({
    analytics: false,
    appointments: false,
  });
  const [isPracticeSettingsOpen, setIsPracticeSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );
  const [filterNotification, setFilterNotification] = useState<string | null>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const [highlightTable, setHighlightTable] = useState<boolean>(false);
  const { practice } = usePractice();
  const statCardsSectionRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Date range helpers
  const formatDate = (date: Date, includeWeekday: boolean = false) => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      weekday: includeWeekday ? "long" : undefined,
      year: "numeric",
      month: includeWeekday ? "long" : "short",
      day: "numeric",
    });
    const parts = fmt.formatToParts(date);
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    const day = get("day");
    const month = get("month");
    const year = get("year");
    const weekday = includeWeekday ? get("weekday") : "";
    return includeWeekday
      ? `${weekday}, ${day} ${month} ${year}`
      : `${day} ${month} ${year}`;
  };

  const getRangeLabel = (period: "today" | "week" | "month" | "quarter" | "year" | "all-time") => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (period) {
      case "today": {
        return formatDate(now, true);
      }
      case "week": {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${formatDate(start)} – ${formatDate(end)}`;
      }
      case "month": {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return `${formatDate(start)} – ${formatDate(end)}`;
      }
      case "quarter": {
        const q = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), q * 3, 1);
        end = new Date(now.getFullYear(), q * 3 + 3, 0);
        return `${formatDate(start)} – ${formatDate(end)}`;
      }
      case "year": {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        return `${formatDate(start)} – ${formatDate(end)}`;
      }
      case "all-time":
      default:
        return "All time";
    }
  };

  const fetchAppointments = async (
    page: number = 1,
    mode: "all" | "today" | "upcoming" = viewMode,
    showLoading: boolean = true
  ) => {
    if (!practice?.$id) return;

    if (showLoading) {
      setIsLoading(true);
    }
    setAppointmentsError(null);
    try {
      let data;
      switch (mode) {
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
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      const message =
        typeof error?.message === "string" &&
        (error.message.includes("network") || error.message.includes("fetch"))
          ? "Network error. Please check your connection and try again."
          : "Unable to load appointments. Please try again.";
      if (showLoading) {
        setAppointmentsError(message);
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const fetchCounts = async () => {
    if (!practice?.$id) return;
    try {
      const counts = await getAppointmentCountsByPeriod(practice.$id, cardsPeriod);
      setAppointmentCounts(counts);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    if (practice?.$id) {
      fetchAppointments(1, viewMode);
      fetchCounts();
      localStorage.setItem("adminReady", "true");
    }
  }, [practice?.$id]);

  useEffect(() => {
    if (practice?.$id) {
      fetchCounts();
    }
  }, [practice?.$id, cardsPeriod]);

  // Auto-refresh every 30s in background (no loading state)
  useEffect(() => {
    if (!practice?.$id) return;
    const interval = setInterval(() => {
      console.log("Admin: Background auto-refresh (no loading)");
      fetchAppointments(currentPage, viewMode, false); // false = don't show loading state
      fetchCounts(); // fetchCounts doesn't have loading state anyway
    }, 30000);
    return () => clearInterval(interval);
  }, [practice?.$id, currentPage, viewMode]);

  // Event-driven refresh when appointments are updated elsewhere
  useEffect(() => {
    function handleUpdated() {
      if (!practice?.$id) return;
      fetchAppointments(currentPage, viewMode, false); // false = don't show loading for events
      fetchCounts();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("appointments:updated", handleUpdated);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("appointments:updated", handleUpdated);
      }
    };
  }, [practice?.$id, currentPage, viewMode]);

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage) fetchAppointments(newPage, viewMode);
  };

  const handleStatusFilter = (status: string) => {
    const newFilter = status === statusFilter ? "" : status;
    
    // Show click animation
    if (newFilter) {
      setClickedCard(status);
      setTimeout(() => setClickedCard(null), 300);
    }
    
    setStatusFilter(newFilter);
    setViewMode("all");
    // Ensure appointments section is expanded so scroll lands on visible content
    setCollapsedSections((prev) => ({ ...prev, appointments: false }));
    
    // Scroll to appointments section to show the filtered results
    if (newFilter) {
      setTimeout(() => {
        const appointmentsSection = document.querySelector('[data-section="appointments"]') as HTMLElement | null;
        if (appointmentsSection) {
          const rect = appointmentsSection.getBoundingClientRect();
          const y = rect.top + window.scrollY - 112; // offset for header
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 180);
    }
    
    // no popup notification; UI provides scroll and highlight feedback
    // Briefly highlight the table to draw attention
    setHighlightTable(true);
    setTimeout(() => setHighlightTable(false), 1000);
  };

  const handleTimePeriodChange = async (newPeriod: "today" | "week" | "month" | "quarter" | "year" | "all-time") => {
    setTimePeriod(newPeriod);
    if (practice?.$id) {
      try {
        // No need to refetch stat cards here; analytics uses this period
      } catch (error) {
        console.error("Error fetching period counts:", error);
      }
    }
  };

  const handleCardsPeriodChange = async (newPeriod: "today" | "week" | "month" | "quarter" | "year" | "all-time") => {
    setCardsPeriod(newPeriod);
    if (practice?.$id) {
      try {
        const counts = await getAppointmentCountsByPeriod(practice.$id, newPeriod);
        setAppointmentCounts(counts);
      } catch (error) {
        console.error("Error fetching stat card counts:", error);
      }
    }
  };

  const toggleSection = (section: "analytics" | "appointments") => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Combined filtering + recomputed pagination
  const getFilteredAppointments = () => {
    if (!appointments) return appointments;

    const limit = appointments.pagination?.limit || 20;
    const page = appointments.pagination?.page || currentPage;

    let docs = appointments.documents as any[];

    if (statusFilter)
      docs = docs.filter((apt: any) => apt.status === statusFilter);

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      docs = docs.filter((apt: any) => {
        const patient = apt.patient || {};
        const fields = [
          apt.reason,
          String(patient.name || ""),
          String(patient.email || ""),
          String(patient.phone || ""),
        ];
        return fields.some((f) =>
          String(f || "")
            .toLowerCase()
            .includes(term)
        );
      });
    }

    const total = docs.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const clampedPage = Math.min(page, totalPages);
    const startIndex = (clampedPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);

    const pageDocs = docs.slice(startIndex, endIndex);

    return {
      ...appointments,
      documents: pageDocs,
      pagination: {
        page: clampedPage,
        limit,
        total,
        totalPages,
        hasNextPage: clampedPage < totalPages,
        hasPreviousPage: clampedPage > 1,
      },
    };
  };

  // Click-away: clear stat card filter when clicking outside the stat cards section
  useEffect(() => {
    function handleClickAwayCore(target: EventTarget | null) {
      if (!statusFilter) return;
      const container = statCardsSectionRef.current;
      if (container && target instanceof Node && !container.contains(target)) {
        // Check if the click is specifically on the filter button
        const filterButton = document.querySelector('[aria-label="Clear status filter"]');
        
        // Don't trigger scroll back if clicking specifically on the filter button
        if (filterButton && (filterButton === target || filterButton.contains(target as Node))) {
          return;
        }
        
        setStatusFilter("");
        setViewMode("all");
        setTimeout(() => {
          if (statCardsSectionRef.current) {
            const rect = statCardsSectionRef.current.getBoundingClientRect();
            const y = rect.top + window.scrollY - 112; // offset for header
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 150);
      }
    }

    const onPointerDownCapture = (e: Event) => handleClickAwayCore(e.target);
    const onClick = (e: Event) => handleClickAwayCore(e.target);

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
      document.removeEventListener("click", onClick);
    };
  }, [statusFilter]);

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
        {/* Notification removed as UI is now self-explanatory */}
        
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
                    setIsDropdownOpen(false);
                    router.push("/admin/payment");
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
                    try {
                      localStorage.removeItem("adminReady");
                    } catch {}
                    setIsDropdownOpen(false);
                    router.push("/admin-login");
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
          <p className="text-white">
            Start the day with managing new appointments
          </p>
        </section>

        <section className="w-full space-y-4 scroll-mt-28" ref={statCardsSectionRef}>
          <div className="text-center">
            <div className="text-sm text-gray-300">{getRangeLabel(cardsPeriod)}</div>
            <div className="mt-3 flex justify-center gap-2">
              {(["today","week","month","quarter","year","all-time"] as const).map((p) => (
                <button
                  key={`cards-${p}`}
                  onClick={() => handleCardsPeriodChange(p)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    cardsPeriod === p ? "bg-blue-600 text-white" : "bg-dark-300 text-gray-200 hover:bg-dark-400"
                  }`}
                >
                  {p === "today" ? "Today" : p === "week" ? "Week" : p === "month" ? "Month" : p === "quarter" ? "Quarter" : p === "year" ? "Year" : "All Time"}
                </button>
              ))}
            </div>
            <p className="mt-5 text-xs text-gray-400">Click stat card to filter table</p>
          </div>
          <div className="admin-stat">
            <div onClick={() => handleStatusFilter("scheduled")}>
              <StatCard
                type="appointments"
                count={appointmentCounts.scheduledCount}
                label="Scheduled appointments"
                icon="/assets/icons/appointments.svg"
                isSelected={statusFilter === "scheduled"}
                isClickable={true}
              />
            </div>
            <div onClick={() => handleStatusFilter("pending")}>
              <StatCard
                type="pending"
                count={appointmentCounts.pendingCount}
                label="Pending appointments"
                icon="/assets/icons/pending.svg"
                isSelected={statusFilter === "pending"}
                isClickable={true}
            />
            </div>
            <div onClick={() => handleStatusFilter("completed")}>
              <StatCard
                type="appointments"
                count={appointmentCounts.completedCount}
                label="Completed appointments"
                icon="/assets/icons/check.svg"
                isSelected={statusFilter === "completed"}
                isClickable={true}
              />
            </div>
            <div onClick={() => handleStatusFilter("cancelled")}>
              <StatCard
                type="cancelled"
                count={appointmentCounts.cancelledCount}
                label="Cancelled appointments"
                icon="/assets/icons/cancelled.svg"
                isSelected={statusFilter === "cancelled"}
                isClickable={true}
              />
            </div>
          </div>
        </section>

        {practice?.$id && (
          <CollapsibleSection
            title="Analytics Dashboard"
            isCollapsed={collapsedSections.analytics}
            onToggle={() => toggleSection("analytics")}
          >
            <div className="mb-1 text-xs text-gray-400">{getRangeLabel(timePeriod)}</div>
            {/* Analytics period selector */}
            <div className="mb-4 flex flex-wrap gap-2">
              {(["today","week","month","quarter","year","all-time"] as const).map((p) => (
                <button
                  key={`analytics-${p}`}
                  onClick={() => handleTimePeriodChange(p)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timePeriod === p ? "bg-dark-500 text-white" : "bg-dark-300 text-gray-200 hover:bg-dark-400"
                  }`}
                >
                  {p === "today" ? "Today" : p === "week" ? "Week" : p === "month" ? "Month" : p === "quarter" ? "Quarter" : p === "year" ? "Year" : "All Time"}
                </button>
              ))}
            </div>
            <AppointmentAnalytics practiceId={practice.$id} timePeriod={timePeriod} />
          </CollapsibleSection>
        )}

        <CollapsibleSection
          title="Appointments"
          isCollapsed={collapsedSections.appointments}
          onToggle={() => toggleSection("appointments")}
          data-section="appointments"
          className="scroll-mt-28"
        >
          {/* Filters bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 my-6 p-4 bg-dark-400 rounded-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setViewMode("all");
                    setStatusFilter("");
                    setSearchTerm("");
                    fetchAppointments(1, "all");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "all"
                      ? "bg-dark-500 text-white"
                      : "bg-dark-300 text-gray-200 hover:bg-dark-400"
                  }`}
                >
                  All Appointments
                </button>
                <button
                  onClick={() => {
                    setViewMode("today");
                    setStatusFilter("");
                    setSearchTerm("");
                    fetchAppointments(1, "today");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "today"
                      ? "bg-dark-500 text-white"
                      : "bg-dark-300 text-gray-200 hover:bg-dark-400"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    setViewMode("upcoming");
                    setStatusFilter("");
                    setSearchTerm("");
                    fetchAppointments(1, "upcoming");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "upcoming"
                      ? "bg-dark-500 text-white"
                      : "bg-dark-300 text-gray-200 hover:bg-dark-400"
                  }`}
                >
                  Upcoming (7 days)
                </button>
              </div>
              {statusFilter && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-900/40 rounded-lg">
                  <span className="text-sm text-blue-300">
                    Filtered by: {statusFilter}
                  </span>
                  <button
                    onClick={() => handleStatusFilter("")}
                    className="text-blue-300 hover:text-blue-200"
                    aria-label="Clear status filter"
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
                className="px-3 py-2 border border-dark-500 rounded-lg bg-dark-300 text-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-500 w-56"
              />
            </div>
            <div className="flex items-center ml-auto">
              <button
                onClick={async () => {
                  if (practice?.$id) {
                    await fetchAppointments(currentPage, viewMode, true); // true = show loading for manual refresh
                    await fetchCounts();
                  }
                }}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold shadow-md bg-dark-400 text-white hover:bg-dark-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </div>

          {appointmentsError ? (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <h3 className="text-red-200 font-semibold mb-2">
                Error Loading Appointments
              </h3>
              <p className="text-red-300 text-sm">{appointmentsError}</p>
              <button
                onClick={() => fetchAppointments(currentPage, viewMode, true)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className={`rounded-lg transition-shadow ${highlightTable ? "ring-2 ring-blue-400/60" : ""}`}>
              <DataTable
                columns={columns}
                data={getFilteredAppointments()?.documents || []}
              />
            </div>
          )}

          {/* Pagination Info */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-dark-400 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-300">
                Showing{" "}
                <span className="font-semibold">
                  {((getFilteredAppointments()?.pagination?.page || 1) - 1) *
                    (getFilteredAppointments()?.pagination?.limit || 20) +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(
                    (getFilteredAppointments()?.pagination?.page || 1) *
                      (getFilteredAppointments()?.pagination?.limit || 20),
                    getFilteredAppointments()?.pagination?.total || 0
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {getFilteredAppointments()?.pagination?.total || 0}
                </span>{" "}
                appointments
                {statusFilter && (
                  <span className="ml-2 text-blue-300">
                    (filtered by {statusFilter})
                  </span>
                )}
                {searchTerm && (
                  <span className="ml-2 text-blue-300">
                    (search: "{searchTerm}")
                  </span>
                )}
              </div>
              {(statusFilter || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setSearchTerm("");
                  }}
                  className="px-3 py-1 text-sm text-blue-300 hover:text-blue-200 underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  handlePageChange(
                    (getFilteredAppointments()?.pagination?.page || 1) - 1
                  )
                }
                disabled={
                  !getFilteredAppointments()?.pagination?.hasPreviousPage ||
                  isLoading
                }
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 bg-dark-300 border border-dark-500 rounded-lg hover:bg-dark-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
              <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-dark-400 rounded-lg shadow-sm">
                <span className="text-gray-300">Page</span>
                <span className="font-semibold">
                  {getFilteredAppointments()?.pagination?.page || 1}
                </span>
                <span className="text-gray-300">of</span>
                <span className="font-semibold">
                  {getFilteredAppointments()?.pagination?.totalPages || 1}
                </span>
              </div>
              <button
                onClick={() =>
                  handlePageChange(
                    (getFilteredAppointments()?.pagination?.page || 1) + 1
                  )
                }
                disabled={
                  !getFilteredAppointments()?.pagination?.hasNextPage ||
                  isLoading
                }
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 bg-dark-300 border border-dark-500 rounded-lg hover:bg-dark-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
        practiceId={practice?.$id || ""}
      />
    </div>
  );
};

export default Admin;
