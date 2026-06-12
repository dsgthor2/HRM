"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser } from "@/lib/auth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { Menu, X } from "lucide-react";

interface Props {
  children: React.ReactNode;
  title: string;
}

export default function AppShell({ children, title }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    const user = getUser();
    const isUserPortal = typeof window !== "undefined" && window.location.pathname.startsWith("/user/");

    // Non-admin users get redirected to their own portal
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && !isUserPortal) {
      router.push("/user/dashboard");
      return;
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-[100dvh] bg-cream overflow-hidden">
      {/* Mobile Sidebar Overlay (now acts as a full-screen menu from the BottomNav) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:ml-56 flex-1 flex flex-col h-[100dvh] min-w-0 transition-all overflow-hidden relative">
        <div className="hidden md:block">
          <Navbar title={title} />
        </div>
        
        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 fade-in custom-scrollbar">
          {children}
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}
