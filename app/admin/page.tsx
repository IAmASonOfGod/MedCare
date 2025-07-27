"use client";
import React, { useEffect, useState } from "react";
import { usePractice } from "@/components/PracticeContext";
import { getRecentAppointmentList } from "@/lib/actions/appointment.action";
import StatCard from "@/components/StatCard";
import Image from "next/image";
import Link from "next/link";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import HealthcareProviderModal from "@/components/HealthcareProviderModal";
import ThemeToggle from "@/components/ThemeToggle";
import { fetchPracticeByAdminEmail } from "@/lib/actions/practice.actions";

const Admin = () => {
  const [appointments, setAppointments] = useState<any>(null);
  const { practice } = usePractice();
  console.log("Practice Name in Admin Page:", practice?.practiceName);
  useEffect(() => {
    async function fetchAppointments() {
      if (!practice?.$id) return;

      const data = await getRecentAppointmentList(practice.$id);
      setAppointments(data);

      // Signal that admin page is ready
      localStorage.setItem("adminReady", "true");
    }
    fetchAppointments();
  }, [practice?.$id]);

  // if (!appointments) return <div>Loading...</div>;

  // Provide default values if appointments is null
  const appointmentData = appointments || {
    scheduledCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
    documents: [],
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
          <h1 className="header">Welcome 👋 </h1>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>
        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointmentData.scheduledCount}
            label="Scheduled appointments"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={appointmentData.pendingCount}
            label="Pending appointments"
            icon="/assets/icons/pending.svg"
          />
          <StatCard
            type="cancelled"
            count={appointmentData.cancelledCount}
            label="Cancelled appointments"
            icon="/assets/icons/cancelled.svg"
          />
        </section>
        {/* Add Healthcare Provider Modal Button and Theme Toggle */}
        <div className="flex justify-end my-4 gap-2 items-center">
          <HealthcareProviderModal />
          <ThemeToggle />
        </div>
        <DataTable columns={columns} data={appointmentData.documents} />
      </main>
    </div>
  );
};

export default Admin;
