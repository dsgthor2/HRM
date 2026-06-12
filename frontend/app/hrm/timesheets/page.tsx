"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  CheckCircle2, XCircle, Clock, 
  Search, Filter, ChevronRight, 
  MessageSquare, Download, Check,
  Users, Calendar, AlertCircle
} from "lucide-react";
import clsx from "clsx";

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  DRAFT: "bg-slate-100 text-slate-500 border-slate-200"
};

export default function TimesheetManagementPage() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [selectedTs, setSelectedTs] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ status: "APPROVED", comments: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedTs) {
      setReviewForm({ 
        status: selectedTs.status === 'REJECTED' ? 'REJECTED' : 'APPROVED', 
        comments: selectedTs.comments || "" 
      });
    }
  }, [selectedTs]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/timesheets?status=${statusFilter === 'ALL' ? '' : statusFilter}`);
      setTimesheets(r.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTs?.id) {
      alert("No timesheet selected");
      return;
    }
    
    setSubmitting(true);
    console.log("Submitting review for timesheet:", selectedTs.id, reviewForm);
    
    try {
      const response = await api.post(`/timesheets/${selectedTs.id}/review`, reviewForm);
      console.log("Review submission response:", response.data);
      
      alert(`Timesheet ${reviewForm.status.toLowerCase()} successfully!`);
      setSelectedTs(null);
      setReviewForm({ status: "APPROVED", comments: "" });
      await load();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      const msg = error.response?.data?.message || error.message || "Failed to submit review";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkReview = async (status: "APPROVED" | "REJECTED") => {
    if (selectedIds.length === 0) return;
    const comments = window.prompt(`Enter comments for bulk ${status.toLowerCase()}:`);
    if (comments === null) return;

    try {
      await api.post("/timesheets/bulk-review", { ids: selectedIds, status, comments });
      setSelectedIds([]);
      load();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit bulk review");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredTimesheets = timesheets.filter(ts => 
    ts.employee?.name.toLowerCase().includes(search.toLowerCase()) ||
    ts.employee?.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  // Stats calculation
  const stats = {
    pending: timesheets.filter(t => t.status === 'SUBMITTED').length,
    approved: timesheets.filter(t => t.status === 'APPROVED').length,
    rejected: timesheets.filter(t => t.status === 'REJECTED').length,
  };

  return (
    <AppShell title="Timesheet Management">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-navy">Timesheet Management</h2>
            <p className="text-slate-400 text-sm font-medium">Review and approve employee weekly work logs</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => handleBulkReview("APPROVED")} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                  Approve ({selectedIds.length})
                </button>
                <button onClick={() => handleBulkReview("REJECTED")} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-700 transition-all">
                  Reject ({selectedIds.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.pending}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.approved}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved This Period</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.rejected}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejected / Needs Revision</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'SUBMITTED', label: 'Pending Review' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'REJECTED', label: 'Rejected' },
                { id: 'ALL', label: 'All Status' }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={clsx("px-4 py-1.5 rounded-xl text-xs font-bold transition-all border", 
                    statusFilter === f.id ? "bg-navy text-white border-navy shadow-md shadow-navy/10" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-64" 
                placeholder="Search employee name or ID..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-navy focus:ring-navy"
                      checked={selectedIds.length === filteredTimesheets.length && filteredTimesheets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredTimesheets.map(ts => ts.id));
                        else setSelectedIds([]);
                      }}
                    />
                  </th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4 text-center">Hours</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" /></td></tr>
                ) : filteredTimesheets.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">No timesheets found for this filter.</td></tr>
                ) : filteredTimesheets.map(ts => (
                  <tr key={ts.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-navy focus:ring-navy"
                        checked={selectedIds.includes(ts.id)}
                        onChange={() => toggleSelect(ts.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{ts.employee?.name}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ts.employee?.employeeId} · {ts.employee?.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {new Date(ts.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(ts.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-black text-navy">{ts.totalHours}h</div>
                      {ts.totalOvertime > 0 && <div className="text-[10px] text-emerald-600 font-bold">+{ts.totalOvertime}h OT</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", STATUS_BADGE[ts.status])}>
                        {ts.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedTs(ts)}
                        className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-navy hover:text-white hover:border-navy transition-all shadow-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedTs && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedTs(null)}>
          <div className="modal-box max-w-3xl slide-in p-0 overflow-hidden bg-slate-50">
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy text-white font-black text-lg flex items-center justify-center shadow-lg shadow-navy/10">
                  {selectedTs.employee?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-navy">{selectedTs.employee?.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {selectedTs.employee?.employeeId} · Week of {new Date(selectedTs.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedTs(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Detailed Entries */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Project / Task</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Hours</th>
                      <th className="px-4 py-3 text-center">Break</th>
                      <th className="px-4 py-3 text-center">OT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {selectedTs.entries.map((e: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                          <div className="text-[10px] text-slate-400">{new Date(e.date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-700">{e.project || "—"}</div>
                          <div className="text-xs text-slate-500 font-medium mb-1">{e.task}</div>
                          {e.description && (
                            <div className="text-[10px] bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-100 italic">
                               {e.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                           <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold border", 
                             e.status === 'Present' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                             e.status === 'Leave' ? "bg-amber-50 text-amber-600 border-amber-100" :
                             e.status === 'Company Leave' ? "bg-blue-50 text-blue-600 border-blue-100" :
                             "bg-red-50 text-red-600 border-red-100"
                           )}>
                             {e.status || 'Present'}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-navy">{e.hours}h</td>
                        <td className="px-4 py-3 text-center text-slate-400">{e.breakHours}m</td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-600">{e.overtimeHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-100 font-black">
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-right text-[10px] uppercase tracking-widest text-slate-400">Total Hours This Week</td>
                      <td className="px-4 py-4 text-center text-navy text-lg">{selectedTs.totalHours}h</td>
                      <td className="px-4 py-4">—</td>
                      <td className="px-4 py-4 text-center text-emerald-600">{selectedTs.totalOvertime}h</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Review Form */}
              <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-4">Final Decision</h4>
                <form onSubmit={handleReview} className="space-y-4">
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setReviewForm(f => ({ ...f, status: "APPROVED" }))}
                      className={clsx("flex-1 py-3 rounded-xl font-black text-xs tracking-widest transition-all border-2", 
                        reviewForm.status === 'APPROVED' ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200")}
                    >
                      APPROVE
                    </button>
                    <button 
                      type="button"
                      onClick={() => setReviewForm(f => ({ ...f, status: "REJECTED" }))}
                      className={clsx("flex-1 py-3 rounded-xl font-black text-xs tracking-widest transition-all border-2", 
                        reviewForm.status === 'REJECTED' ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200" : "bg-white border-slate-100 text-slate-400 hover:border-red-200")}
                    >
                      REJECT
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Reviewer Comments</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all min-h-[100px]" 
                      placeholder="Add feedback for the employee..."
                      value={reviewForm.comments}
                      onChange={e => setReviewForm(f => ({ ...f, comments: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-navy text-white rounded-xl font-black text-sm shadow-lg shadow-navy/20 hover:opacity-90 transition-all">
                      {submitting ? "Processing..." : "Submit Review Result"}
                    </button>
                    <button type="button" onClick={() => setSelectedTs(null)} className="px-6 py-3 font-bold text-slate-500 hover:text-navy transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
