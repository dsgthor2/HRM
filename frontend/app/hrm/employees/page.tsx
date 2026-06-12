"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, Suspense, useRef, useState } from "react";
import api from "@/lib/api";
import { Search, Plus, Pencil, Trash2, Eye, X, Upload, Zap, Users, Download, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    "badge-green",
  PROBATION: "badge-yellow",
  INACTIVE:  "badge-gray",
  CONTRACT:  "badge-blue",
  INTERN:    "badge-purple",
};

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const COUNTRIES = [
  "India","United States","United Kingdom","Australia","Canada","Singapore",
  "UAE","Germany","France","Netherlands","Other",
];

const EMPTY = {
  name: "", email: "", phone: "", gender: "", dob: "",
  department: "", designation: "", status: "PROBATION",
  joinDate: "", salary: "", pan: "", aadhaar: "", uan: "", pfNumber: "",
  bankName: "", accountNo: "", ifsc: "",
  // Detailed address
  addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", country: "India",
  workLocation: "",
  // Salary components
  basicPct: "40", hraPct: "20", gratuityPct: "4.8",
  epfEmployer: "12", epfEmployee: "12",
  esiEmployer: "3.25", esiEmployee: "0.75",
};

const QUICK_EMPTY = {
  name: "", email: "", phone: "",
  department: "", designation: "", status: "PROBATION",
  joinDate: new Date().toISOString().split("T")[0],
  salary: "", workLocation: "",
};

// ── Helpers ───────────────────────────────────────────────────────
function initials(name: string) {
  const clean = (name || "").replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, "");
  return clean.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Shared UI ─────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="label">{children}</label>;
}

function Input({ value, onChange, type = "text", placeholder = "", required = false, className = "" }: any) {
  return (
    <input
      className={`input ${className}`}
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
    />
  );
}

