"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { logout, getUser } from "@/lib/auth";
import api from "@/lib/api";
import {
  Home,
  Users,
  UserPlus,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  LayoutDashboard,
  FileText,
} from "lucide-react";

function resolveLogoUrl(raw?: string | null): string {
  if (!raw || raw.trim() === "") return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fingrowhrm.info/api";
  const base = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${path}`;
}

type NavChild = { label: string; href: string; adminOnly?: boolean; userOnly?: boolean };
type NavNestedGroup = {
  label: string;
  icon?: React.ElementType;
  children: NavChild[];
};
type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: (NavChild | NavNestedGroup)[];
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "CONFIGURATION",
    icon: Settings,
    children: [
      { label: "Organization Data", href: "/configuration/organization" },
      { label: "Salary Components", href: "/configuration/salary-components" },
    ],
  },
  {
    label: "HRM",
    icon: Users,
    children: [
      { label: "Employees", href: "/hrm/employees" },
      {
        label: "Emp Documents",
        children: [
          { label: "Document Hub", href: "/hrm/emp-documents" },
          { label: "Offer Letter", href: "/hrm/emp-documents/offer-letter" },
          { label: "Probation Letter", href: "/hrm/emp-documents/probation-letter" },
          { label: "Increment Letter", href: "/hrm/emp-documents/increment-letter" },
          { label: "Exit Letter", href: "/hrm/emp-documents/exit-letter" },
        ],
      },
      { label: "Attendance", href: "/hrm/attendance" },
      { label: "Payslip", href: "/hrm/payslip" },
      { label: "Leave Management", href: "/hrm/leaves" },
      { label: "Timesheet Management", href: "/hrm/timesheets", adminOnly: true },
      { label: "My Timesheet", href: "/user/timesheets", userOnly: true },
      { label: "Policy Generator", href: "/hrm/policy-generator", adminOnly: true },
    ],
  },
  {
    label: "Recruitment",
    icon: UserPlus,
    children: [
      { label: "Candidates", href: "/recruitment/candidates" },
      { label: "Onboarding", href: "/recruitment/onboarding" },
    ],
  },
];

function isNestedGroup(item: NavChild | NavNestedGroup): item is NavNestedGroup {
  return "children" in item;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string[]>([
    "HRM",
    "CONFIGURATION",
    "Recruitment",
    "Emp Documents",
  ]);

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [companyName, setCompanyName] = useState<string>("Fingrow");

  const applyCompanyData = (data: any) => {
    if (!data) return;
    const resolved = resolveLogoUrl(data?.logoUrl ?? "");
    setLogoUrl(resolved);
    setLogoLoadError(false);
    if (data?.name) setCompanyName(data.name);
  };

  useEffect(() => {
    api
      .get("/company")
      .then((r) => applyCompanyData(r.data))
      .catch(() => { });

    const handler = (e: Event) => applyCompanyData((e as CustomEvent).detail);
    window.addEventListener("company-updated", handler);
    return () => window.removeEventListener("company-updated", handler);
  }, []);

  const toggle = (label: string) =>
    setOpen((o) =>
      o.includes(label) ? o.filter((x) => x !== label) : [...o, label]
    );

  const isChildActive = (children: (NavChild | NavNestedGroup)[]) =>
    children.some((c) =>
      isNestedGroup(c)
        ? c.children.some((sc) => pathname === sc.href)
        : pathname === c.href
    );

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setIsAdmin(u?.role === "ADMIN");
  }, []);

  // Filter navigation based on role
  const filteredNav = NAV.filter(item => {
    if (!item.children) {
      if (isAdmin && (item as any).userOnly) return false;
      if (!isAdmin && (item as any).adminOnly) return false;
      return true;
    }
    const visibleChildren = item.children.filter((c: any) => {
      if (isAdmin) return !c.userOnly;
      return !c.adminOnly;
    });
    return visibleChildren.length > 0;
  }).map(item => {
    if (item.children) {
      return {
        ...item,
        children: item.children.filter((c: any) => {
          if (isAdmin) return !c.userOnly;
          return !c.adminOnly;
        })
      };
    }
    return item;
  });

  const showLogo = Boolean(logoUrl) && !logoLoadError;

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-cream-dark flex flex-col z-40 shadow-sm">
      {/* Logo Section */}
      <Link href="/dashboard" className="px-5 py-6 border-b border-cream-dark flex-shrink-0 bg-white/50 backdrop-blur-sm block hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          {showLogo ? (
            <div className="flex items-center gap-3 w-full">
              <div className="hover:scale-105 transition-transform duration-300">
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="w-12 h-12 object-contain rounded-lg shadow-sm"
                  onError={() => setLogoLoadError(true)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-black text-navy leading-tight tracking-tight truncate">
                  {companyName.split(" ")[0] || "Fingrow"}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate leading-tight mt-0.5">
                  {companyName.split(" ").slice(1).join(" ") || "HRMS Portal"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center shadow-md shadow-navy/20 hover:rotate-3 transition-transform">
                <span className="text-white text-lg font-black tracking-tight">
                  {companyName.charAt(0).toUpperCase() || "F"}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-base font-black text-navy leading-tight tracking-tight truncate">
                  {companyName.split(" ")[0] || "Fingrow"}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate leading-tight mt-0.5">
                  HRMS Portal
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {filteredNav.map((item) => {
          if (!item.children) {
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={clsx("sidebar-link", pathname === item.href && "active")}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          }

          const isOpen = open.includes(item.label);
          const hasActive = isChildActive(item.children);

          return (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                className={clsx(
                  "sidebar-link w-full justify-between",
                  hasActive && !isOpen && "text-navy font-semibold"
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </span>
                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {isOpen && (
                <div className="ml-5 mt-0.5 pl-3 border-l border-cream-dark space-y-0.5">
                  {item.children.map((c) => {
                    if (isNestedGroup(c)) {
                      const isSubOpen = open.includes(c.label);
                      const subActive = c.children.some((sc) => pathname === sc.href);

                      return (
                        <div key={c.label}>
                          <button
                            onClick={() => toggle(c.label)}
                            className={clsx(
                              "sidebar-link w-full justify-between text-xs py-1.5",
                              subActive && !isSubOpen && "text-navy font-semibold"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {c.icon && <c.icon size={13} />}
                              <span>{c.label}</span>
                            </span>
                            {isSubOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                          </button>

                          {isSubOpen && (
                            <div className="ml-4 mt-0.5 pl-2 border-l border-cream-dark space-y-0.5">
                              {c.children.map((sc) => (
                                <Link
                                  key={sc.href}
                                  href={sc.href}
                                  className={clsx(
                                    "sidebar-link text-xs py-1",
                                    pathname === sc.href && "active"
                                  )}
                                >
                                  {sc.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={clsx(
                          "sidebar-link text-xs py-1.5",
                          pathname === c.href && "active"
                        )}
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-cream-dark flex-shrink-0">
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-400 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}