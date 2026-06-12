"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Plus, Save, Send, Clock, 
  CheckCircle2, AlertCircle, 
  Calendar, History, Edit2,
  ChevronDown, Trash2, MessageSquare
} from "lucide-react";
import clsx from "clsx";
import { getUser } from "@/lib/auth";

const STATUS_COLOR: any = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export default function TimesheetManager({ timesheets, onRefresh }: { timesheets: any[], onRefresh: () => void }) {
  const [view, setView] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    startDate: "",
    endDate: "",
    type: "Daily",
    entries: []
  });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Calculate stats
  const totalHours = timesheets.reduce((sum, ts) => sum + (ts.totalHours || 0), 0);
  const approvedCount = timesheets.filter(ts => ts.status === 'APPROVED').length;
  const pendingCount = timesheets.filter(ts => ts.status === 'SUBMITTED').length;

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
    start.setDate(diff);
    start.setHours(0,0,0,0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday
    end.setHours(23,59,59,999);
    
    return { start, end };
  };

  const startNewTimesheet = () => {
    setForm({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      type: "DAILY",
      entries: []
    });
    setEditingId(null);
    setView("edit");
  };

  const addEntry = (dateStr: string) => {
    if (!dateStr) return;
    
    // Check if date already exists
    if (form.entries.some((e: any) => e.date === dateStr)) {
      alert("This date is already in the list.");
      return;
    }

    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'long' });
    
    const newEntry = {
      date: dateStr,
      project: "",
      task: "",
      hours: 0,
      breakHours: 0,
      overtimeHours: 0,
      description: "",
      status: "Present"
    };

    setForm({
      ...form,
      entries: [...form.entries, newEntry].sort((a, b) => a.date.localeCompare(b.date))
    });
  };

  const removeEntry = (idx: number) => {
    const newEntries = [...form.entries];
    newEntries.splice(idx, 1);
    setForm({ ...form, entries: newEntries });
  };

  const editTimesheet = (ts: any) => {
    setForm({
      startDate: ts.startDate.split('T')[0],
      endDate: ts.endDate.split('T')[0],
      type: ts.type || "DAILY",
      entries: ts.entries.map((e: any) => ({
        ...e,
        date: e.date.split('T')[0]
      }))
    });
    setEditingId(ts.id);
    setView("edit");
  };

  const handleEntryChange = (index: number, field: string, value: any) => {
    const newEntries = [...form.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setForm({ ...form, entries: newEntries });
  };

  const saveDraft = async () => {
    if (form.entries.length === 0) {
      alert("Please add at least one day entry.");
      return;
    }

    setSaving(true);
    try {
      // Calculate start and end dates from entries
      const dates = form.entries.map((e: any) => e.date).sort();
      const payload = {
        ...form,
        startDate: dates[0],
        endDate: dates[dates.length - 1]
      };
      
      await api.post("/timesheets", payload);
      onRefresh();
      setEditingId(null);
      setView("list");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const submitTimesheet = async (id: string | null) => {
    if (form.entries.length === 0) {
      alert("Please add at least one day entry.");
      return;
    }

    setSubmitting(true);
    try {
      const dates = form.entries.map((e: any) => e.date).sort();
      const payload = {
        ...form,
        startDate: dates[0],
        endDate: dates[dates.length - 1]
      };

      // Always save first to ensure changes are persisted
      const res = await api.post("/timesheets", payload);
      const targetId = res.data.id;

      // Then submit
      await api.post(`/timesheets/${targetId}/submit`);
      
      onRefresh();
      setEditingId(null);
      setView("list");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit timesheet");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTimesheet = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/timesheets/${id}`);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  if (view === "edit") {
    const employee = timesheets[0]?.employee || user;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">
            My Timesheets
          </button>
          <button className="px-4 py-2 bg-navy text-white rounded-xl font-bold text-sm shadow-lg shadow-navy/10">
            Submit New
          </button>
        </div>

        {/* Reviewer Feedback Section */}
        {(() => {
          const currentTs = timesheets.find(t => t.id === editingId);
          if (!currentTs?.comments) return null;
          
          const isRejected = currentTs.status === 'REJECTED';
          const isApproved = currentTs.status === 'APPROVED';
          if (!isRejected && !isApproved) return null;

          return (
            <div className={clsx("rounded-2xl p-6 flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300 border", 
              isRejected ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100")}>
              <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", 
                isRejected ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className={clsx("font-bold text-sm", isRejected ? "text-red-800" : "text-emerald-800")}>
                  Reviewer Feedback ({currentTs.status})
                </h4>
                <p className={clsx("text-sm mt-1", isRejected ? "text-red-600" : "text-emerald-600")}>
                  {currentTs.comments}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Employee Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Employee Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name</label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700">{employee?.name || "—"}</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID</label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700">{employee?.employeeId || "—"}</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700">{employee?.email || "—"}</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700">{employee?.department || "—"}</div>
            </div>
          </div>
        </div>

        {/* Timesheet Entry Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Timesheet Entry</h3>
            <div className="flex items-center gap-3">
              <input 
                type="date" 
                id="entry-date-picker"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                onChange={(e) => {
                  addEntry(e.target.value);
                  e.target.value = "";
                }}
              />
              <button 
                onClick={() => document.getElementById('entry-date-picker')?.focus()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all"
              >
                <Plus size={14} /> Add Day Entry
              </button>
            </div>
          </div>
          
          {form.entries.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-400">No entries added yet. Click "Add Day Entry" to start.</p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-slate-100">
              {form.entries.map((entry: any, idx: number) => {
                const d = new Date(entry.date);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const dayName = d.toLocaleDateString('en-IN', { weekday: 'long' });

                return (
                  <div key={idx} className={clsx("pt-6 first:pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300", isWeekend && "opacity-60 grayscale-[0.5]")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">{idx + 1}</span>
                        <h4 className="font-bold text-slate-700">{dayName}, {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</h4>
                      </div>
                      <button onClick={() => removeEntry(idx)} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all">Remove</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Project Name</label>
                        <input 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed" 
                          placeholder="e.g. CRM Revamp" 
                          value={entry.project} 
                          disabled={isWeekend}
                          onChange={e => handleEntryChange(idx, 'project', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Attendance Status</label>
                        <div className="relative">
                          <select 
                            className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                            value={entry.status || "Present"}
                            disabled={isWeekend}
                            onChange={e => handleEntryChange(idx, 'status', e.target.value)}
                          >
                            <option value="Present">Present</option>
                            <option value="Leave">Leave</option>
                            <option value="Company Leave">Company Leave</option>
                            <option value="Absent">Absent</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Task / Activity</label>
                        <input 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed" 
                          placeholder="e.g. UI Design" 
                          value={entry.task} 
                          disabled={isWeekend}
                          onChange={e => handleEntryChange(idx, 'task', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Description of Work</label>
                        <textarea 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[45px] disabled:bg-slate-50 disabled:cursor-not-allowed" 
                          placeholder="Brief description..." 
                          value={entry.description} 
                          disabled={isWeekend}
                          onChange={e => handleEntryChange(idx, 'description', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Hours Worked</label>
                        <input 
                          type="number" 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed" 
                          value={entry.hours} 
                          disabled={isWeekend}
                          onChange={e => handleEntryChange(idx, 'hours', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Break Time (min)</label>
                        <input 
                          type="number" 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed" 
                          value={entry.breakHours} 
                          disabled={isWeekend}
                          onChange={e => handleEntryChange(idx, 'breakHours', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Overtime Hours</label>
                        <input 
                          type="number" 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed" 
                          value={entry.overtimeHours} 
                          disabled={isWeekend}
                          onChange={e => handleEntryChange(idx, 'overtimeHours', e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    {isWeekend && (
                      <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                        <AlertCircle size={12} /> Weekend: Entries Disabled
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submission Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800">Submission Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Timesheet Type</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Submitted Date</label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400">
                {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveDraft} disabled={saving || submitting} className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={() => submitTimesheet(editingId)} disabled={saving || submitting} className="px-8 py-3 bg-navy text-white rounded-xl font-bold text-sm shadow-lg shadow-navy/20 hover:opacity-90 transition-all flex items-center gap-2">
            <Send size={16} /> {submitting ? "Submitting..." : "Submit Timesheet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-navy text-white rounded-xl font-bold text-sm shadow-lg shadow-navy/10">
          My Timesheets
        </button>
        <button onClick={startNewTimesheet} className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">
          Submit New
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-[#F8F9F5] rounded-2xl p-3 sm:p-6 text-center border border-slate-100">
          <div className="text-xl sm:text-3xl font-black text-slate-800">{totalHours}</div>
          <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Total hours</div>
        </div>
        <div className="bg-[#F8F9F5] rounded-2xl p-3 sm:p-6 text-center border border-slate-100">
          <div className="text-xl sm:text-3xl font-black text-slate-800">{approvedCount}</div>
          <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Approved</div>
        </div>
        <div className="bg-[#F8F9F5] rounded-2xl p-3 sm:p-6 text-center border border-slate-100">
          <div className="text-xl sm:text-3xl font-black text-slate-800">{pendingCount}</div>
          <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Pending</div>
        </div>
      </div>

      {/* My Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">My Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">OT</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timesheets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Clock size={32} />
                      <p className="text-sm font-bold">No submissions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (() => {
                  // Flatten and find unique entries by date
                  const allEntries: any[] = [];
                  timesheets.forEach(ts => {
                    ts.entries.forEach((e: any) => {
                      allEntries.push({ 
                        ...e, 
                        status: ts.id === editingId ? 'DRAFT' : ts.status, 
                        tsId: ts.id,
                        comments: ts.comments 
                      });
                    });
                  });

                  // Sort by date desc
                  const sortedEntries = allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  // Filter for unique dates (keep first found, which is newest due to sort)
                  const uniqueEntries: any[] = [];
                  const seenDates = new Set();
                  sortedEntries.forEach(e => {
                    const dateKey = new Date(e.date).toISOString().split('T')[0];
                    if (!seenDates.has(dateKey)) {
                      uniqueEntries.push(e);
                      seenDates.add(dateKey);
                    }
                  });

                  return uniqueEntries.map((entry, idx) => (
                    <tr key={`${entry.tsId}-${idx}`} className="text-sm text-slate-600 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                        {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">{entry.project || "—"}</td>
                      <td className="px-6 py-4">{entry.task || "—"}</td>
                      <td className="px-6 py-4 font-bold">{entry.hours}h</td>
                      <td className="px-6 py-4">{entry.overtimeHours}h</td>
                      <td className="px-6 py-4">
                        <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm", STATUS_COLOR[entry.status])}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(entry.status === 'REJECTED' || entry.status === 'APPROVED') && entry.comments ? (
                          <div className={clsx("flex items-center gap-2 group relative cursor-help", entry.status === 'REJECTED' ? "text-red-500" : "text-emerald-500")}>
                            <MessageSquare size={14} />
                            <span className="text-xs truncate max-w-[100px]">{entry.comments}</span>
                            <div className="absolute bottom-full mb-2 left-0 hidden group-hover:block z-50 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl w-48">
                              {entry.comments}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => {
                              const ts = timesheets.find(t => t.id === entry.tsId);
                              if (ts) editTimesheet(ts);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => deleteTimesheet(entry.tsId)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
