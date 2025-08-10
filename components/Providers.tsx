"use client";
import { PracticeProvider } from "@/components/PracticeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PracticeProvider>
      {children}
    </PracticeProvider>
  );
} 