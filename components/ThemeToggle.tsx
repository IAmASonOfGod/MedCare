"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const THEME_KEY = "medcare-admin-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("theme-dark");
  const pathname = usePathname();

  // Only show theme toggle on admin page
  if (pathname !== "/admin") {
    return null;
  }

  useEffect(() => {
    // On mount, set theme from localStorage or default
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      setTheme(saved);
      document.body.classList.remove("theme-dark", "theme-light");
      document.body.classList.add(saved);
    } else {
      document.body.classList.add("theme-dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "theme-dark" ? "theme-light" : "theme-dark";
    setTheme(newTheme);
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="ml-2 flex items-center gap-1 rounded-full px-3 py-2 bg-blue-100 dark:bg-dark-500 text-blue-700 dark:text-white border border-blue-200 dark:border-dark-400 shadow hover:bg-blue-200 dark:hover:bg-dark-400 transition"
      title={
        theme === "theme-dark"
          ? "Switch to Light Theme"
          : "Switch to Dark Theme"
      }
      type="button"
    >
      {theme === "theme-dark" ? (
        // Sun icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414M17.657 17.657l-1.414-1.414M6.343 6.343L4.929 4.929"
          />
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth={2} />
        </svg>
      ) : (
        // Moon icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
          />
        </svg>
      )}
      <span className="hidden sm:inline text-xs font-medium">
        {theme === "theme-dark" ? "Light" : "Dark"} Theme
      </span>
    </button>
  );
}
