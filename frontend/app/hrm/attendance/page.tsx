"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, X, Calendar, BarChart2, Download, BarChart3 } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  PRESENT: "badge-green", ABSENT: "badge-red", LATE: "badge-yellow",
  HALFDAY: "badge-blue", HOLIDAY: "badge-gray", WEEKEND: "badge-gray", WFH: "badge-purple"
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportEmp, setReportEmp] = useState("");
  const [reportMonth, setReportMonth] = useState(String(new Date().getMonth() + 1));
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
  const [report, setReport] = useState<any>(null);
  const [form, setForm] = useState({ employeeId: "", status: "PRESENT", checkIn: "09:30", checkOut: "18:30", remarks: "" });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStatuses, setBulkStatuses] = useState<Record<string, string>>({});

  const load = () => {
    api.get(`/attendance?date=${date}`).then(r => setRecords(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [date]);
  useEffect(() => {
    // Fetch ALL employees regardless of status
    api.get("/employees").then(r => {
      setEmployees(r.data);
      const init: Record<string, string> = {};
      r.data.forEach((e: any) => { init[e.id] = "PRESENT"; });
      setBulkStatuses(init);
    }).catch(() => {});
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/attendance", { ...form, date });
    setShowAdd(false);
    load();
  };

  const handleBulkSave = async () => {
    const recs = Object.entries(bulkStatuses).map(([employeeId, status]) => ({
      employeeId, status, checkIn: "09:30", checkOut: "18:30"
    }));
    await api.post("/attendance/bulk", { date, records: recs });
    setBulkMode(false);
    load();
  };

  const loadReport = async (empId?: string, month?: string, year?: string) => {
    const eid = empId || reportEmp;
    const m = month || reportMonth;
    const y = year || reportYear;
    if (!eid) return;
    const r = await api.get(`/attendance/report/${eid}?month=${m}&year=${y}`);
    setReport(r.data);
  };

  // Auto-load report when modal opens with a pre-filled employee (from "View All" row button)
  useEffect(() => {
    if (showReport && reportEmp) {
      loadReport(reportEmp, reportMonth, reportYear);
    }
  }, [showReport, reportEmp]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Count today's summary
  const summary: Record<string, number> = {};
  records.forEach(r => { summary[r.status] = (summary[r.status] || 0) + 1; });

  const displayRecords = employees.map(emp => {
    const record = records.find(r => r.employeeId === emp.id);
    if (record) return record;
    return {
      id: `pending-${emp.id}`,
      employee: emp,
      employeeId: emp.id,
      checkIn: null,
      checkOut: null,
      status: "NOT MARKED",
      remarks: null
    };
  });

  return (
    <AppShell title="Attendance">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="page-sub">Track and manage daily attendance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="date" className="input !w-auto" value={date} onChange={e => setDate(e.target.value)} />
          <button className="btn-ghost" onClick={() => setShowReport(true)}>
            <BarChart2 size={15} /> Monthly Report
          </button>
          <button className="btn-ghost" onClick={() => setBulkMode(true)}>
            <Calendar size={15} /> Bulk Mark
          </button>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Mark Attendance
          </button>
        </div>
      </div>

      {/* Summary chips */}
      {(records.length > 0 || employees.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {Object.entries(summary).map(([s, c]) => (
            <div key={s} className={`badge ${STATUS_BADGE[s] || "badge-gray"} text-xs px-3 py-1`}>
              {s}: {c}
            </div>
          ))}
          <div className="badge badge-navy">Total Employees: {employees.length}</div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table className="w-full">
          <thead className="table-head">
            <tr>
              <th className="th">Employee</th>
              <th className="th">Department</th>
              <th className="th">Emp Status</th>
              <th className="th">Check In</th>
              <th className="th">Check Out</th>
              <th className="th">Attendance</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRecords.length === 0 ? (
              <tr><td colSpan={7} className="td text-center text-slate-400 py-12">
                No employees found.
              </td></tr>
            ) : displayRecords.map(r => (
              <tr key={r.id} className="tr">
                <td className="td">
                  <div className="font-semibold text-navy">{r.employee?.name}</div>
                  <div className="text-[10px] text-slate-400">{r.employee?.designation}</div>
                </td>
                <td className="td text-slate-500 text-sm">{r.employee?.department}</td>
                <td className="td">
                  <span className={`badge text-[10px] ${
                    r.employee?.status === 'ACTIVE' ? 'badge-green' :
                    r.employee?.status === 'PROBATION' ? 'badge-yellow' :
                    r.employee?.status === 'INACTIVE' ? 'badge-red' :
                    'badge-gray'
                  }`}>{r.employee?.status || '—'}</span>
                </td>
                <td className="td text-center font-mono text-xs bg-slate-50/30">{r.checkIn || "—"}</td>
                <td className="td text-center font-mono text-xs bg-slate-50/30">{r.checkOut || "—"}</td>
                <td className="td"><span className={`badge ${STATUS_BADGE[r.status] || "badge-gray border-dashed border-slate-300 text-slate-400"}`}>{r.status}</span></td>
                <td className="td">
                  <button
                    className="btn-sm bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 gap-1 flex items-center"
                    onClick={() => {
                      setReportEmp(r.employeeId);
                      setReportMonth(String(new Date().getMonth() + 1));
                      setReportYear(String(new Date().getFullYear()));
                      setReport(null);
                      setShowReport(true);
                    }}
                  >
                    <BarChart3 size={12} /> View All
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Single Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box max-w-md slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-navy">Mark Attendance</h3>
              <button onClick={() => setShowAdd(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div><label className="label">Employee *</label>
                <select className="select" required value={form.employeeId} onChange={e => set("employeeId", e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select></div>
              <div><label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => set("status", e.target.value)}>
                  {["PRESENT","ABSENT","LATE","HALFDAY","HOLIDAY","WFH"].map(s => <option key={s}>{s}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Check In</label>
                  <input className="input" type="time" value={form.checkIn} onChange={e => set("checkIn", e.target.value)} /></div>
                <div><label className="label">Check Out</label>
                  <input className="input" type="time" value={form.checkOut} onChange={e => set("checkOut", e.target.value)} /></div>
              </div>
              <div><label className="label">Remarks</label>
                <input className="input" value={form.remarks} onChange={e => set("remarks", e.target.value)} placeholder="Optional note" /></div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Mark Modal */}
      {bulkMode && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setBulkMode(false)}>
          <div className="modal-box max-w-2xl slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h3 className="font-bold text-navy">Bulk Mark Attendance</h3>
                <p className="text-xs text-slate-400">{new Date(date).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
              </div>
              <button onClick={() => setBulkMode(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="p-6">
              {/* Quick set all */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 self-center">Mark all as:</span>
                {["PRESENT","ABSENT","HOLIDAY","WFH"].map(s => (
                  <button key={s} className="btn-ghost btn-sm" onClick={() => {
                    const next: Record<string, string> = {};
                    employees.forEach(e => { next[e.id] = s; });
                    setBulkStatuses(next);
                  }}>{s}</button>
                ))}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {employees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-cream rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                        {emp.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{emp.name}</div>
                        <div className="text-xs text-slate-400">{emp.department}</div>
                      </div>
                    </div>
                    <select className="select !w-32" value={bulkStatuses[emp.id] || "PRESENT"}
                      onChange={e => setBulkStatuses(s => ({ ...s, [emp.id]: e.target.value }))}>
                      {["PRESENT","ABSENT","LATE","HALFDAY","HOLIDAY","WFH"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button className="btn-primary flex-1" onClick={handleBulkSave}>Save All Attendance</button>
                <button className="btn-ghost flex-1" onClick={() => setBulkMode(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report Modal */}
      {showReport && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowReport(false)}>
          <div className="modal-box max-w-xl slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-navy">Monthly Attendance Report</h3>
              <button onClick={() => { setShowReport(false); setReport(null); }} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Employee</label>
                  <select className="select" value={reportEmp} onChange={e => { setReportEmp(e.target.value); setReport(null); }}>
                    <option value="">Select</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select></div>
                <div><label className="label">Month</label>
                  <select className="select" value={reportMonth} onChange={e => setReportMonth(e.target.value)}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select></div>
                <div><label className="label">Year</label>
                  <input className="input" type="number" value={reportYear} onChange={e => setReportYear(e.target.value)} /></div>
              </div>
              <div className="flex gap-3">
                <button className="btn-primary flex-1" onClick={() => loadReport()}>View Report</button>
                {report && (
                  <button 
                    className="btn-ghost flex-1 gap-2 border border-slate-200 hover:border-slate-300"
                    onClick={async () => {
                      const r = await api.get(`/attendance/report/${reportEmp}/pdf?month=${reportMonth}&year=${reportYear}`);
                      window.open(`https://hrm-6kly.onrender.com${r.data.pdfUrl}?token=${localStorage.getItem('fg_token')}`, '_blank');
                    }}
                  >
                    Download PDF
                  </button>
                )}
              </div>

              {report && (
                <div className="slide-in">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {Object.entries(report.summary).filter(([, v]) => (v as number) > 0).map(([s, c]) => (
                      <div key={s} className="card-sm text-center">
                        <div className="text-xl font-black text-navy">{c as number}</div>
                        <div className="text-[10px] text-slate-400">{s}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                    {report.records.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between text-xs p-2.5 bg-cream rounded-lg border border-cream-dark">
                        <span className="text-navy font-medium w-24">{new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                        <span className={`badge ${STATUS_BADGE[r.status] || "badge-gray"} text-[10px]`}>{r.status}</span>
                        <span className="text-slate-500 font-mono text-[11px] truncate w-24 text-right">
                          {r.checkIn || "—"} {r.checkIn || r.checkOut ? "–" : ""} {r.checkOut || (r.checkIn ? "—" : "")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
