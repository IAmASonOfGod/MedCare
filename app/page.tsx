"use client";
import Link from "next/link";

export default function WelcomeLandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-blue-950 transition-colors">
      {/* Admin Login Button */}
      <div className="w-full flex justify-end p-6 absolute top-0 right-0 z-10">
        <Link
          href="/admin-login"
          className="px-6 py-2 rounded-lg border-2 border-blue-600 text-blue-700 bg-white hover:bg-blue-50 dark:bg-black dark:border-blue-300 dark:text-blue-200 dark:hover:bg-blue-950 font-semibold shadow transition-colors"
        >
          Admin Login
        </Link>
      </div>
      <div className="max-w-2xl w-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-black/70 flex flex-col items-center gap-8">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/assets/icons/logo-icon.svg"
            alt="MedCare Logo"
            className="w-16 h-16 mb-2"
          />
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight">
            MedCare
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 text-center mt-2">
            Connecting patients and providers with ease.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 w-full mt-6">
          <Link
            href="/search"
            className="flex-1 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold shadow-lg transition-colors text-center"
          >
            Find my provider
          </Link>
          <Link
            href="/register-practice"
            className="flex-1 px-8 py-4 rounded-xl bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-700 text-xl font-semibold shadow-lg transition-colors text-center dark:bg-black dark:border-blue-300 dark:text-blue-200 dark:hover:bg-blue-950"
          >
            Register Your Practice
          </Link>
        </div>
      </div>
    </main>
  );
}
