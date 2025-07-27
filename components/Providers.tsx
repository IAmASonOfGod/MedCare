"use client";
import { PracticeProvider } from "@/components/PracticeContext";
import { ThemeProvider } from "@/components/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PracticeProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {children}
      </ThemeProvider>
    </PracticeProvider>
  );
} 