"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { 
  Calendar, Clock, Plus, Trash2, 
  Save, Send, CheckCircle2, AlertCircle, 
  ChevronLeft, ChevronRight, User, 
  Briefcase, Mail, Shield, Building
} from "lucide-react";
import clsx from "clsx";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface TimesheetEntry {
  date: string;
  project: string;
  task: string;
  description: string;
  hours: number;
  breakHours: number;
  overtimeHours: number;
}

const EMPTY_ENTRY = (date: string): TimesheetEntry => {
  const day = new Date(date).getDay();
  const isWeekend = day === 0 || day === 6; // 0=Sun, 6=Sat
  return {
    date,
    project: isWeekend ? "Weekend" : "",
    task: isWeekend ? "Inactive" : "",
    description: isWeekend ? "Weekly Off" : "",
    hours: isWeekend ? 0 : 8,
    breakHours: isWeekend ? 0 : 1,
    overtimeHours: 0
  };
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getWeekRange = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export default function MyTimesheetsPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(() => getWeekRange(new Date()));
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [status, setStatus] = useState<string>("DRAFT");
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState<"MY_TIMESHEETS" | "SUBMIT_NEW">("SUBMIT_NEW");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tsId, setTsId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);

  // Load Employee Profile
  useEffect(() => {
    api.get("/employees/me")
      .then(r => setEmployee(r.data))
      .catch(err => console.error("Profile load failed", err));
  }, []);

  // Load Timesheet for Current Week
  const loadTimesheet = async () => {
    setLoading(true);
    try {
      const start = formatDate(currentWeek.start);
      const res = await api.get(`/timesheets?startDate=${start}&endDate=${formatDate(currentWeek.end)}`);
      
      // Also load all history for the 'My Timesheets' tab
      const histRes = await api.get("/timesheets");
      setHistory(histRes.data);

      if (res.data && res.data.length > 0) {
        const ts = res.data[0];
        setTsId(ts.id);
        setStatus(ts.status);
        setComments(ts.comments || "");
        // Map entries
        if (ts.entries && ts.entries.length > 0) {
          setEntries(ts.entries.map((e: any) => ({
            ...e,
            date: formatDate(new Date(e.date))
          })));
        } else {
          generateDefaultEntries();
        }
      } else {
        setTsId(null);
        setStatus("NEW");
        setComments("");
        generateDefaultEntries();
      }
    } catch (error) {
      console.error("Failed to load timesheet", error);
      generateDefaultEntries();
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultEntries = () => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeek.start);
      d.setDate(d.getDate() + i);
      list.push(EMPTY_ENTRY(formatDate(d)));
    }
    setEntries(list);
  };

  useEffect(() => {
    loadTimesheet();
  }, [currentWeek]);

  // Calculations
  const summary = useMemo(() => {
    const totalHours = entries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
    const totalOvertime = entries.reduce((sum, e) => sum + (Number(e.overtimeHours) || 0), 0);
    const workingDays = entries.filter(e => (Number(e.hours) || 0) > 0).length;
    const missingDays = 7 - workingDays;
    return { totalHours, totalOvertime, workingDays, missingDays };
  }, [entries]);

  const updateEntry = (index: number, key: keyof TimesheetEntry, val: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [key]: val };
    setEntries(newEntries);
  };

  const handleSave = async (submitAfterSave = false) => {
    setSaving(true);
    try {
      const payload = {
        startDate: currentWeek.start,
        endDate: currentWeek.end,
        entries,
        type: "WEEKLY"
      };
      const res = await api.post("/timesheets", payload);
      setTsId(res.data.id);
      setStatus(res.data.status);
      
      if (submitAfterSave) {
        await handleSubmit(res.data.id);
      } else {
        alert("✅ Draft saved successfully!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save timesheet");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (id?: string) => {
    const targetId = id || tsId;
    if (!targetId) return;
    setSubmitting(true);
    try {
      await api.post(`/timesheets/${targetId}/submit`);
      setStatus("SUBMITTED");
      alert("🚀 Timesheet submitted for review!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit timesheet");
    } finally {
      setSubmitting(false);
    }
  };

  const changeWeek = (direction: number) => {
    const newStart = new Date(currentWeek.start);
    newStart.setDate(newStart.getDate() + (direction * 7));
    setCurrentWeek(getWeekRange(newStart));
  };

  const isReadOnly = status === "SUBMITTED" || status === "APPROVED";

  return (
    <AppShell title="Timesheets">
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        
        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-cream-dark/30 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("MY_TIMESHEETS")}
            className={clsx(
              "px-6 py-2.5 rounded-xl font-black text-sm transition-all",
              activeTab === "MY_TIMESHEETS" ? "bg-navy text-white shadow-lg" : "text-slate-400 hover:text-navy"
            )}
          >
            My Timesheets
          </button>
          <button 
            onClick={() => setActiveTab("SUBMIT_NEW")}
            className={clsx(
              "px-6 py-2.5 rounded-xl font-black text-sm transition-all",
              activeTab === "SUBMIT_NEW" ? "bg-navy text-white shadow-lg" : "text-slate-400 hover:text-navy"
            )}
          >
            Submit New
          </button>
        </div>

        {activeTab === "SUBMIT_NEW" ? (
          <>
            {/* Profile Section (Auto-filled) */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-cream-dark flex flex-wrap items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-[28px] bg-navy flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-navy/20">
              {employee?.name?.[0] || "?"}
            </div>
            <div>
              <h2 className="text-2xl font-black text-navy leading-tight">{employee?.name || "Loading..." }</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <Shield size={12} className="text-blue-500" /> {employee?.employeeId}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <Mail size={12} className="text-emerald-500" /> {employee?.email}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Department</p>
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <Building size={14} className="text-slate-400" /> {employee?.department || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Role</p>
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <Briefcase size={14} className="text-slate-400" /> {employee?.designation || "N/A"}
              </div>
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Reporting Manager</p>
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <User size={14} className="text-slate-400" /> {employee?.reportingTo || "Management"}
              </div>
            </div>
          </div>
        </div>

        {/* Timesheet Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-cream-dark shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => changeWeek(-1)}
              className="w-10 h-10 rounded-xl border border-cream-dark flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 hover:text-navy"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center px-4">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Week Period</div>
              <div className="font-bold text-navy">
                {currentWeek.start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {currentWeek.end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <button 
              onClick={() => changeWeek(1)}
              className="w-10 h-10 rounded-xl border border-cream-dark flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 hover:text-navy"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className={clsx(
              "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border",
              status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" :
              status === 'SUBMITTED' ? "bg-blue-50 text-blue-600 border-blue-100" :
              "bg-slate-50 text-slate-400 border-slate-100"
            )}>
              {status === 'NEW' ? 'Not Created' : status}
            </div>
            {!isReadOnly && (
              <>
                <button 
                  onClick={() => handleSave(false)} 
                  disabled={saving || loading}
                  className="btn-ghost !text-blue-600 hover:!bg-blue-50 gap-2 font-black text-xs"
                >
                  <Save size={16} /> Save Draft
                </button>
                <button 
                  onClick={() => handleSave(true)}
                  disabled={submitting || loading}
                  className="btn-primary gap-2 !px-6 shadow-lg shadow-blue-600/20"
                >
                  <Send size={16} /> Submit Week
                </button>
              </>
            )}
          </div>
        </div>

        {/* Entry Table */}
        <div className="bg-white rounded-[40px] border border-cream-dark shadow-sm overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center font-black text-navy">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mr-3" />
              Loading Timesheet...
            </div>
          )}
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-cream-dark">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Date / Day</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project & Task</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description of Work</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24">Hours</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24">Break</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24">OT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark/50">
              {entries.map((entry, idx) => {
                const day = new Date(entry.date).getDay();
                const isWeekend = day === 0 || day === 6;
                const rowDisabled = isReadOnly || isWeekend;
                
                return (
                  <tr key={idx} className={clsx(
                    "hover:bg-slate-50/50 transition-colors", 
                    isReadOnly && "opacity-80",
                    isWeekend && "bg-slate-50/40"
                  )}>
                    <td className="px-6 py-6">
                      <div className={clsx("font-bold", isWeekend ? "text-slate-400" : "text-navy")}>
                        {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className={clsx("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", isWeekend ? "text-slate-300" : "text-blue-500")}>
                        {new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                        {formatDate(new Date()) === entry.date && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white rounded-md text-[8px] tracking-normal">TODAY</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 space-y-2">
                      <input 
                        className={clsx("input !h-9 text-xs !bg-transparent border-slate-100 hover:border-slate-200 focus:bg-white", isWeekend && "text-slate-400")} 
                        placeholder={isWeekend ? "Weekend" : "Project Name"}
                        value={entry.project}
                        onChange={e => updateEntry(idx, 'project', e.target.value)}
                        readOnly={rowDisabled}
                      />
                      <input 
                        className={clsx("input !h-9 text-xs !bg-transparent border-slate-100 hover:border-slate-200 focus:bg-white", isWeekend && "text-slate-400")} 
                        placeholder={isWeekend ? "Off" : "Task / Activity"}
                        value={entry.task}
                        onChange={e => updateEntry(idx, 'task', e.target.value)}
                        readOnly={rowDisabled}
                      />
                    </td>
                    <td className="px-6 py-6">
                      <textarea 
                        className={clsx("input !h-20 text-xs py-2 !bg-transparent border-slate-100 hover:border-slate-200 focus:bg-white resize-none", isWeekend && "text-slate-300")} 
                        placeholder="Details of accomplishments..." 
                        value={entry.description}
                        onChange={e => updateEntry(idx, 'description', e.target.value)}
                        readOnly={rowDisabled}
                      />
                    </td>
                    <td className="px-4 py-6">
                      <input 
                        type="number" 
                        className={clsx(
                          "input text-center !h-12 font-black border-transparent focus:bg-white focus:border-blue-200",
                          isWeekend ? "!bg-transparent text-slate-300" : "!bg-blue-50/30 text-blue-600"
                        )}
                        value={entry.hours}
                        onChange={e => updateEntry(idx, 'hours', parseFloat(e.target.value) || 0)}
                        readOnly={rowDisabled}
                      />
                    </td>
                    <td className="px-4 py-6">
                      <input 
                        type="number" 
                        className="input text-center !h-12 font-bold text-slate-300 !bg-transparent border-slate-100" 
                        value={entry.breakHours}
                        onChange={e => updateEntry(idx, 'breakHours', parseFloat(e.target.value) || 0)}
                        readOnly={rowDisabled}
                      />
                    </td>
                    <td className="px-4 py-6">
                      <input 
                        type="number" 
                        className={clsx(
                          "input text-center !h-12 font-black border-transparent focus:bg-white focus:border-emerald-200",
                          isWeekend ? "!bg-transparent text-slate-200" : "!bg-emerald-50/30 text-emerald-600"
                        )}
                        value={entry.overtimeHours}
                        onChange={e => updateEntry(idx, 'overtimeHours', parseFloat(e.target.value) || 0)}
                        readOnly={isReadOnly} // Allow OT on weekends if needed, or rowDisabled if strict
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary & Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Summary Section */}
          <div className="lg:col-span-2 bg-navy rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-navy/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <Calendar className="text-blue-400" /> Weekly Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Total Hours</p>
                <div className="text-3xl font-black text-blue-400">{summary.totalHours} <span className="text-xs text-white/30 ml-1">HRS</span></div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Total Overtime</p>
                <div className="text-3xl font-black text-emerald-400">{summary.totalOvertime} <span className="text-xs text-white/30 ml-1">HRS</span></div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Working Days</p>
                <div className="text-3xl font-black text-white">{summary.workingDays} <span className="text-xs text-white/30 ml-1">DAYS</span></div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Missing Entries</p>
                <div className={clsx("text-3xl font-black", summary.missingDays > 0 ? "text-amber-400" : "text-white/20")}>
                  {summary.missingDays} <span className="text-xs text-white/30 ml-1">DAYS</span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-3 text-xs text-white/40 italic">
              <AlertCircle size={14} />
              Summary is automatically calculated based on your daily entries above.
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-white rounded-[32px] p-8 border border-cream-dark shadow-sm">
            <h3 className="text-lg font-black text-navy mb-6 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-500" /> Status & Feedback
            </h3>
            
            {status === "APPROVED" ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-600" size={24} />
                  <div>
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Approved</p>
                    <p className="text-[10px] text-emerald-600/70 font-bold">Processed by Management</p>
                  </div>
                </div>
                {comments && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manager Comments</p>
                    <p className="text-sm text-slate-600 italic leading-relaxed">"{comments}"</p>
                  </div>
                )}
              </div>
            ) : status === "REJECTED" ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                  <AlertCircle className="text-red-600" size={24} />
                  <div>
                    <p className="text-xs font-black text-red-700 uppercase tracking-widest">Rejected</p>
                    <p className="text-[10px] text-red-600/70 font-bold">Needs Revision</p>
                  </div>
                </div>
                {comments && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rejection Reason</p>
                    <p className="text-sm text-red-600/70 italic leading-relaxed font-medium">"{comments}"</p>
                  </div>
                )}
                <p className="text-xs text-slate-400 text-center pt-2">Please correct the entries and re-submit.</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <Clock size={40} className="text-slate-200 mb-4" />
                <p className="text-sm text-slate-400 font-bold px-8">
                  {status === 'SUBMITTED' ? 'Waiting for manager approval...' : 'Save your work and submit when complete.'}
                </p>
              </div>
            )}
          </div>

        </div>

        </>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card !bg-blue-600 !text-white !p-7 shadow-xl shadow-blue-600/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Hours Logged</p>
                <div className="text-4xl font-black mt-2">
                  {history.reduce((acc, ts) => acc + (ts.totalHours || 0), 0)} <span className="text-sm opacity-40 ml-1">HRS</span>
                </div>
              </div>
              <div className="card !bg-emerald-500 !text-white !p-7 shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Approved Hours</p>
                <div className="text-4xl font-black mt-2">
                  {history.filter(ts => ts.status === 'APPROVED').reduce((acc, ts) => acc + (ts.totalHours || 0), 0)} <span className="text-sm opacity-40 ml-1">HRS</span>
                </div>
              </div>
              <div className="card !bg-amber-500 !text-white !p-7 shadow-xl shadow-amber-500/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Pending Review</p>
                <div className="text-4xl font-black mt-2">
                  {history.filter(ts => ts.status === 'SUBMITTED').reduce((acc, ts) => acc + (ts.totalHours || 0), 0)} <span className="text-sm opacity-40 ml-1">HRS</span>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="table-wrap">
              <table className="w-full">
                <thead className="table-head">
                  <tr>
                    <th className="th">Week Period</th>
                    <th className="th">Submitted Date</th>
                    <th className="th text-center">Total Hours</th>
                    <th className="th">Status</th>
                    <th className="th">Manager Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan={5} className="td text-center text-slate-400 py-12">No timesheet history found.</td></tr>
                  ) : (
                    history.map(ts => (
                      <tr key={ts.id} className="tr group hover:bg-slate-50">
                        <td className="td font-bold text-navy">
                          {new Date(ts.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(ts.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="td text-xs text-slate-500">
                          {ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                        </td>
                        <td className="td text-center font-black text-blue-600">{ts.totalHours}h</td>
                        <td className="td">
                          <span className={clsx(
                            "badge text-[9px] uppercase font-black tracking-widest px-3 py-1",
                            ts.status === 'APPROVED' ? "badge-green" : ts.status === 'REJECTED' ? "badge-red" : "badge-blue"
                          )}>
                            {ts.status}
                          </span>
                        </td>
                        <td className="td">
                          {ts.comments ? (
                            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                              <AlertCircle size={14} className="text-slate-300" /> "{ts.comments}"
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[10px]">No remarks yet</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .modal-overlay { @apply fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4; }
        .modal-box { @apply bg-white rounded-[40px] shadow-2xl w-full relative overflow-hidden border border-cream-dark; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-in { animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </AppShell>
  );
}
