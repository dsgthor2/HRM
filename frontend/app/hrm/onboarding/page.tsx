"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, Suspense, useState } from "react";
import api from "@/lib/api";
import {
  Users, CheckCircle2, Clock, FileText, ArrowRight,
  UserCheck, Calendar, Mail, Phone, Building2, Briefcase
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
  position?: string;
  department?: string;
  stage?: string;
  joiningDate?: string;
  createdAt?: string;
}

const STAGE_LABELS: Record<string, string> = {
  OFFER_ACCEPTED: "Offer Accepted",
  ONBOARDING: "Onboarding",
  HIRED: "Hired",
  CONVERTED: "Converted",
};

const STAGE_COLORS: Record<string, string> = {
  OFFER_ACCEPTED: "bg-amber-100 text-amber-700 border-amber-200",
  ONBOARDING: "bg-blue-100 text-blue-700 border-blue-200",
  HIRED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CONVERTED: "bg-purple-100 text-purple-700 border-purple-200",
};

function OnboardingPageInner() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hiringId, setHiringId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const targetId = searchParams.get("candidate");

  const loadCandidates = async () => {
    try {
      const res = await api.get("/candidates");
      const all: Candidate[] = res.data || [];
      const onboardingCandidates = all.filter(
        (c) =>
          c.stage === "OFFER_SENT" ||
          c.stage === "OFFER_ACCEPTED" ||
          c.stage === "ONBOARDING" ||
          c.stage === "HIRED"
      );
      setCandidates(onboardingCandidates.length > 0 ? onboardingCandidates : all);
    } catch (err) {
      console.error("Failed to load onboarding candidates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async (id: string) => {
    if (!confirm("Confirm conversion to employee? This will create an employee record.")) return;
    setHiringId(id);
    try {
      const res = await api.post(`/candidates/${id}/hire`);
      alert(`✅ Successfully converted! Employee ID: ${res.data.employee.employeeId}`);
      await loadCandidates();
      window.location.href = `/hrm/employees?view=${res.data.employee.id}`;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Conversion failed";
      alert(`❌ ${msg}`);
    } finally {
      setHiringId(null);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const filtered = candidates.filter((c) => {
    const matchesTarget = !targetId || c.id === targetId;
    const matchesSearch =
      !search ||
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.designation || c.position || "").toLowerCase().includes(search.toLowerCase());
    return matchesTarget && matchesSearch;
  });

  const stats = [
    {
      label: "Ready to Onboard",
      value: candidates.filter((c) => c.stage === "OFFER_ACCEPTED").length,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      label: "In Progress",
      value: candidates.filter((c) => c.stage === "ONBOARDING").length,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      label: "Completed",
      value: candidates.filter((c) => c.stage === "HIRED" || c.stage === "CONVERTED").length,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Total",
      value: candidates.length,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-100",
    },
  ];

  if (loading) {
    return (
      <AppShell title="Onboarding">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Onboarding">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Onboarding</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage new hire onboarding processes
            </p>
          </div>
          <Link
            href="/hrm/employees"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            <Users size={16} /> Add New Employee
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={clsx(
                "rounded-2xl border p-5 flex flex-col items-center justify-center text-center",
                s.bg
              )}
            >
              <span className={clsx("text-3xl font-black", s.color)}>
                {s.value}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Users
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="Search by name or designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {targetId && (
                <Link
                  href="/hrm/onboarding"
                  className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-2"
                >
                  <Clock size={14} /> Showing Target Only
                  <span className="opacity-50 font-normal underline ml-1">Clear</span>
                </Link>
              )}
            </div>
          </div>

          {/* Candidate List */}
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <UserCheck size={28} className="text-blue-400" />
                </div>
                <h3 className="font-black text-slate-700 text-lg mb-1">
                  No candidates ready to onboard
                </h3>
                <p className="text-sm text-slate-400">
                  Candidates who have accepted offers will appear here.
                </p>
                <Link
                  href="/hrm/employees"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  Add Candidate <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                      {(c.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, "") || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 text-sm">
                        {c.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, "")}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5 flex-wrap">
                        {(c.designation || c.position) && (
                          <span className="flex items-center gap-1">
                            <Briefcase size={10} />
                            {c.designation || c.position}
                          </span>
                        )}
                        {c.department && (
                          <span className="flex items-center gap-1">
                            <Building2 size={10} />
                            {c.department}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={10} />
                            {c.email}
                          </span>
                        )}
                        {c.joiningDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            Joining:{" "}
                            {new Date(c.joiningDate).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {c.stage && (
                      <span
                        className={clsx(
                          "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                          STAGE_COLORS[c.stage] ||
                            "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        {STAGE_LABELS[c.stage] || c.stage}
                      </span>
                    )}
                    <Link
                      href={`/hrm/emp-documents/offer-letter?type=OFFER&targetId=${c.id}&targetType=CANDIDATE`}
                      className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-50 transition-all"
                    >
                      <FileText size={12} /> Offer Letter
                    </Link>
                    <button
                      onClick={() => handleHire(c.id)}
                      disabled={hiringId === c.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {hiringId === c.id ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      Convert to Employee
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Onboarding Steps Guide */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="font-black text-lg mb-4">Onboarding Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Send Offer Letter",
                desc: "Generate and share the official offer letter with the candidate.",
                icon: <FileText size={20} />,
              },
              {
                step: "02",
                title: "Collect Documents",
                desc: "Gather necessary documents: ID proof, address proof, certificates.",
                icon: <CheckCircle2 size={20} />,
              },
              {
                step: "03",
                title: "Convert to Employee",
                desc: "Once all docs are verified, convert the candidate to an employee.",
                icon: <UserCheck size={20} />,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                    Step {s.step}
                  </span>
                </div>
                <div className="font-black text-white text-sm">{s.title}</div>
                <div className="text-xs text-blue-200 mt-1 leading-relaxed">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}

export default function OnboardingPage() {
  return <Suspense fallback={<div>Loading...</div>}><OnboardingPageInner /></Suspense>;
}