// ── Salary breakdown helper ───────────────────────────────────────
function SalaryBreakdown({ salary, basicPct, hraPct, gratuityPct, epfEmployer, epfEmployee, esiEmployer, esiEmployee, ptOverride }: any) {
  if (!salary) return null;
  const monthly = parseFloat(salary);
  const epfEr   = parseFloat(epfEmployer) || 0;
  const esiEr   = parseFloat(esiEmployer) || 0;
  const basic   = monthly * (parseFloat(basicPct) / 100);
  const hra     = basic   * (parseFloat(hraPct)   / 100);
  const gratuity= basic   * (parseFloat(gratuityPct) / 100);
  const totalEmployerContrib = epfEr + esiEr + gratuity;
  const annual  = (monthly + totalEmployerContrib) * 12;

  const epfEmp  = parseFloat(epfEmployee) || 0;
  const esiEmp  = parseFloat(esiEmployee) || 0;
  const ptValue = parseFloat(ptOverride) || 0;
  const netTakeHome = monthly - epfEmp - esiEmp - ptValue;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="mt-4 p-4 bg-cream rounded-xl space-y-3 text-xs">
      <div className="font-bold text-navy text-sm mb-2">Salary Breakdown (Monthly)</div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Basic", fmt(basic)],
          ["HRA", fmt(hra)],
          ["Gratuity (Retiral)", fmt(gratuity)],
          ["Annual CTC", fmt(annual)],
        ].map(([l, v]) => (
          <div key={l} className="bg-white rounded-lg p-2">
            <div className="text-slate-400">{l}</div>
            <div className="font-bold text-navy">{v}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-cream-dark pt-3">
        <div className="font-semibold text-slate-500 mb-2">Deductions</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["EPF (Employee)", fmt(epfEmp)],
            ["EPF (Employer)", fmt(epfEr)],
            ["ESI (Employee)", fmt(esiEmp)],
            ["ESI (Employer)", fmt(esiEr)],
            ["Professional Tax", fmt(ptValue)],
          ].map(([l, v]) => (
            <div key={l} className="bg-white rounded-lg p-2">
              <div className="text-slate-400">{l}</div>
              <div className="font-bold text-red-500">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
        <span className="font-semibold text-emerald-700">Net Take-Home (Est.)</span>
        <span className="font-black text-emerald-700 text-base">{fmt(netTakeHome)}/mo</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   CAREER HISTORY TAB COMPONENT
═══════════════════════════════════════════════════ */
function CareerHistoryTab({ employeeId, employeeName, joinDate }: { employeeId: string; employeeName: string; joinDate?: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ designation: "", department: "", salary: "", remarks: "", effectiveFrom: "", effectiveTo: "", label: "Promotion" });

  const load = async () => {
    try {
      const res = await api.get(`/employees/${employeeId}/career-history`);
      setHistory(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [employeeId]);

  const handleAdd = async () => {
    if (!form.designation || !form.effectiveFrom) { alert("Designation and Date are required!"); return; }
    try {
      await api.post(`/employees/${employeeId}/career-history`, form);
      setForm({ designation: "", department: "", salary: "", remarks: "", effectiveFrom: "", effectiveTo: "", label: "Promotion" });
      setShowForm(false);
      load();
    } catch (e: any) { alert(e.response?.data?.error || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try { await api.delete(`/employees/career-history/${id}`); load(); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-700">Career Timeline</h3>
        <button onClick={() => setShowForm(!showForm)} type="button" className="btn-primary text-xs px-3 py-1.5">+ Add Entry</button>
      </div>
      {showForm && (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Designation *</label><input className="input mt-1" value={form.designation} onChange={e => setForm(f => ({...f, designation: e.target.value}))} placeholder="e.g. Senior Engineer" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Department</label><input className="input mt-1" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} placeholder="e.g. IT" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Salary (Monthly)</label><input className="input mt-1" type="number" value={form.salary} onChange={e => setForm(f => ({...f, salary: e.target.value}))} placeholder="e.g. 50000" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Effective From *</label><input className="input mt-1" type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({...f, effectiveFrom: e.target.value}))} /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Effective To</label><input className="input mt-1" type="date" value={form.effectiveTo} onChange={e => setForm(f => ({...f, effectiveTo: e.target.value}))} /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Type</label><select className="select mt-1" value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))}>{["Joining", "Promotion", "Transfer", "Increment", "Role Change", "Other"].map(l => <option key={l}>{l}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Remarks</label><input className="input mt-1" value={form.remarks} onChange={e => setForm(f => ({...f, remarks: e.target.value}))} placeholder="Optional notes" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} type="button" className="btn-primary text-xs px-4 py-2">Save Entry</button>
            <button onClick={() => setShowForm(false)} type="button" className="btn-ghost text-xs px-4 py-2">Cancel</button>
          </div>
        </div>
      )}
      {loading ? <p className="text-sm text-slate-400">Loading...</p> : history.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm font-semibold text-slate-500 mb-1">No manual entries yet</p>
          <p className="text-xs">Changes to designation, department or salary will auto-appear here.</p>
          <p className="text-xs mt-1 text-slate-400">Or click <strong>+ Add Entry</strong> to add manually.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {history.map((h, i) => {
            const fromDate = new Date(h.effectiveFrom);
            // history is sorted newest first (index 0 = current)
            // "to date" = the effectiveFrom of the previous (newer) entry, or "Present" if index 0
            const today = new Date();
            today.setHours(0,0,0,0);
            const effectiveToDate = h.effectiveTo ? new Date(h.effectiveTo) : null;
            const isPresent = !effectiveToDate || effectiveToDate >= today;
            const toDate = isPresent ? null : effectiveToDate;
            const isOldest = i === history.length - 1;
            const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            // For oldest entry, use joinDate as start if available
            const displayFrom = isOldest && joinDate ? new Date(joinDate) : fromDate;
            const dateRange = `${fmtDate(displayFrom)} - ${toDate ? fmtDate(toDate) : "Present"}`;
            const colors = ["bg-emerald-500", "bg-blue-400", "bg-violet-400", "bg-amber-400", "bg-rose-400"];
            const dotColor = colors[i % colors.length];
            const badgeColors = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"];
            const badge = badgeColors[i % badgeColors.length];
            return (
              <div key={h.id} className="flex gap-3 items-stretch">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-4 shrink-0 ${dotColor}`} />
                  {i < history.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                </div>
                <div className="flex-1 bg-white border border-slate-100 rounded-xl p-3 shadow-sm mb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>{h.label}</span>
                      <p className="font-bold text-slate-800 mt-1">{h.designation || "—"}</p>
                      {h.department && <p className="text-xs text-slate-500">{h.department}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-500">{dateRange}</p>
                      {h.salary > 0 && <p className="text-xs font-bold text-emerald-600 mt-0.5">₹{Number(h.salary).toLocaleString("en-IN")}/mo</p>}
                      <button type="button" onClick={() => handleDelete(h.id)} className="text-red-400 hover:text-red-600 text-[10px] mt-1">Delete</button>
                    </div>
                  </div>
                  {h.remarks && !h.remarks.startsWith("Auto-recorded") && !h.remarks.startsWith("Initial joining") && <p className="text-xs text-slate-400 mt-1 italic">{h.remarks}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ADD / EDIT MODAL (Full form with tabs)
═══════════════════════════════════════════════════ */
function EmployeeModal({
  editEmp, departments, designations, onClose, onSaved,
}: {
  editEmp: any | null;
  departments: any[];
  designations: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>(editEmp ? {
    name: editEmp.name || "", email: editEmp.email || "", phone: editEmp.phone || "",
    gender: editEmp.gender || "", dob: editEmp.dob ? editEmp.dob.split("T")[0] : "",
    department: editEmp.department || "", designation: editEmp.designation || "",
    status: editEmp.status || "PROBATION",
    joinDate: editEmp.joinDate ? editEmp.joinDate.split("T")[0] : "",
    salary: editEmp.salary || "",
    pan: editEmp.pan || "", aadhaar: editEmp.aadhaar || "",
    uan: editEmp.uan || "", pfNumber: editEmp.pfNumber || "",
    bankName: editEmp.bankName || "", accountNo: editEmp.accountNo || "",
    ifsc: editEmp.ifsc || "",
    // address
    addressLine1: editEmp.addressLine1 || "",
    addressLine2: editEmp.addressLine2 || "",
    city: editEmp.city || "",
    state: editEmp.state || "",
    pincode: editEmp.pincode || "",
    country: editEmp.country || "India",
    workLocation: editEmp.workLocation || "",
    // salary components
    basicPct: editEmp.basicPct || "40",
    hraPct: editEmp.hraPct || "20",
    gratuityPct: editEmp.gratuityPct || "4.8",
    epfEmployer: editEmp.epfEmployer ?? "",
    epfEmployee: editEmp.epfEmployee ?? "",
    esiEmployer: editEmp.esiEmployer ?? "",
    esiEmployee: editEmp.esiEmployee ?? "",
    ptOverride: editEmp.ptOverride ?? "",
  } : { ...EMPTY });

  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));
  
  useEffect(() => {
    if (form.status === "INTERN") {
      setForm((f: any) => ({ ...f, epfEmployer: "0", epfEmployee: "0", esiEmployer: "0", esiEmployee: "0", ptOverride: "0" }));
    }
  }, [form.status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editEmp) {
        await api.put(`/employees/${editEmp.id}`, form);
      } else {
        await api.post("/employees", form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving employee");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic",     label: "Basic Info" },
    { id: "address",   label: "Address" },
    { id: "salary",    label: "Salary & Tax" },
    { id: "bank",      label: "Bank Details" },
    { id: "documents", label: "Documents" },
    { id: "career",    label: "Career History" },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-navy">{editEmp ? "Edit Employee" : "Add New Employee"}</h3>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-0 border-b border-cream-dark bg-white overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-[11px] font-semibold rounded-t-lg transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-navy text-white" : "text-slate-500 hover:text-navy"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* ── BASIC INFO ── */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Full Name *</Label>
                  <Input required value={form.name} onChange={(e: any) => set("name", e.target.value)} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input required type="email" value={form.email} onChange={(e: any) => set("email", e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e: any) => set("phone", e.target.value)} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="select" value={form.gender} onChange={e => set("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dob} onChange={(e: any) => set("dob", e.target.value)} />
                </div>
                <div>
                  <Label>Department *</Label>
                  <select className="select" required value={form.department} onChange={e => set("department", e.target.value)}>
                    <option value="">Select</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Designation *</Label>
                  <select className="select" required value={form.designation} onChange={e => set("designation", e.target.value)}>
                    <option value="">Select</option>
                    {designations.map(d => <option key={d.id} value={d.title}>{d.title}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select className="select" value={form.status} onChange={e => set("status", e.target.value)}>
                    {["ACTIVE","PROBATION","CONTRACT","INTERN","INACTIVE"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Joining Date *</Label>
                  <Input required type="date" value={form.joinDate} onChange={(e: any) => set("joinDate", e.target.value)} />
                </div>
                <div>
                  <Label>Work Location</Label>
                  <Input value={form.workLocation} onChange={(e: any) => set("workLocation", e.target.value)} placeholder="Hyderabad" />
                </div>
              </div>
            )}

            {/* ── ADDRESS ── */}
            {activeTab === "address" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Address Line 1</Label>
                  <Input
                    value={form.addressLine1}
                    onChange={(e: any) => set("addressLine1", e.target.value)}
                    placeholder="House / Flat No., Street, Area"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address Line 2 (optional)</Label>
                  <Input
                    value={form.addressLine2}
                    onChange={(e: any) => set("addressLine2", e.target.value)}
                    placeholder="Landmark, Colony, Sector"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e: any) => set("city", e.target.value)}
                    placeholder="Hyderabad"
                  />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={form.pincode}
                    onChange={(e: any) => set("pincode", e.target.value)}
                    placeholder="500001"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <select className="select" value={form.state} onChange={e => set("state", e.target.value)}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Country</Label>
                  <select className="select" value={form.country} onChange={e => set("country", e.target.value)}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Preview card */}
                {(form.addressLine1 || form.city || form.state) && (
                  <div className="col-span-2 mt-1 p-4 bg-cream rounded-xl border border-cream-dark">
                    <div className="text-xs font-semibold text-slate-400 mb-1">Address Preview</div>
                    <div className="text-sm text-navy leading-relaxed">
                      {[form.addressLine1, form.addressLine2].filter(Boolean).join(", ")}
                      {form.city && <><br />{form.city}{form.pincode ? ` - ${form.pincode}` : ""}</>}
                      {form.state && <><br />{form.state}</>}
                      {form.country && <><br />{form.country}</>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SALARY & TAX ── */}
            {activeTab === "salary" && (
              <div className="space-y-5">
                {/* CTC */}
                <div>
                  <Label>Monthly Gross Salary / CTC (₹) *</Label>
                  <Input required type="number" value={form.salary} onChange={(e: any) => set("salary", e.target.value)} placeholder="50000" />
                  {form.salary && (
                    <div className="text-xs text-slate-400 mt-1">
                      Annual CTC: ₹{(parseFloat(form.salary) * 12).toLocaleString("en-IN")}
                    </div>
                  )}
                </div>

                {/* Salary Components */}
                <div className="border border-cream-dark rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-accent rounded-full" />
                    <div className="font-bold text-navy text-sm">Salary Components</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Basic (% of CTC-Monthly)</Label>
                      <Input type="number" value={form.basicPct} onChange={(e: any) => set("basicPct", e.target.value)} placeholder="40" />
                    </div>
                    <div>
                      <Label>HRA (% of Basic-Monthly)</Label>
                      <Input type="number" value={form.hraPct} onChange={(e: any) => set("hraPct", e.target.value)} placeholder="20" />
                    </div>
                    <div>
                      <Label>Gratuity (% of Basic - Retiral)</Label>
                      <Input type="number" value={form.gratuityPct} onChange={(e: any) => set("gratuityPct", e.target.value)} placeholder="4.8" />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-cream-dark rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-red-400 rounded-full" />
                    <div className="font-bold text-navy text-sm">Deductions</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* EPF */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Employee Provident Fund
                        <span className="text-slate-400 font-normal normal-case ml-1">(% of CTC excl. Gratuity, MedIns, HRA)</span>
                      </div>
                      <div>
                        <Label>EPF - Employer (₹)</Label>
                        <Input type="number" value={form.epfEmployer} onChange={(e: any) => set("epfEmployer", e.target.value)} placeholder="1800" />
                      </div>
                      <div>
                        <Label>EPF - Employee (₹)</Label>
                        <Input type="number" value={form.epfEmployee} onChange={(e: any) => set("epfEmployee", e.target.value)} placeholder="1800" />
                      </div>
                    </div>
                    {/* ESI */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Employee State Insurance
                        <span className="text-slate-400 font-normal normal-case ml-1">(% of CTC excl. Gratuity, MedIns, EPF)</span>
                      </div>
                      <div>
                        <Label>ESI - Employer (₹)</Label>
                        <Input type="number" value={form.esiEmployer} onChange={(e: any) => set("esiEmployer", e.target.value)} placeholder="300" />
                      </div>
                      <div>
                        <Label>ESI - Employee (₹)</Label>
                        <Input type="number" value={form.esiEmployee} onChange={(e: any) => set("esiEmployee", e.target.value)} placeholder="70" />
                      </div>
                    </div>
                    {/* PT */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Professional Tax
                      </div>
                      <div>
                        <Label>PT Monthly (₹)</Label>
                        <Input type="number" value={form.ptOverride} onChange={(e: any) => set("ptOverride", e.target.value)} placeholder="200" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <SalaryBreakdown
                  salary={form.salary}
                  basicPct={form.basicPct}
                  hraPct={form.hraPct}
                  gratuityPct={form.gratuityPct}
                  epfEmployer={form.epfEmployer}
                  epfEmployee={form.epfEmployee}
                  esiEmployer={form.esiEmployer}
                  esiEmployee={form.esiEmployee}
                  ptOverride={form.ptOverride}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>PAN Number</Label>
                    <Input className="font-mono" value={form.pan} onChange={(e: any) => set("pan", e.target.value)} placeholder="ABCDE1234F" />
                  </div>
                  <div>
                    <Label>Aadhaar Number</Label>
                    <Input className="font-mono" value={form.aadhaar} onChange={(e: any) => set("aadhaar", e.target.value)} placeholder="XXXX XXXX XXXX" />
                  </div>
                  <div>
                    <Label>UAN Number</Label>
                    <Input className="font-mono" value={form.uan} onChange={(e: any) => set("uan", e.target.value)} placeholder="10XXXXXXXXXX" />
                  </div>
                  <div>
                    <Label>PF Number</Label>
                    <Input className="font-mono" value={form.pfNumber} onChange={(e: any) => set("pfNumber", e.target.value)} placeholder="TN/MAS/0000000/000/0000000" />
                  </div>
                </div>


              </div>
            )}

            {/* ── BANK ── */}
            {activeTab === "bank" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Bank Name</Label>
                  <Input value={form.bankName} onChange={(e: any) => set("bankName", e.target.value)} placeholder="State Bank of India" />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input className="font-mono" value={form.accountNo} onChange={(e: any) => set("accountNo", e.target.value)} />
                </div>
                <div>
                  <Label>IFSC Code</Label>
                  <input className="input font-mono uppercase" value={form.ifsc}
                    onChange={e => set("ifsc", e.target.value.toUpperCase())} />
                </div>
              </div>
            )}

            {/* ── DOCUMENTS ── */}
            {activeTab === "documents" && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">After saving the employee, go to <strong>Documents</strong> section to upload their files.</p>
              </div>
            )}
            {activeTab === "career" && editEmp && (
              <CareerHistoryTab employeeId={editEmp.id} employeeName={editEmp.name} joinDate={editEmp.joinDate} />
            )}
            {activeTab === "career" && !editEmp && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">Save the employee first to add career history.</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? "Saving..." : editEmp ? "Update Employee" : "Add Employee"}
            </button>
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   QUICK ADD MODAL
═══════════════════════════════════════════════════ */
function QuickAddModal({
  departments, designations, onClose, onSaved,
}: {
  departments: any[];
  designations: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>({ ...QUICK_EMPTY });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/employees", form);
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Zap size={14} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-navy">Quick Add Employee</h3>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>
        <p className="px-6 pt-3 text-xs text-slate-400">Enter just the essentials — you can fill other details later by editing.</p>
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input required value={form.name} onChange={(e: any) => set("name", e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input required type="email" value={form.email} onChange={(e: any) => set("email", e.target.value)} placeholder="john@company.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e: any) => set("phone", e.target.value)} placeholder="9XXXXXXXXX" />
              </div>
              <div>
                <Label>Department *</Label>
                <select className="select" required value={form.department} onChange={e => set("department", e.target.value)}>
                  <option value="">Select</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Designation *</Label>
                <select className="select" required value={form.designation} onChange={e => set("designation", e.target.value)}>
                  <option value="">Select</option>
                  {designations.map(d => <option key={d.id} value={d.title}>{d.title}</option>)}
                </select>
              </div>
              <div>
                <Label>Joining Date *</Label>
                <Input required type="date" value={form.joinDate} onChange={(e: any) => set("joinDate", e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <select className="select" value={form.status} onChange={e => set("status", e.target.value)}>
                  {["ACTIVE","PROBATION","CONTRACT","INTERN","INACTIVE"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Salary (₹/mo)</Label>
                <Input type="number" value={form.salary} onChange={(e: any) => set("salary", e.target.value)} placeholder="50000" />
              </div>
              <div>
                <Label>Work Location</Label>
                <Input value={form.workLocation} onChange={(e: any) => set("workLocation", e.target.value)} placeholder="Hyderabad" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all" disabled={loading}>
              {loading ? "Adding..." : "Quick Add →"}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BULK ADD MODAL
═══════════════════════════════════════════════════ */
const CSV_HEADERS = ["name","email","phone","department","designation","status","joinDate","salary","workLocation"];
const SAMPLE_CSV = [
  CSV_HEADERS.join(","),
  "John Smith,john@company.com,9876543210,Engineering,Software Engineer,ACTIVE,2025-01-15,75000,Hyderabad",
  "Priya Rao,priya@company.com,9123456789,HR,HR Executive,PROBATION,2025-03-01,45000,Bangalore",
].join("\n");

function normaliseHeader(h: string): string {
  const map: Record<string, string> = {
    joindate: "joinDate", join_date: "joinDate",
    worklocation: "workLocation", work_location: "workLocation",
    accountno: "accountNo", account_no: "accountNo",
    bankname: "bankName", bank_name: "bankName",
  };
  const lower = h.toLowerCase().replace(/\s+/g, "");
  return map[lower] ?? lower;
}

const VALID_STATUSES = ["ACTIVE","PROBATION","CONTRACT","INTERN","INACTIVE"];

function BulkAddModal({ departments, onClose, onSaved }: { departments: any[]; onClose: () => void; onSaved: () => void; }) {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<any[]>([]);
  const [errors,  setErrors]  = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState<{ success: number; failed: number; failedRows?: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) { setErrors(["CSV must have a header row and at least one data row."]); setPreview([]); return; }
    const rawHeaders = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ""));
    const headers    = rawHeaders.map(normaliseHeader);
    const rows = lines.slice(1).map((line, i) => {
      const vals = parseCSVLine(line);
      const obj: any = {};
      headers.forEach((h, idx) => { obj[h] = (vals[idx] ?? "").replace(/^"|"$/g, "").trim(); });
      if (obj.status) obj.status = obj.status.toUpperCase();
      else obj.status = "PROBATION";
      if (!VALID_STATUSES.includes(obj.status)) obj.status = "PROBATION";
      return { _row: i + 2, ...obj };
    });
    const errs: string[] = [];
    rows.forEach(r => {
      if (!r.name)     errs.push(`Row ${r._row}: name is required`);
      if (!r.email)    errs.push(`Row ${r._row}: email is required`);
      if (!r.joinDate) errs.push(`Row ${r._row}: joinDate is required (YYYY-MM-DD)`);
    });
    setErrors(errs); setPreview(rows);
  };

  const handleTextChange = (v: string) => { setCsvText(v); parseCSV(v); };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const text = ev.target?.result as string; setCsvText(text); parseCSV(text); };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (errors.length || !preview.length) return;
    setLoading(true);
    let success = 0, failed = 0;
    const failedRows: string[] = [];
    for (const row of preview) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _row, ...data } = row;
        await api.post("/employees", data); success++;
      } catch (err: any) {
        failed++;
        failedRows.push(`Row ${row._row} (${row.name}): ${err?.response?.data?.message || "Unknown error"}`);
      }
    }
    setDone({ success, failed, failedRows }); setLoading(false);
    if (success > 0) onSaved();
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "employees_sample.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-3xl slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center"><Users size={14} className="text-blue-600" /></div>
            <h3 className="font-bold text-navy">Bulk Add Employees</h3>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <div className="text-lg font-bold text-navy mb-1">Bulk Import Complete</div>
            <div className="text-sm text-slate-500 mb-4">
              <span className="text-emerald-600 font-semibold">{done.success} added successfully</span>
              {done.failed > 0 && <span className="text-red-500 font-semibold ml-2">{done.failed} failed</span>}
            </div>
            {done.failedRows && done.failedRows.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-700 text-left space-y-1 max-h-36 overflow-y-auto">
                <div className="font-semibold mb-1">Failed rows:</div>
                {done.failedRows.map((r, i) => <div key={i}>⚠ {r}</div>)}
              </div>
            )}
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-800">
              <div className="font-semibold mb-1">CSV Format</div>
              <div className="font-mono text-xs bg-white/70 rounded p-2 mb-2 overflow-x-auto">{CSV_HEADERS.join(", ")}</div>
              <div className="text-xs text-blue-600">
                Required: <strong>name, email, joinDate</strong> — all others optional.
                Dates must be <strong>YYYY-MM-DD</strong>. Status values: <strong>ACTIVE, PROBATION, CONTRACT, INTERN, INACTIVE</strong> (case-insensitive).
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all">
                <Upload size={14} /> Upload CSV
              </button>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <button onClick={downloadSample} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all">
                ↓ Download Sample
              </button>
            </div>
            <div className="mb-4">
              <label className="label">Paste CSV data</label>
              <textarea className="textarea font-mono text-xs h-36" placeholder={SAMPLE_CSV} value={csvText} onChange={e => handleTextChange(e.target.value)} />
            </div>
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-700 space-y-1 max-h-24 overflow-y-auto">
                {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
              </div>
            )}
            {preview.length > 0 && errors.length === 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-500 mb-2">{preview.length} row(s) ready to import</div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>{["#","Name","Email","Department","Designation","Join Date","Status"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-400">{row._row}</td>
                          <td className="px-3 py-2 font-medium text-slate-800">{row.name}</td>
                          <td className="px-3 py-2 text-slate-500">{row.email}</td>
                          <td className="px-3 py-2">{row.department || "—"}</td>
                          <td className="px-3 py-2">{row.designation || "—"}</td>
                          <td className="px-3 py-2">{row.joinDate || "—"}</td>
                          <td className="px-3 py-2"><span className="badge badge-gray">{row.status}</span></td>
                        </tr>
                      ))}
                      {preview.length > 10 && (
                        <tr><td colSpan={7} className="px-3 py-2 text-center text-slate-400 text-xs">...and {preview.length - 10} more</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading || errors.length > 0 || preview.length === 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? `Importing ${preview.length} employees...` : `Import ${preview.length} Employee${preview.length !== 1 ? "s" : ""}`}
              </button>
              <button onClick={onClose} className="btn-ghost">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   VIEW MODAL
═══════════════════════════════════════════════════ */
function ViewModal({ emp, onClose }: { emp: any; onClose: () => void }) {
  // Build formatted address from new fields or fallback to old address field
  const addressParts = [
    emp.addressLine1, emp.addressLine2,
    [emp.city, emp.pincode].filter(Boolean).join(" - "),
    emp.state, emp.country,
  ].filter(Boolean);
  const formattedAddress = addressParts.length > 0 ? addressParts.join(", ") : (emp.address || "—");

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-xl slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-navy">Employee Profile</h3>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-cream-dark">
            <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-white text-2xl font-black">
              {initials(emp.name)}
            </div>
            <div>
              <div className="font-black text-navy text-lg">{emp.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, "")}</div>
              <div className="text-sm text-slate-400">{emp.designation} · {emp.department}</div>
              <div className="flex gap-2 mt-1">
                <span className={`badge ${STATUS_BADGE[emp.status] || "badge-gray"}`}>{emp.status}</span>
                <span className="badge badge-navy font-mono">{emp.employeeId}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Email", emp.email],
              ["Phone", emp.phone || "—"],
              ["Joined", new Date(emp.joinDate).toLocaleDateString("en-IN")],
              ["Salary", `₹${Number(emp.salary).toLocaleString("en-IN")}/mo`],
              ["PAN", emp.pan || "—"],
              ["Bank", emp.bankName || "—"],
              ["Account", emp.accountNo || "—"],
              ["IFSC", emp.ifsc || "—"],
              ["Work Location", emp.workLocation || "—"],
              ["Gender", emp.gender || "—"],
            ].map(([l, v]) => (
              <div key={l} className="bg-cream rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">{l}</div>
                <div className="font-semibold text-navy truncate">{v}</div>
              </div>
            ))}
            {/* Full-width address */}
            <div className="col-span-2 bg-cream rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-0.5">Address</div>
              <div className="font-semibold text-navy text-sm leading-relaxed whitespace-pre-line">
                {[emp.addressLine1, emp.addressLine2].filter(Boolean).join("\n")}
                {(emp.city || emp.pincode) && `\n${[emp.city, emp.pincode].filter(Boolean).join(" - ")}`}
                {emp.state && `\n${emp.state}`}
                {emp.country && `\n${emp.country}`}
                {(!emp.addressLine1 && !emp.city) && (emp.address || "—")}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-lg font-black text-accent">{emp._count?.payslips || 0}</div>
              <div className="text-xs text-slate-400">Payslips</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="text-lg font-black text-emerald-600">{emp._count?.documents || 0}</div>
              <div className="text-xs text-slate-400">Documents</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <div className="text-lg font-black text-amber-600">{emp.letters?.length || 0}</div>
              <div className="text-xs text-slate-400">Letters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
type ModalType = "add" | "edit" | "quick" | "bulk" | "view" | null;

function EmployeesPageInner() {
  const [employees,    setEmployees]    = useState<any[]>([]);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept,   setFilterDept]   = useState("");
  const [departments,  setDepartments]  = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [modal,        setModal]        = useState<ModalType>(null);
  const [editEmp,      setEditEmp]      = useState<any>(null);
  const [viewEmp,      setViewEmp]      = useState<any>(null);

  const searchParams = useSearchParams();

  const load = () => {
    const params = new URLSearchParams();
    if (search)       params.set("search",     search);
    if (filterStatus) params.set("status",     filterStatus);
    if (filterDept)   params.set("department", filterDept);
    api.get(`/employees?${params}`).then(r => setEmployees(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [search, filterStatus, filterDept]);
  useEffect(() => {
    api.get("/company/departments").then(r => setDepartments(r.data)).catch(() => {});
    api.get("/company/designations").then(r => setDesignations(r.data)).catch(() => {});
  }, []);

  const openView  = async (id: string) => {
    try {
      const r = await api.get(`/employees/${id}`);
      setViewEmp(r.data); setModal("view");
    } catch (err) {
      console.error("Failed to load employee details", err);
    }
  };

  useEffect(() => {
    const viewId = searchParams.get("view");
    if (viewId && !modal) {
      openView(viewId);
    }
  }, [searchParams]);

  const openAdd   = () => { setEditEmp(null); setModal("add"); };
  const openQuick = () => setModal("quick");
  const openBulk  = () => setModal("bulk");
  const openEdit  = (emp: any) => { setEditEmp(emp); setModal("edit"); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This will also delete all their records.`)) return;
    try { await api.delete(`/employees/${id}`); load(); }
    catch (err: any) { alert(err.response?.data?.message); }
  };

  const closeModal = () => { setModal(null); setEditEmp(null); setViewEmp(null); };

  const handleSave = () => {
    alert("✅ Data saved successfully!");
  };

  return (
    <AppShell title="Employees">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="page-title">Employee List</h2>
          <p className="page-sub">{employees.length} employees found</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy/90 shadow-md transition-all">
            <Save size={15} /> Save Data
          </button>
          <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add New</button>
          <button onClick={openBulk}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-all">
            <Users size={15} /> Bulk Add
          </button>
          <button onClick={openQuick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-emerald-600 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 transition-all">
            <Zap size={15} /> Quick Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search name, email, ID..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select !w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {["ACTIVE","PROBATION","CONTRACT","INTERN","INACTIVE"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="select !w-auto" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        {(search || filterStatus || filterDept) && (
          <button className="btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterStatus(""); setFilterDept(""); }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="w-full">
          <thead className="table-head">
            <tr>
              <th className="th">Employee</th>
              <th className="th">ID</th>
              <th className="th">Department</th>
              <th className="th">Designation</th>
              <th className="th">Status</th>
              <th className="th">Salary/mo</th>
              <th className="th">Joined</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={8} className="td text-center text-slate-400 py-12">
                No employees found.{" "}
                <button onClick={openAdd} className="text-accent hover:underline">Add one →</button>
              </td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id} className="tr">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(emp.name)}
                    </div>
                    <div>
                      <div className="font-semibold">{emp.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i, "")}</div>
                      <div className="text-xs text-slate-400">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="td"><span className="font-mono text-xs bg-cream px-2 py-0.5 rounded">{emp.employeeId}</span></td>
                <td className="td">{emp.department}</td>
                <td className="td">{emp.designation}</td>
                <td className="td"><span className={`badge ${STATUS_BADGE[emp.status] || "badge-gray"}`}>{emp.status}</span></td>
                <td className="td font-semibold">₹{Number(emp.salary).toLocaleString("en-IN")}</td>
                <td className="td text-xs text-slate-400">{new Date(emp.joinDate).toLocaleDateString("en-IN")}</td>
                <td className="td">
                  <div className="flex gap-1">
                    <button className="btn-icon btn-sm" title="View" onClick={() => openView(emp.id)}><Eye size={14} /></button>
                    <button className="btn-icon btn-sm" title="Edit" onClick={() => openEdit(emp)}><Pencil size={14} /></button>
                    <button className="btn-icon btn-sm text-red-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete" onClick={() => handleDelete(emp.id, emp.name)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {(modal === "add" || modal === "edit") && (
        <EmployeeModal editEmp={editEmp} departments={departments} designations={designations} onClose={closeModal} onSaved={load} />
      )}
      {modal === "quick" && (
        <QuickAddModal departments={departments} designations={designations} onClose={closeModal} onSaved={load} />
      )}
      {modal === "bulk" && (
        <BulkAddModal departments={departments} onClose={closeModal} onSaved={load} />
      )}
      {modal === "view" && viewEmp && (
        <ViewModal emp={viewEmp} onClose={closeModal} />
      )}
    </AppShell>
  );
}

export default function EmployeesPage() {
  return <Suspense fallback={<div>Loading...</div>}><EmployeesPageInner /></Suspense>;
}
