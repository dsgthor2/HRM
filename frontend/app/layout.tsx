import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fingrow HRMS",
  description: "Human Resource Management System – Fingrow Consulting Services Pvt Ltd",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
