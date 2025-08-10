import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-Sans",
});

// ❌ Remove this static metadata
// export const metadata: Metadata = {
//   title: "MedCare",
//   description: "A one stop healthcare management system",
// };

import * as Sentry from "@sentry/nextjs";

// ✅ Keep this dynamic metadata
export function generateMetadata(): Metadata {
  return {
    title: "MedCare",
    description: "A one stop healthcare management system",
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head />
      <body
        className={cn(
          "min-h-screen bg-dark-300 font-sans antialiased theme-dark",
          fontSans.variable
        )}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
