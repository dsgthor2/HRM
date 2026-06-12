"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, X, UserCheck, Download, Pencil, Eye } from "lucide-react";

const STAGES = ["APPLIED","SCREENING","INTERVIEW","OFFER_SENT","OFFER_ACCEPTED","ONBOARDING","HIRED","REJECTED"];
const STAGE_BADGE: Record<string, string> = {
  APPLIED:"badge-gray", SCREENING:"badge-yellow", INTERVIEW:"badge-blue",
  OFFER_SENT:"badge-navy", OFFER_ACCEPTED:"badge-amber", ONBOARDING:"badge-blue", HIRED:"badge-green", REJECTED:"badge-red"
};
const STAGE_COLORS: Record<string, string> = {
  APPLIED:"border-slate-300", SCREENING:"border-amber-300", INTERVIEW:"border-blue-300",
  OFFER_SENT:"border-navy", OFFER_ACCEPTED:"border-amber-400", ONBOARDING:"border-blue-400", HIRED:"border-emerald-400", REJECTED:"border-red-300"
};

const EMPTY_FORM = { name:"", email:"", phone:"", position:"", department:"", stage:"APPLIED", expectedCTC:"", notes:"", interviewDate:"" };

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filterStage, setFilterStage] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [hiringId, setHiringId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => {
    const p = new URLSearchParams();
    if (filterStage) p.set("stage", filterStage);
    if (search) p.set("search", search);
    api.get(`/candidates?${p}`).then(r => setCandidates(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [filterStage, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      if (data.expectedCTC) data.expectedCTC = parseFloat(data.expectedCTC) || 0;
      
      if (editingId) {
        await api.put(`/candidates/${editingId}`, data);
      } else {
        await api.post("/candidates", data);
      }
      
      setShowAdd(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save candidate");
    } finally { setLoading(false); }
  };

  const startEdit = (c: any) => {
    setForm({
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      position: c.designation || c.position || "",
      department: c.department || "",
      stage: c.stage,
      expectedCTC: c.expectedCTC || "",
      notes: c.notes || "",
      interviewDate: c.interviewDate ? new Date(c.interviewDate).toISOString().split('T')[0] : ""
    });
    setEditingId(c.id);
    setShowAdd(true);
  };

  const moveStage = async (id: string, stage: string) => {
    await api.put(`/candidates/${id}/stage`, { stage });
    load();
  };

  const hire = async (id: string) => {
    if (!confirm("Convert this candidate to an employee?")) return;
    setHiringId(id);
    try {
      const res = await api.post(`/candidates/${id}/hire`);
      alert(`✅ Employee created! ID: ${res.data.employee.employeeId}`);
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Hiring failed";
      alert(`❌ ${msg}`);
    } finally { setHiringId(null); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this candidate?")) return;
    await api.delete(`/candidates/${id}`);
    load();
  };

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = candidates.filter(c => c.stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  const displayList = filterStage 
    ? candidates 
    : candidates.filter(c => c.stage !== "HIRED" && c.stage !== "REJECTED");

  return (
    <AppShell title="Candidates">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="page-title">Recruitment Pipeline</h2>
          <p className="page-sub">{displayList.length} active candidates total</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy/90 shadow-md transition-all" 
            onClick={() => { setForm({...EMPTY_FORM}); setEditingId(null); setShowAdd(true); }}>
            <Plus size={16} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button onClick={() => setFilterStage("")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${!filterStage ? "border-navy bg-navy text-white" : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"}`}>
          All Active
        </button>
        {STAGES.map(s => (
          <button key={s} onClick={() => setFilterStage(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 whitespace-nowrap flex items-center gap-2 ${filterStage === s ? "border-navy bg-navy text-white" : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"}`}>
            {s.replace("_"," ")}
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterStage === s ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
              {stageCounts[s] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 px-4 py-3">
          <input className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-300" 
            placeholder="Search candidates by name, email or position..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Candidate</th>
              <th className="th">Position</th>
              <th className="th">Department</th>
              <th className="th">Expected CTC</th>
              <th className="th">Status</th>
              <th className="th">Workflow</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayList.length === 0 ? (
              <tr><td colSpan={7} className="td text-center py-10 text-slate-400">No candidates found</td></tr>
            ) : displayList.map(c => (
              <tr key={c.id} className="tr">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-sm">
                      {c.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, "")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{c.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, "")}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="td">{c.position}</td>
                <td className="td text-slate-500">{c.department || "—"}</td>
                <td className="td">{c.expectedCTC ? `₹${Number(c.expectedCTC).toLocaleString("en-IN")}` : "—"}</td>
                <td className="td"><span className={`badge ${STAGE_BADGE[c.stage]}`}>{c.stage.replace("_"," ")}</span></td>
                <td className="td">
                  <select className="select !w-32 text-xs" value={c.stage}
                    onChange={e => moveStage(c.id, e.target.value)}>
                    {STAGES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                  </select>
                </td>
                <td className="td">
                  <div className="flex gap-1">
                    {["OFFER_SENT", "OFFER_ACCEPTED", "ONBOARDING"].includes(c.stage) && (
                      <button onClick={() => hire(c.id)} disabled={hiringId === c.id}
                        className="btn-success btn-sm flex items-center gap-1" title="Convert to Employee">
                        <UserCheck size={13} /> Hire
                      </button>
                    )}
                    <button onClick={() => startEdit(c)}
                      className="btn-icon text-emerald-400 hover:bg-emerald-50" title="Preview Candidate">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => startEdit(c)}
                      className="btn-icon text-blue-400 hover:bg-blue-50" title="Edit Details">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => del(c.id)}
                      className="btn-icon text-red-400 hover:bg-red-50" title="Delete">
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box max-w-lg slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-navy">{editingId ? "Edit Candidate" : "Add Candidate"}</h3>
              <button onClick={() => setShowAdd(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="label">Full Name *</label>
                  <input className="input" required value={form.name} onChange={e => set("name", e.target.value)} /></div>
                <div><label className="label">Email *</label>
                  <input className="input" type="email" required value={form.email} onChange={e => set("email", e.target.value)} /></div>
                <div><label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
                <div><label className="label">Position Applied *</label>
                  <input className="input" required value={form.position} onChange={e => set("position", e.target.value)} /></div>
                <div><label className="label">Department</label>
                  <input className="input" value={form.department} onChange={e => set("department", e.target.value)} /></div>
                <div><label className="label">Expected CTC (₹/year)</label>
                  <input className="input" type="number" value={form.expectedCTC} onChange={e => set("expectedCTC", e.target.value)} /></div>
                <div><label className="label">Interview Date</label>
                  <input className="input" type="date" value={form.interviewDate} onChange={e => set("interviewDate", e.target.value)} /></div>
                <div><label className="label">Current Stage</label>
                  <select className="select" value={form.stage} onChange={e => set("stage", e.target.value)}>
                    {STAGES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                  </select></div>
                <div className="col-span-2"><label className="label">Notes</label>
                  <textarea className="textarea" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? "Saving..." : (editingId ? "Update Candidate" : "Add Candidate")}
                </button>
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
              {editingId && (
                 <p className="text-[10px] text-slate-400 text-center italic">
                   Updating these details will allow you to fix conflicting emails before hiring.
                 </p>
              )}
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
