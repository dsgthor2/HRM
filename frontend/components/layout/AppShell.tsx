"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser } from "@/lib/auth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
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
    if (user && user.role !== "ADMIN" && !isUserPortal) {
      router.push("/user/dashboard");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:ml-56 flex-1 flex flex-col min-h-screen min-w-0 transition-all">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-cream-dark p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="font-black text-navy text-lg tracking-tight">DefenseBlu</div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="hidden md:block">
          <Navbar title={title} />
        </div>
        <main className="flex-1 p-4 md:p-6 fade-in">{children}</main>
      </div>
    </div>
  );
}