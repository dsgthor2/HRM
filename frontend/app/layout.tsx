import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DefenseBlu HRMS",
  description: "Human Resource Management System – DefenseBlu Private Limited",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DefenseBlu HRMS",
  },
  icons: { 
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png" 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
