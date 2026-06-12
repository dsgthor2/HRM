"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import {
  Search, FileText, CheckCircle2, AlertCircle, XCircle, LogOut,
  ChevronLeft, ChevronRight, UserPlus, Users, MessageSquare, TrendingUp, CalendarCheck
} from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import clsx from "clsx";

interface UnifiedPerson {
  id: string;
  type: "Candidate" | "Employee";
  name: string;
  designation: string;
  department: string | null;
  status: string;
  avatarInitials: string;
  original: any;
}

const PIE_COLORS = ["#1d4ed8", "#38bdf8", "#818cf8", "#c084fc"];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [hiringId, setHiringId] = useState<string | null>(null);

  // Load data function to refresh list
  const loadData = async () => {
    try {
      const [dashRes, candRes, empRes] = await Promise.all([
        api.get("/dashboard").catch(() => ({ data: null })),
        api.get("/candidates").catch(() => ({ data: [] })),
        api.get("/employees").catch(() => ({ data: [] })),
      ]);
      if (dashRes.data) setData(dashRes.data);
      setCandidates(candRes.data || []);
      setEmployees(empRes.data || []);
    } catch (err) {
      console.error("Reload failed", err);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to REJECT this candidate?")) return;
    try {
      await api.put(`/candidates/${id}/stage`, { stage: "REJECTED" });
      alert("✅ Candidate marked as REJECTED");
      await loadData();
    } catch (err: any) {
      alert("❌ Failed to update status");
    }
  };

  const handleHire = async (id: string) => {
    if (!confirm("Are you sure you want to convert this candidate to an employee?")) return;
    setHiringId(id);
    try {
      const res = await api.post(`/candidates/${id}/hire`);
      alert(`✅ Successfully converted to employee! ID: ${res.data.employee.employeeId}`);
      await loadData();
      window.location.href = `/hrm/employees?view=${res.data.employee.id}`;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to convert";
      alert(`❌ ${msg}`);
    } finally {
      setHiringId(null);
    }
  };

  // Org master data for filters
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [designations, setDesignations] = useState<{ id: string; title: string }[]>([]);

  // List Filters
  const [activeTab, setActiveTab] = useState<"All" | "Candidates" | "Employees">("All");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [desigFilter, setDesigFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    // Safety exit: clear loader after 10s if backend hangs
    const timer = setTimeout(() => setLoading(false), 10000);

    (async () => {
      try {
        const [dashRes, candRes, empRes, deptRes, desigRes] = await Promise.all([
          api.get("/dashboard").catch(e => ({ data: null })),
          api.get("/candidates").catch(e => ({ data: [] })),
          api.get("/employees").catch(e => ({ data: [] })),
          api.get("/company/departments").catch(e => ({ data: [] })),
          api.get("/company/designations").catch(e => ({ data: [] })),
        ]);
        if (dashRes.data) setData(dashRes.data);
        setCandidates(candRes.data || []);
        setEmployees(empRes.data || []);
        setDepartments(deptRes.data || []);
        setDesignations(desigRes.data || []);
      } catch (err) {
        console.error("Dashboard total failure", err);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    })();
    return () => clearTimeout(timer);
  }, []);

  const unifiedList = useMemo(() => {
    const list: UnifiedPerson[] = [];
    candidates.forEach(c => {
      // Don't show candidates that are already hired, converted, or rejected
      if (["HIRED", "CONVERTED", "REJECTED"].includes(c.stage)) return;
      
      list.push({
        id: c.id,
        type: "Candidate",
        name: (c.name || "Unknown").replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, ""),
        designation: c.designation || c.position || "N/A",
        department: null,
        status: c.stage || "Candidate",
        avatarInitials: (c.name || "?")[0].toUpperCase(),
        original: c
      });
    });
    employees.forEach(e => {
      list.push({
        id: e.id,
        type: "Employee",
        name: (e.name || "Unknown").replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, ""),
        designation: e.designation || "N/A",
        department: e.department || null,
        status: e.status || "ACTIVE",
        avatarInitials: (e.name || "?")[0].toUpperCase(),
        original: e
      });
    });
    return list;
  }, [candidates, employees]);

  const filteredList = useMemo(() => {
    return unifiedList.filter(item => {
      if (activeTab === "Candidates" && item.type !== "Candidate") return false;
      if (activeTab === "Employees" && item.type !== "Employee") return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.designation.toLowerCase().includes(search.toLowerCase())) return false;
      if (deptFilter && item.department !== deptFilter) return false;
      if (desigFilter && item.designation !== desigFilter) return false;
      return true;
    });
  }, [unifiedList, activeTab, search, deptFilter, desigFilter]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const currentList = filteredList.slice((page - 1) * pageSize, page * pageSize);

  const handleTabChange = (t: any) => { setActiveTab(t); setPage(1); };

  // Export filtered list as CSV
  const handleExport = () => {
    const rows = filteredList;
    if (rows.length === 0) { alert("No data to export."); return; }
    const headers = ["Name", "Type", "Designation", "Department", "Status"];
    const csvRows = [
      headers.join(","),
      ...rows.map(r => [
        `"${r.name}"`,
        r.type,
        `"${r.designation}"`,
        `"${r.department || ""}"`,
        r.status,
      ].join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employee_list_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const pieData = data?.charts?.byStatus?.map((s: any) => ({ name: s.status, value: s._count.id })) || [{ name: "Fulltime", value: employees.length }];

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">

        {/* ROW 1: HR Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-[15px] mb-4">HR Activities</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-center flex-col text-center min-w-[120px]">
              <span className="text-3xl font-black text-blue-600">{data?.kpis?.totalCandidates || 0}</span>
              <span className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">Active Offers</span>
            </div>
            <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-center flex-col text-center min-w-[120px]">
              <span className="text-3xl font-black text-emerald-600">{data?.kpis?.payslipsThisMonth || 0}</span>
              <span className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">Payslips Issued</span>
            </div>
            <div className="flex-1 bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-center justify-center flex-col text-center min-w-[120px]">
              <span className="text-3xl font-black text-amber-600">{candidates.filter(c => c.stage === 'OFFER_ACCEPTED').length || 0}</span>
              <span className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">Ready to Onboard</span>
            </div>
            <div className="flex-1 bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex items-center justify-center flex-col text-center min-w-[120px]">
              <span className="text-3xl font-black text-purple-600">0</span>
              <span className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">Pending Confirms</span>
            </div>
          </div>
        </div>

        {/* ROW 2: Employee List + Quick Actions (directly after HR Activities) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">Employee list</h2>
                      <p className="text-xs text-slate-500">All employees and candidates in one list</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      <LogOut size={14} className="-rotate-90" /> Export
                    </button>
                    <Link href="/hrm/employees" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      <FileText size={14} /> View detailed list
                    </Link>
                    <Link href="/hrm/employees" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm">
                      <UserPlus size={14} /> Add New Employee
                    </Link>
                  </div>
                </div>

                <div className="flex border-b border-slate-200 mb-5 relative top-px">
                  {[
                    { id: "All", count: unifiedList.length },
                    { id: "Candidates", count: unifiedList.filter(i => i.type === "Candidate").length },
                    { id: "Employees", count: unifiedList.filter(i => i.type === "Employee").length }
                  ].map(t => (
                    <button key={t.id} onClick={() => handleTabChange(t.id as any)} className={clsx("px-6 py-3 font-bold text-sm tracking-wide gap-2 flex items-center transition-all border-b-2", activeTab === t.id ? "border-blue-600 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300")}>
                      {t.id} <span className={clsx("px-2 py-0.5 rounded-full text-[10px]", activeTab === t.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>{t.count}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Search by Name or Designation" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm min-w-[160px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                  <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm min-w-[160px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={desigFilter} onChange={e => setDesigFilter(e.target.value)}>
                    <option value="">All Designations</option>
                    {designations.map(d => <option key={d.id} value={d.title}>{d.title}</option>)}
                  </select>
                  <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm min-w-[120px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                    <option>Sort By</option>
                    <option>Name A-Z</option>
                    <option>Recent</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <div className="divide-y divide-slate-100">
                  {currentList.map(item => (
                    <div key={`${item.type}-${item.id}`} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4 w-1/3">
                        <div className={clsx("w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-white text-sm shadow-sm", item.type === "Candidate" ? "bg-blue-600" : "bg-emerald-500")}>
                          {item.avatarInitials}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[220px]">{item.designation} {item.department ? `- ${item.department}` : ""}</div>
                          <div className={clsx("inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-sm border", item.type === "Candidate" ? "bg-blue-600 border-blue-700 text-white" : "bg-emerald-50 border-emerald-200 text-emerald-700")}>
                            {item.type}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto min-w-0 pr-4">
                        {/* Candidate Buttons */}
                        {(() => {
                           const stage = item.status || "NEW";
                           const isCandidate = item.type === "Candidate";
                           const offerDone = ["OFFER_SENT", "OFFER_ACCEPTED", "ONBOARDING", "HIRED", "CONVERTED"].includes(stage);
                           const onboardDone = ["OFFER_ACCEPTED", "ONBOARDING", "HIRED", "CONVERTED"].includes(stage);
                           
                           return (
                             <>
                                <Link href={`/hrm/emp-documents/offer-letter?type=OFFER&targetId=${item.id}&targetType=CANDIDATE`}
                                  className={clsx(
                                    "shrink-0 flex flex-col items-center justify-center w-16 h-12 rounded-lg border-2 transition-all",
                                    !isCandidate ? "border-slate-100 text-slate-300 pointer-events-none" :
                                    offerDone ? "border-slate-200 bg-slate-50 text-slate-400" : 
                                    "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                                  )}>
                                  {offerDone ? <CheckCircle2 size={16} className="text-emerald-500" /> : <FileText size={16} />}
                                  <span className="text-[8px] font-bold uppercase mt-1">Offer</span>
                                </Link>

                                <Link href={`/hrm/onboarding?candidate=${item.id}`}
                                  className={clsx(
                                    "shrink-0 flex flex-col items-center justify-center w-16 h-12 rounded-lg border-2 transition-all",
                                    !isCandidate ? "border-slate-100 text-slate-200 pointer-events-none" :
                                    onboardDone ? "border-slate-200 bg-slate-50 text-slate-400" :
                                    stage === "OFFER_SENT" ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100" :
                                    "border-blue-100 text-blue-300 pointer-events-none"
                                  )}>
                                  {onboardDone ? <CheckCircle2 size={16} className="text-emerald-500" /> : <CheckCircle2 size={16} />}
                                  <span className="text-[8px] font-bold uppercase mt-1">Onboard</span>
                                </Link>

                                <button className={clsx("shrink-0 flex flex-col items-center justify-center w-16 h-12 rounded-lg border-2 transition-all", isCandidate ? "border-red-100 text-red-400 hover:bg-red-50" : "border-slate-100 text-slate-300 pointer-events-none")}
                                  onClick={() => handleReject(item.id)}>
                                  <XCircle size={16} /><span className="text-[8px] font-bold uppercase mt-1">Reject</span>
                                </button>

                                <button className={clsx(
                                    "shrink-0 flex flex-col items-center justify-center w-16 h-12 rounded-lg border-2 transition-all",
                                    isCandidate && offerDone ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 shadow-lg scale-105" : 
                                    isCandidate ? "border-blue-100 text-blue-200 pointer-events-none" :
                                    "border-slate-100 text-slate-300 bg-slate-50/50 pointer-events-none"
                                  )}
                                  onClick={() => handleHire(item.id)} disabled={hiringId === item.id || !isCandidate || !offerDone}>
                                  {hiringId === item.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={16} />}
                                  <span className="text-[8px] font-bold uppercase mt-1">Convert</span>
                                </button>
                             </>
                           )
                        })()}

                        <div className="w-px h-8 bg-slate-200 mx-1 shrink-0" />

                        {/* Employee Buttons */}
                        {(() => {
                           const isEmp = item.type === "Employee";
                           const letters = item.original?.letters || [];
                           const probDone = letters.some((l: any) => l.type === "PROBATION");
                           const incrDone = letters.some((l: any) => l.type === "INCREMENT");
                           const exitDone = letters.some((l: any) => l.type === "EXIT");

                           return (
                             <>
                                <Link href={`/hrm/emp-documents/probation-letter?type=PROBATION&targetId=${item.id}&targetType=EMPLOYEE`}
                                  className={clsx(
                                    "shrink-0 flex flex-col items-center justify-center w-16 h-12 rounded-lg border-2 transition-all",
                                    !isEmp ? "border-slate-100 text-slate-300 pointer-events-none" :
                                    probDone ? "border-slate-200 bg-slate-50 text-slate-400" : 
                                    "border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                  )}>
                                  {probDone ? <CheckCircle2 size={16} className="text-emerald-500" /> : <FileText size={16} />}
                                  <span className="text-[8px] font-bold uppercase mt-1">Probation</span>
                                </Link>

                                <Link href={`/hrm/emp-documents/increment-letter?type=INCREMENT&targetId=${item.id}&targetType=EMPLOYEE`}
                                  className={clsx(
                                    "shrink-0 flex flex-col items-center justify-center w-16 h-12 rounded-lg border-2 transition-all",
                                    !isEmp ? "border-slate-100 text-slate-300 pointer-events-none" :
                                    incrDone ? "border-slate-200 bg-slate-50 text-slate-400" :
                                    probDone ? "border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100" :
                                    "border-blue-100 text-blue-300 hover:bg-blue-50 hover:border-blue-400"
                                  )}>
                                  {incrDone ? <CheckCircle2 size={16} className="text-emerald-500" /> : <TrendingUp size={16} />}
                                  <span className="text-[8px] font-bold uppercase mt-1">Increment</span>
                                </Link>

                                <Link href={`/hrm/emp-documents/exit-letter?type=EXIT&targetId=${item.id}&targetType=EMPLOYEE`}
                                  className={clsx(
                                    "shrink-0 flex flex-col items-center justify-center w-16 h-12 rounded-lg border-2 transition-all",
                                    !isEmp ? "border-slate-100 text-slate-300 pointer-events-none" :
                                    exitDone ? "border-slate-200 bg-slate-50 text-slate-400" :
                                    "border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                                  )}>
                                  {exitDone ? <CheckCircle2 size={16} className="text-emerald-500" /> : <LogOut size={16} className="translate-x-0.5" />}
                                  <span className="text-[8px] font-bold uppercase mt-1">Separation</span>
                                </Link>
                             </>
                           );
                        })()}
                      </div>
                    </div>
                  ))}
                  {currentList.length === 0 && <div className="p-8 text-center text-slate-400 font-bold">No results found for current filters</div>}
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:text-slate-700 disabled:opacity-50 shadow-sm"><ChevronLeft size={16}/></button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={clsx("w-8 h-8 flex items-center justify-center rounded font-bold text-xs transition-all shadow-sm", page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:text-slate-700 disabled:opacity-50 shadow-sm"><ChevronRight size={16}/></button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* For New Candidate Block */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><Users size={16}/></div>
                <h3 className="font-black text-slate-800 text-lg">For New Candidate</h3>
              </div>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Use for new hires not yet in Offrd. No employee record required.
              </p>
              <Link href="/hrm/emp-documents/offer-letter?type=OFFER" className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-black text-slate-800">Offer Letter</div>
                  <div className="text-xs text-slate-500 mt-0.5">Create offer for candidates</div>
                </div>
              </Link>
            </div>

            {/* For Existing Employees Block */}
            <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><UserPlus size={16} className="-scale-x-100"/></div>
                <h3 className="font-black text-slate-800 text-lg">For Existing Employees</h3>
              </div>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Use for current employees already in Offrd (either converted from a candidate or added using 'Add New Employee').
              </p>
              <div className="space-y-3">
                {[
                  { title: "Onboarding", sub: "Welcome new joiners", icon: <Users size={20}/>, color: "bg-blue-600", path: "/hrm/onboarding" },
                  { title: "View All Attendance", sub: "Check daily attendance for all employees.", icon: <CalendarCheck size={20}/>, color: "bg-teal-600", path: "/hrm/attendance" },
                  { title: "Probation Letter", sub: "Generate probation confirmation letters.", icon: <CheckCircle2 size={20}/>, color: "bg-blue-600", path: "/hrm/emp-documents/probation-letter?type=PROBATION" },
                  { title: "Increment Letter", sub: "Generate increment letters.", icon: <TrendingUp size={20}/>, color: "bg-blue-600", path: "/hrm/emp-documents/increment-letter?type=INCREMENT" },
                  { title: "Separation Letter", sub: "Create separation letters.", icon: <LogOut size={20} className="translate-x-0.5"/>, color: "bg-blue-600", path: "/hrm/emp-documents/exit-letter?type=EXIT" },
                  { title: "Generate Payslip", sub: "Generate and download employee payslips.", icon: <FileText size={20}/>, color: "bg-blue-600", path: "/hrm/payslip" },
                ].map((item, i) => (
                  <Link href={item.path} key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className={clsx("w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform", item.color)}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 leading-tight">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Tasks in Progress & Charts (below employee list) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Tasks in Progress */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <h3 className="font-black text-slate-800 text-[15px]">Tasks in Progress</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">To do list</span>
              </div>
              <div className="space-y-4">
                {(() => {
                  const tasks = candidates.filter(c => c.stage === 'OFFER_ACCEPTED' || c.stage === 'ONBOARDING');
                  if (tasks.length === 0) return <p className="text-sm text-slate-400 py-4 text-center">No pending onboarding tasks.</p>;
                  
                  return tasks.slice(0, 3).map((c, i) => (
                    <div key={c.id || i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.designation || c.position} - {c.stage === 'OFFER_ACCEPTED' ? 'Ready to Onboard' : 'Onboarding in Progress'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">Due {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        <button 
                          onClick={() => handleHire(c.id)}
                          disabled={hiringId === c.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
                        >
                          {hiringId === c.id ? (
                            <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          Mark as done
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Employee Status Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800 text-[15px]">Employee Status</h3>
                <Link href="/hrm/employees" className="text-[10px] font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50">View All</Link>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-slate-500">Total Employees</span>
                <span className="text-2xl font-black text-blue-600">{employees.length}</span>
              </div>
              <div className="h-48 relative my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none" paddingAngle={2}>
                      {pieData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {pieData.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="font-bold text-slate-600">{s.name}</span>
                    </div>
                    <span className="text-slate-500">{s.value} ({Math.round((s.value / Math.max(1, employees.length)) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HR Policy */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800 text-[15px]">HR Policy</h3>
                <Link href="/hrm/policy-generator" className="text-[10px] font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50">View All</Link>
              </div>
              <div className="space-y-0 divide-y divide-slate-100">
                {[
                  { title: "HR Policy Document", sub: "Comprehensive HR document combining multiple policies." },
                  { title: "POSH Policy", sub: "Prevention of Sexual Harassment policy as per Indian law requirements." },
                  { title: "Health and Safety Policy", sub: "Workplace safety protocols and health guidelines." }
                ].map((p, i) => (
                  <div key={i} className="py-3 flex items-center justify-between group cursor-pointer">
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{p.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 max-w-[220px]">{p.sub}</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
