"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { Home, Users, Briefcase, Menu as MenuIcon, FileText, MonitorSmartphone } from "lucide-react";
import { getUser } from "@/lib/auth";

interface BottomNavProps {
  onOpenMenu: () => void;
}

export default function BottomNav({ onOpenMenu }: BottomNavProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    setIsAdmin(u?.role === "ADMIN" || u?.role === "SUPER_ADMIN");
  }, []);

  if (!mounted) return null;

  const adminTabs = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Employees", href: "/hrm/employees", icon: Users },
    { label: "Hiring", href: "/recruitment/candidates", icon: Briefcase },
  ];

  const employeeTabs = [
    { label: "Home", href: "/user/dashboard", icon: Home },
    { label: "Assets", href: "/hrm/assets", icon: MonitorSmartphone },
    { label: "Timesheet", href: "/user/timesheets", icon: FileText },
  ];

  const tabs = isAdmin ? adminTabs : employeeTabs;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark flex items-center justify-around z-40 pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex flex-col items-center justify-center w-full py-3 gap-1",
              isActive ? "text-accent" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon size={22} className={clsx("transition-transform duration-200", isActive && "scale-110")} />
            <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
          </Link>
        );
      })}
      
      {/* Menu Tab */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center w-full py-3 gap-1 text-slate-400 hover:text-slate-600"
      >
        <MenuIcon size={22} className="transition-transform duration-200" />
        <span className="text-[10px] font-medium tracking-wide">Menu</span>
      </button>
    </div>
  );
}
