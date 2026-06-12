"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, CheckCircle, XCircle, X } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-yellow", APPROVED: "badge-green", REJECTED: "badge-red"
};

const LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Casual Leave", "Maternity Leave", "Paternity Leave", "LOP (Loss of Pay)", "Comp Off", "Other"];

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: "", leaveType: "Annual Leave", fromDate: "", toDate: "", reason: "" });
  const [loading, setLoading] = useState(false);

  const load = () => {
    const params = filterStatus ? `?status=${filterStatus}` : "";
    api.get(`/leaves${params}`).then(r => setLeaves(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [filterStatus]);
  useEffect(() => { api.get("/employees").then(r => setEmployees(r.data)).catch(() => {}); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const days = Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000) + 1;
      await api.post("/leaves", { ...form, days });
      setShowAdd(false);
      setForm({ employeeId: "", leaveType: "Annual Leave", fromDate: "", toDate: "", reason: "" });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    await api.put(`/leaves/${id}/approve`);
    load();
  };

  const reject = async (id: string) => {
    if (!confirm("Reject this leave?")) return;
    await api.put(`/leaves/${id}/reject`);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this leave record?")) return;
    await api.delete(`/leaves/${id}`);
    load();
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const pending = leaves.filter(l => l.status === "PENDING").length;
  const approved = leaves.filter(l => l.status === "APPROVED").length;

  return (
    <AppShell title="Leave Management">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="page-title">Leave Management</h2>
          <p className="page-sub">Manage and approve employee leave requests</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Leave
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Pending Approvals", val: pending, color: "bg-amber-50", tc: "text-amber-700" },
          { label: "Approved", val: approved, color: "bg-emerald-50", tc: "text-emerald-700" },
          { label: "Total Records", val: leaves.length, color: "bg-blue-50", tc: "text-accent" },
        ].map(c => (
          <div key={c.label} className="card">
            <div className={`text-2xl font-black ${c.tc}`}>{c.val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card mb-4 flex gap-3">
        <select className="select !w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option>PENDING</option><option>APPROVED</option><option>REJECTED</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="w-full">
          <thead className="table-head">
            <tr>
              <th className="th">Employee</th>
              <th className="th">Leave Type</th>
              <th className="th">From</th>
              <th className="th">To</th>
              <th className="th">Days</th>
              <th className="th">Reason</th>
              <th className="th">Status</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan={8} className="td text-center text-slate-400 py-10">No leave records</td></tr>
            ) : leaves.map(l => (
              <tr key={l.id} className="tr">
                <td className="td">
                  <div className="font-semibold">{l.employee?.name}</div>
                  <div className="text-xs text-slate-400">{l.employee?.department}</div>
                </td>
                <td className="td"><span className="badge badge-blue">{l.leaveType}</span></td>
                <td className="td text-xs">{new Date(l.fromDate).toLocaleDateString("en-IN")}</td>
                <td className="td text-xs">{new Date(l.toDate).toLocaleDateString("en-IN")}</td>
                <td className="td font-bold">{l.days}</td>
                <td className="td text-xs text-slate-500 max-w-[140px] truncate">{l.reason || "—"}</td>
                <td className="td"><span className={`badge ${STATUS_BADGE[l.status]}`}>{l.status}</span></td>
                <td className="td">
                  <div className="flex gap-1">
                    {l.status === "PENDING" && (
                      <>
                        <button onClick={() => approve(l.id)}
                          className="btn-icon text-emerald-600 hover:bg-emerald-50" title="Approve">
                          <CheckCircle size={15} />
                        </button>
                        <button onClick={() => reject(l.id)}
                          className="btn-icon text-red-500 hover:bg-red-50" title="Reject">
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                    {l.status === "APPROVED" && (
                      <button onClick={() => reject(l.id)}
                        className="btn-icon text-red-500 hover:bg-red-50" title="Revoke & Reject">
                        <XCircle size={15} />
                      </button>
                    )}
                    <button onClick={() => del(l.id)}
                      className="btn-icon text-red-400 hover:bg-red-50">
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box max-w-md slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-navy">Add Leave Request</h3>
              <button onClick={() => setShowAdd(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div><label className="label">Employee *</label>
                <select className="select" required value={form.employeeId} onChange={e => set("employeeId", e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select></div>
              <div><label className="label">Leave Type *</label>
                <select className="select" value={form.leaveType} onChange={e => set("leaveType", e.target.value)}>
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">From Date *</label>
                  <input className="input" type="date" required value={form.fromDate} onChange={e => set("fromDate", e.target.value)} /></div>
                <div><label className="label">To Date *</label>
                  <input className="input" type="date" required value={form.toDate} onChange={e => set("toDate", e.target.value)} /></div>
              </div>
              {form.fromDate && form.toDate && (
                <div className="text-xs font-semibold text-accent p-2 bg-blue-50 rounded-lg">
                  Duration: {Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000) + 1} day(s)
                </div>
              )}
              <div><label className="label">Reason</label>
                <textarea className="textarea" rows={3} value={form.reason} onChange={e => set("reason", e.target.value)} placeholder="Reason for leave..." /></div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? "Saving..." : "Submit Leave"}</button>
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
