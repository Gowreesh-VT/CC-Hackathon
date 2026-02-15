import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CC Hackathon Platform",
  description: "Manage judges, teams, and rounds for the CodeChef Hackathon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster richColors />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
