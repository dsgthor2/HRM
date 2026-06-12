"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import {
  Clock, Calendar, CheckCircle2, XCircle, AlertCircle,
  User, Edit2, LogOut, ChevronLeft, ChevronRight,
  Building2, Briefcase, Phone, Mail, Save, X, KeyRound,
  Download, FileText, TrendingUp, DollarSign
} from "lucide-react";
import clsx from "clsx";
import TimesheetManager from "@/components/user/TimesheetManager";
import MyAssets from "@/components/user/MyAssets";
import MyExpenses from "@/components/user/MyExpenses";
import MyGoals from "@/components/user/MyGoals";
import { MonitorSmartphone, CreditCard, Target } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_COLOR: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ABSENT: "bg-red-100 text-red-600 border-red-200",
  LATE: "bg-amber-100 text-amber-700 border-amber-200",
  HALFDAY: "bg-blue-100 text-blue-600 border-blue-200",
  HOLIDAY: "bg-purple-100 text-purple-600 border-purple-200",
  WFH: "bg-teal-100 text-teal-700 border-teal-200",
  "COMPANY_LEAVE": "bg-purple-100 text-purple-700 border-purple-200",
  WEEKEND: "bg-slate-100 text-slate-500 border-slate-200",
};

type Tab = "attendance" | "leaves" | "payslips" | "profile" | "timesheets" | "assets" | "expenses" | "performance";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [tab, setTab] = useState<Tab>("attendance");
  const [employee, setEmployee] = useState<any>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [markingIn, setMarkingIn] = useState(false);
  const [markingOut, setMarkingOut] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [letters, setLetters] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);

  // New features
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [myExpenses, setMyExpenses] = useState<any[]>([]);
  const [myGoals, setMyGoals] = useState<any[]>([]);

  // ... (existing state)



  const loadMyDocs = async () => {
    try {
      const r = await api.get("/auth/my-documents");
      setPayslips(r.data.payslips || []);
      setLetters(r.data.letters || []);
    } catch {}
  };

  // Profile edit
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", department: "", designation: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password change
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Leaves (simple)
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState({ from: "", to: "", type: "CASUAL", reason: "" });
  const [leaveMsg, setLeaveMsg] = useState("");
  const [leaveStatus, setLeaveStatus] = useState<"success" | "error" | "">("");



  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role === "ADMIN") { router.push("/dashboard"); return; }
    setUser(u);
    setMounted(true);
    setProfileForm({ name: u.name || "", phone: "", department: "", designation: "" });
    // We can't call loadMyAttendance yet if we strictly need the user email from state,
    // but loadMyAttendance uses api which probably has the token.
    // However, let's wait for user to be set.
  }, []);

  useEffect(() => {
    if (mounted) {
      loadMyAttendance();
      loadLeaves();
      loadMyDocs();
      loadMyTimesheets();
    }
  }, [mounted, month, year]);

  useEffect(() => {
    if (employee) loadMyData();
  }, [employee]);

  const loadMyData = async () => {
    if (!employee) return;
    try {
      const a = await api.get(`/assets/employee/${employee.id}`);
      setMyAssets(a.data);
      const e = await api.get(`/expenses/employee/${employee.id}`);
      setMyExpenses(e.data);
      const g = await api.get(`/performance/goals/employee/${employee.id}`);
      setMyGoals(g.data);
    } catch {}
  };

  const loadMyAttendance = async () => {
    try {
      const r = await api.get(`/auth/my-attendance?month=${month}&year=${year}`);
      setAttendanceRecords(r.data.records || []);
      setEmployee(r.data.employee);
      // Today's record
      const td = new Date();
      const today = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}-${String(td.getDate()).padStart(2, "0")}`;
      const todayRec = (r.data.records || []).find((rec: any) => {
        const rd = new Date(rec.date);
        const rIso = `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, "0")}-${String(rd.getDate()).padStart(2, "0")}`;
        return rIso === today;
      });
      setTodayRecord(todayRec || null);
      // Summary
      const s: any = {};
      (r.data.records || []).forEach((rec: any) => {
        s[rec.status] = (s[rec.status] || 0) + 1;
      });
      setSummary(s);
    } catch {}
  };

  // Day mark
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markDate, setMarkDate] = useState("");
  const [markForm, setMarkForm] = useState({ checkIn: "09:30", checkOut: "18:30", status: "PRESENT", remarks: "" });
  const [markingDate, setMarkingDate] = useState(false);

  const handleMarkDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarkingDate(true);
    try {
      await api.post("/auth/mark-attendance", { ...markForm, date: markDate });
      setShowMarkModal(false);
      loadMyAttendance();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to mark attendance");
    } finally {
      setMarkingDate(false);
    }
  };

  const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m - 1, 1).getDay();

  const isFuture = (d: number, m: number, y: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(y, m - 1, d);
    return target > today;
  };

  const isToday = (d: number, m: number, y: number) => {
    const today = new Date();
    return today.getDate() === d && (today.getMonth() + 1) === m && today.getFullYear() === y;
  };

  const loadMyTimesheets = async () => {
    try {
      const r = await api.get("/timesheets");
      setTimesheets(r.data || []);
    } catch {}
  };

  const loadLeaves = async () => {
    try {
      const r = await api.get("/leaves/my");
      setLeaves(r.data || []);
    } catch {}
  };

  const handleCheckIn = async () => {
    setMarkingIn(true);
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      await api.post("/auth/mark-attendance", { checkIn: timeStr, status: "PRESENT" });
      await loadMyAttendance();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to mark attendance");
    } finally {
      setMarkingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setMarkingOut(true);
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      await api.post("/auth/mark-attendance", { checkOut: timeStr });
      await loadMyAttendance();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to mark checkout");
    } finally {
      setMarkingOut(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg("");
    try {
      const r = await api.put("/auth/profile", profileForm);
      setProfileMsg("Profile updated successfully!");
      setEditMode(false);
      // Update local user name
      const stored = getUser();
      if (stored) {
        stored.name = r.data.name;
        localStorage.setItem("fg_user", JSON.stringify(stored));
      }
    } catch (e: any) {
      setProfileMsg(e.response?.data?.message || "Failed to update");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(""); setPwError("");
    if (pwForm.newPassword !== pwForm.confirm) { setPwError("Passwords don't match"); return; }
    setPwSaving(true);
    try {
      await api.put("/auth/change-password", { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setPwMsg("Password changed successfully!");
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (e: any) {
      setPwError(e.response?.data?.message || "Failed");
    } finally {
      setPwSaving(false);
    }
  };

  const handleLeaveApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveMsg(""); setLeaveStatus("");
    try {
      await api.post("/leaves/apply", leaveForm);
      setLeaveMsg("Leave application submitted!");
      setLeaveStatus("success");
      setLeaveForm({ from: "", to: "", type: "CASUAL", reason: "" });
      loadLeaves();
    } catch (e: any) {
      setLeaveMsg(e.response?.data?.message || "Failed to apply");
      setLeaveStatus("error");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" /></div>;

  const now = new Date();
  const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const initials = mounted && user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
              <span className="text-white text-lg font-black">F</span>
            </div>
            <div>
              <div className="font-black text-navy text-sm leading-tight">DefenseBlu HRMS</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Employee Portal</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-slate-800 text-sm" suppressHydrationWarning>
                {mounted ? user?.name : ""}
              </div>
              <div className="text-[10px] text-slate-400" suppressHydrationWarning>
                {mounted ? user?.email : ""}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center" suppressHydrationWarning>
              {initials}
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Today banner */}
        <div className="bg-gradient-to-br from-navy to-blue-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Today</p>
              <h2 className="font-black text-xl">{todayStr}</h2>
              {employee && (
                <p className="text-blue-200 text-sm mt-0.5">{employee.designation} · {employee.department}</p>
              )}
              {!employee && (
                <p className="text-yellow-300 text-xs mt-1">⚠ No employee profile linked. Contact admin.</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!todayRecord ? (
                <button
                  onClick={handleCheckIn}
                  disabled={markingIn || !employee}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  <CheckCircle2 size={16} />
                  {markingIn ? "Marking..." : "Check In"}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-emerald-300 text-xs">Checked In</div>
                    <div className="font-black text-white text-lg">{todayRecord.checkIn || "--:--"}</div>
                  </div>
                  {!todayRecord.checkOut && (
                    <button
                      onClick={handleCheckOut}
                      disabled={markingOut}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all"
                    >
                      <Clock size={16} />
                      {markingOut ? "Marking..." : "Check Out"}
                    </button>
                  )}
                  {todayRecord.checkOut && (
                    <div className="text-center">
                      <div className="text-amber-300 text-xs">Checked Out</div>
                      <div className="font-black text-white text-lg">{todayRecord.checkOut}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "attendance", label: "Attendance", icon: <Calendar size={14} /> },
            { id: "leaves", label: "Leaves", icon: <AlertCircle size={15} /> },
            { id: "timesheets", label: "Timesheets", icon: <Clock size={15} /> },
            { id: "assets", label: "Assets", icon: <MonitorSmartphone size={15} /> },
            { id: "expenses", label: "Expenses", icon: <CreditCard size={15} /> },
            { id: "performance", label: "Goals", icon: <Target size={15} /> },
            { id: "payslips", label: "My Documents", icon: <FileText size={15} /> },
            { id: "profile", label: "My Profile", icon: <User size={15} /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)}
              className={clsx("flex-none sm:flex-1 w-[72px] sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0",
                tab === t.id ? "bg-navy text-white shadow-sm" : "text-slate-500 hover:text-navy hover:bg-slate-50"
              )}>
              {t.icon} <span className="hidden sm:inline">{t.label}</span><span className="sm:hidden text-[9px] leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── ATTENDANCE TAB ── */}
        {tab === "attendance" && (
          <div className="space-y-4">
            {/* Month selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <div className="font-black text-navy text-xl">{MONTHS[month - 1]} {year}</div>
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full mt-1 inline-block">
                  {attendanceRecords.length} records this month
                </div>
              </div>
              <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="bg-slate-50 py-2.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                    {d}
                  </div>
                ))}
                {Array.from({ length: getFirstDayOfMonth(month, year) }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white h-20 sm:h-24 opacity-40 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]" />
                ))}
                {Array.from({ length: getDaysInMonth(month, year) }).map((_, i) => {
                  const d = i + 1;
                  const future = isFuture(d, month, year);
                  const today = isToday(d, month, year);
                  const dateIso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const dayOfWeek = new Date(year, month - 1, d).getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const rec = attendanceRecords.find(r => {
                    const rd = new Date(r.date);
                    const rIso = `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, "0")}-${String(rd.getDate()).padStart(2, "0")}`;
                    return rIso === dateIso;
                  });

                  return (
                    <div 
                      key={d} 
                      onClick={() => {
                        if (!future && !isWeekend) {
                          setMarkDate(dateIso);
                          setMarkForm({
                            checkIn: rec?.checkIn || "09:30",
                            checkOut: rec?.checkOut || "18:30",
                            status: rec?.status || "PRESENT",
                            remarks: rec?.remarks || ""
                          });
                          setShowMarkModal(true);
                        }
                      }}
                      className={clsx(
                        "h-12 sm:h-20 md:h-24 p-1 sm:p-2 flex flex-col justify-between transition-all group border-r border-b border-slate-100",
                        isWeekend && "bg-slate-200 cursor-not-allowed",
                        !isWeekend && !future && "bg-white cursor-pointer hover:bg-blue-50/50",
                        !isWeekend && future && "bg-slate-50/30 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className={clsx(
                          "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black",
                          today ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-400"
                        )}>
                          {d}
                        </span>
                        {rec && (
                          <div className={clsx("w-2 h-2 rounded-full", (STATUS_COLOR[rec.status] || "bg-slate-300").split(" ")[0])} />
                        )}
                      </div>
                      
                      {rec ? (
                        <div className="space-y-0.5">
                          <div className={clsx(
                            "text-[8px] font-black uppercase text-center py-0.5 rounded-md",
                            STATUS_COLOR[rec.status] || "bg-slate-100 text-slate-500"
                          )}>
                            {rec.status}
                          </div>
                          {(rec.checkIn || rec.checkOut) && (
                            <div className="text-[7px] text-slate-400 font-mono text-center">
                              {rec.checkIn || "??"}–{rec.checkOut || "??"}
                            </div>
                          )}
                        </div>
                      ) : !future ? (
                        <div className="text-[8px] font-bold text-slate-300 uppercase text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          Mark
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary chips */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.entries(summary).map(([s, c]) => (
                <div key={s} className={clsx("rounded-2xl border p-4 text-center shadow-sm", STATUS_COLOR[s] || "bg-slate-50 border-slate-200 text-slate-600")}>
                  <div className="text-2xl font-black">{c as number}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">{s}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark Attendance Modal */}
        {showMarkModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMarkModal(false)}>
            <div className="modal-box max-w-sm slide-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl">
                <div>
                  <h3 className="font-black text-navy">Mark Attendance</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(markDate).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                </div>
                <button onClick={() => setShowMarkModal(false)} className="btn-icon"><X size={18} /></button>
              </div>
              <form onSubmit={handleMarkDate} className="p-6 space-y-4">
                <div>
                  <label className="label">Status</label>
                  <select className="select" value={markForm.status} onChange={e => setMarkForm(f => ({ ...f, status: e.target.value }))}>
                    {["PRESENT", "ABSENT", "LATE", "HALFDAY", "WFH", "COMPANY_LEAVE"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Check In</label>
                    <input type="time" className="input" value={markForm.checkIn} onChange={e => setMarkForm(f => ({ ...f, checkIn: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Check Out</label>
                    <input type="time" className="input" value={markForm.checkOut} onChange={e => setMarkForm(f => ({ ...f, checkOut: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Remarks</label>
                  <input className="input" placeholder="Optional notes" value={markForm.remarks} onChange={e => setMarkForm(f => ({ ...f, remarks: e.target.value }))} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 py-3" disabled={markingDate}>
                    {markingDate ? "Saving..." : "Save Record"}
                  </button>
                  <button type="button" className="btn-ghost flex-1 py-3" onClick={() => setShowMarkModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── LEAVES TAB ── */}
        {tab === "leaves" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-black text-slate-800 mb-4">Apply for Leave</h3>
              <form onSubmit={handleLeaveApply} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">From Date</label>
                    <input type="date" className="input" required value={leaveForm.from}
                      onChange={e => setLeaveForm(f => ({ ...f, from: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">To Date</label>
                    <input type="date" className="input" required value={leaveForm.to}
                      onChange={e => setLeaveForm(f => ({ ...f, to: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Leave Type</label>
                  <select className="select" value={leaveForm.type} onChange={e => setLeaveForm(f => ({ ...f, type: e.target.value }))}>
                    {["CASUAL", "SICK", "EARNED", "MATERNITY", "PATERNITY", "UNPAID"].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Reason</label>
                  <textarea className="input min-h-[80px]" placeholder="Reason for leave..."
                    value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} />
                </div>
                {leaveMsg && (
                  <div className={clsx("text-sm border rounded-lg px-3 py-2", 
                    leaveStatus === "success" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-red-600 bg-red-50 border-red-200"
                  )}>
                    {leaveMsg}
                  </div>
                )}
                <button type="submit" className="btn-primary w-full">Submit Leave Application</button>
              </form>
            </div>

            {leaves.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-black text-slate-800">My Leave History</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {leaves.map((l: any) => (
                    <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{l.leaveType} Leave</div>
                        <div className="text-xs text-slate-400">{new Date(l.fromDate).toLocaleDateString("en-IN")} – {new Date(l.toDate).toLocaleDateString("en-IN")}</div>
                        {l.reason && <div className="text-xs text-slate-500 mt-0.5">{l.reason}</div>}
                      </div>
                      <span className={clsx("text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border",
                        l.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        l.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-amber-50 text-amber-600 border-amber-200"
                      )}>{l.status || "PENDING"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAYSLIPS TAB ── */}
        {tab === "payslips" && (
          <div className="space-y-6">
            {/* Letters Section */}
            {letters.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-black text-slate-800 text-lg px-1 flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-600" /> Official Letters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {letters.map((l: any) => (
                    <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm capitalize">{l.type.toLowerCase()} Letter</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {new Date(l.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric", day: "numeric" })}
                          </div>
                        </div>
                      </div>
                      {l.pdfUrl && (
                        <button onClick={() => {
                          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://defensebluhrm.info/api").replace("/api", "");
                          window.open(`${baseUrl}${l.pdfUrl}?token=${localStorage.getItem('token')}`, "_blank");
                        }} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <Download size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payslips Section */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-800 text-lg px-1 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" /> Monthly Payslips
              </h3>
              {payslips.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {payslips.map((p: any) => (
                      <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                            <DollarSign size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{p.month} {p.year}</div>
                            <div className="text-xs text-slate-400 font-mono italic">Net: ₹{Number(p.netSalary).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                        {p.pdfUrl && (
                          <button onClick={() => {
                            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://defensebluhrm.info/api").replace("/api", "");
                            window.open(`${baseUrl}${p.pdfUrl}?token=${localStorage.getItem('token')}`, "_blank");
                          }}
                            className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5">
                            <Download size={13} />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <DollarSign size={24} className="text-slate-300" />
                  </div>
                  <h3 className="font-black text-slate-800">No payslips yet</h3>
                  <p className="text-slate-400 text-xs mt-1">Check back later or contact HR.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-navy text-white font-black text-2xl flex items-center justify-center shadow-md">
                    {initials}
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-xl">{user?.name}</div>
                    <div className="text-sm text-slate-400">{user?.email}</div>
                    <div className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">Employee</div>
                  </div>
                </div>
                <button onClick={() => setEditMode(m => !m)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                  {editMode ? <X size={14} /> : <Edit2 size={14} />}
                  {editMode ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Full Name</label>
                      <input className="input" value={profileForm.name}
                        onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input className="input" placeholder="9XXXXXXXXX" value={profileForm.phone}
                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Department</label>
                      <input className="input" placeholder="Your department" value={profileForm.department}
                        onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Designation</label>
                      <input className="input" placeholder="Your role" value={profileForm.designation}
                        onChange={e => setProfileForm(f => ({ ...f, designation: e.target.value }))} />
                    </div>
                  </div>
                  {profileMsg && <div className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{profileMsg}</div>}
                  <button onClick={handleProfileSave} disabled={profileSaving}
                    className="flex items-center gap-2 btn-primary">
                    <Save size={14} /> {profileSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Mail size={14} />, label: "Email", value: user?.email },
                    { icon: <Phone size={14} />, label: "Phone", value: profileForm.phone || employee?.phone || "—" },
                    { icon: <Building2 size={14} />, label: "Department", value: employee?.department || profileForm.department || "—" },
                    { icon: <Briefcase size={14} />, label: "Designation", value: employee?.designation || profileForm.designation || "—" },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="text-slate-400">{f.icon}</div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{f.label}</div>
                        <div className="font-bold text-slate-800 text-sm">{f.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound size={16} className="text-slate-500" />
                <h3 className="font-black text-slate-800">Change Password</h3>
              </div>
              <form onSubmit={handlePwChange} className="space-y-3">
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="input" value={pwForm.oldPassword}
                    onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">New Password</label>
                    <input type="password" className="input" value={pwForm.newPassword}
                      onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Confirm</label>
                    <input type="password" className="input" value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
                  </div>
                </div>
                {pwError && <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</div>}
                {pwMsg && <div className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{pwMsg}</div>}
                <button type="submit" disabled={pwSaving} className="btn-primary">
                  {pwSaving ? "Saving..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === "timesheets" && (
          <TimesheetManager timesheets={timesheets} onRefresh={loadMyTimesheets} />
        )}

        {/* ── ASSETS TAB ── */}
        {tab === "assets" && <MyAssets assets={myAssets} />}

        {/* ── EXPENSES TAB ── */}
        {tab === "expenses" && employee && <MyExpenses expenses={myExpenses} employeeId={employee.id} onRefresh={loadMyData} />}

        {/* ── GOALS TAB ── */}
        {tab === "performance" && <MyGoals goals={myGoals} onRefresh={loadMyData} />}
      </div>
    </div>
  );
}

