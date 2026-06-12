"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser } from "@/lib/auth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface Props {
  children: React.ReactNode;
  title: string;
}

export default function AppShell({ children, title }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    const user = getUser();
    const isUserPortal = typeof window !== "undefined" && window.location.pathname.startsWith("/user/");

    // Non-admin users get redirected to their own portal
    if (user && user.role !== "ADMIN" && !isUserPortal) {
      router.push("/user/dashboard");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="ml-56 flex-1 flex flex-col min-h-screen min-w-0">
        <Navbar title={title} />
        <main className="flex-1 p-6 fade-in">{children}</main>
      </div>
    </div>
  );
}