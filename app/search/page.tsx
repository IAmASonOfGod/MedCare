"use client";
import { useEffect, useState, useRef } from "react";
import { fetchPractices } from "@/lib/actions/practice.actions";
import Link from "next/link";

interface Practice {
  $id: string;
  practiceName: string;
  location: string;
  streetAddress?: string;
  suburb?: string;
  city?: string;
  province?: string;
  country?: string;
  address: string;
  businessHours?: string;
  description?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    setLoading(true); // Show loading as soon as user types
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      let active = true;
      async function search() {
        const result = await fetchPractices({
          search: query,
        });
        if (active)
          setPractices(
            (result || []).map((doc: any) => ({
              $id: doc.$id,
              practiceName: doc.practiceName,
              location: doc.location,
              streetAddress: doc.streetAddress,
              suburb: doc.suburb,
              city: doc.city,
              province: doc.province,
              country: doc.country,
              address: doc.address,
              businessHours: doc.businessHours,
              description: doc.description,
            }))
          );
        setLoading(false);
      }
      search();
      return () => {
        active = false;
      };
    }, 400); // 400ms debounce
    // Cleanup on unmount or query change
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-black dark:to-blue-950 transition-colors">
      <div className="max-w-2xl w-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-black/80 flex flex-col items-center gap-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 dark:text-blue-300 text-center mb-2">
          Find Your Provider
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 text-center mb-4">
          Search for your healthcare provider, clinic, or practice below.
        </p>
        <form className="w-full flex flex-col items-center gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, type, suburb, city, or province..."
            className="w-full px-6 py-4 rounded-xl border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 dark:bg-black dark:text-white dark:border-blue-700 text-lg shadow-md transition-all outline-none"
          />
        </form>
        <div className="w-full flex flex-col gap-6 mt-6">
          {query.trim() === "" ? null : loading ? (
            <div className="text-center text-blue-600 dark:text-blue-300">
              Loading...
            </div>
          ) : practices.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No practices found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {practices.map((practice) => (
                <Link
                  key={practice.$id}
                  href={`/patients/${practice.$id}`}
                  className="bg-white dark:bg-black/70 rounded-xl shadow-lg p-6 flex flex-col gap-2 border border-blue-200 dark:border-blue-800 transition hover:shadow-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <div className="font-bold text-xl text-blue-700 dark:text-blue-300">
                    {practice.practiceName}
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">
                    {practice.location}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {practice.streetAddress || ""}
                    {practice.streetAddress &&
                    (practice.suburb ||
                      practice.city ||
                      practice.province ||
                      practice.country)
                      ? ", "
                      : ""}
                    {practice.suburb || ""}
                    {practice.suburb &&
                    (practice.city || practice.province || practice.country)
                      ? ", "
                      : ""}
                    {practice.city || ""}
                    {practice.city && (practice.province || practice.country)
                      ? ", "
                      : ""}
                    {practice.province || ""}
                    {practice.province && practice.country ? ", " : ""}
                    {practice.country || ""}
                  </div>
                  {practice.businessHours && (
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      Business Hours: {practice.businessHours}
                    </div>
                  )}
                  {practice.description && practice.description.trim() && (
                    <div className="text-gray-600 dark:text-gray-300 mt-2">
                      {practice.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
