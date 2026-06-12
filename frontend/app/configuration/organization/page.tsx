"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Pencil, Trash2, Plus, X, ChevronLeft, Check, FileText, Building2, MapPin, Users, Briefcase, Calculator } from "lucide-react";

const TABS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "departments", label: "Departments", icon: Users },
  { id: "designations", label: "Designation", icon: Briefcase },
  { id: "professionaltax", label: "Professional Tax", icon: Calculator },
  { id: "lettertemplates", label: "Letter Templates", icon: FileText },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
];

function resolveLogoUrl(raw?: string): string {
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://defensebluhrm.info/api";
  const base = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${path}`;
}

// ── Modal ────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────────
function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 font-semibold text-slate-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-4 py-10 text-center text-slate-400 text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><FileText size={18} className="text-slate-300" /></div>
                No records found
              </div>
            </td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
              {row.map((cell, j) => <td key={j} className="px-4 py-3 text-slate-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionBtns({ onEdit, onDelete }: { onEdit: () => void; onDelete?: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={onEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"><Pencil size={11} /> Edit</button>
      {onDelete && <button onClick={onDelete} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"><Trash2 size={11} /> Delete</button>}
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 bg-blue-500 rounded-full" />
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-3 flex gap-2 items-center">
      {page > 1 && <button onClick={() => onPageChange(page - 1)} className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-semibold rounded hover:bg-slate-50">«</button>}
      <span className="px-4 py-1.5 border border-blue-500 text-blue-600 text-xs font-semibold rounded">Page {page} of {totalPages}</span>
      {page < totalPages && <button onClick={() => onPageChange(page + 1)} className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-semibold rounded hover:bg-slate-50">»</button>}
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all";
const selectCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition-all";

function ModalFooter({ onCancel, onSave, saving, saveLabel = "Save" }: { onCancel: () => void; onSave: () => void; saving: boolean; saveLabel?: string }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
      <button onClick={onCancel} className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
      <button onClick={onSave} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">{saving ? "Saving..." : saveLabel}</button>
    </div>
  );
}

// ── COMPANY ──────────────────────────────────────────────────────
function CompanyTab() {
  const [company, setCompany] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [secondaryEmails, setSecondaryEmails] = useState<string[]>([]);
  const [newSecondaryEmail, setNewSecondaryEmail] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseSecondaryEmails = (raw: any): string[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw) { try { return JSON.parse(raw); } catch {} }
    return [];
  };

  useEffect(() => {
    api.get("/company").then(r => {
      setCompany(r.data); setEditData(r.data);
      setSecondaryEmails(parseSecondaryEmails(r.data.secondaryEmails));
    }).catch(console.error);
  }, []);

  const addSecondaryEmail = () => {
    const email = newSecondaryEmail.trim();
    if (!email || !email.includes("@")) return alert("Enter a valid email");
    if (secondaryEmails.includes(email)) return alert("Email already added");
    setSecondaryEmails(prev => [...prev, email]);
    setNewSecondaryEmail("");
  };

  const save = async () => {
    setSaving(true);
    try {
      let logoUrl = editData.logoUrl;
      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        try { const up = await api.post("/company/upload-logo", fd); logoUrl = up.data.logoUrl; } catch {}
      }
      const payload: any = {
        name: editData.name, email: editData.email, companyType: editData.companyType,
        pincode: editData.pincode, city: editData.city, state: editData.state,
        address: editData.address, description: editData.description,
        logoUrl, secondaryEmails: JSON.stringify(secondaryEmails),
      };
      const res = await api.put("/company", payload);
      const updatedCompany = { ...res.data, logoUrl };
      setCompany(updatedCompany); setEditData(updatedCompany);
      setSecondaryEmails(parseSecondaryEmails(res.data.secondaryEmails));
      setEditMode(false); setLogoFile(null); setLogoPreview("");
      // ✅ FIX: Dispatch with resolved URL so sidebar gets full URL immediately
      window.dispatchEvent(new CustomEvent("company-updated", { detail: { ...updatedCompany, logoUrl } }));
    } catch (e: any) { alert("Save failed: " + (e?.response?.data?.message || e.message)); }
    finally { setSaving(false); }
  };

  const cancel = () => { setEditData(company); setSecondaryEmails(parseSecondaryEmails(company?.secondaryEmails)); setLogoFile(null); setLogoPreview(""); setEditMode(false); };
  const set = (k: string, v: string) => setEditData((c: any) => ({ ...c, [k]: v }));

  if (!company) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
        Loading company data...
      </div>
    </div>
  );

  const logoDisplayUrl = logoPreview || resolveLogoUrl(company.logoUrl);
  const viewSecondary = parseSecondaryEmails(company.secondaryEmails);

  const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-start py-3 border-b border-slate-100 last:border-0">
      <span className="w-52 text-sm text-slate-500 font-medium shrink-0">{label}</span>
      <span className="text-sm text-slate-800 flex-1">{children}</span>
    </div>
  );

  if (!editMode) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-3xl shadow-sm">
      <SectionTitle title="Company Information"
        action={<button onClick={() => { setEditData(company); setEditMode(true); }} className="px-4 py-2 rounded-full border border-blue-500 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors">Edit Details</button>}
      />
      <div className="flex items-start py-3 border-b border-slate-100">
        <span className="w-52 text-sm text-slate-500 font-medium shrink-0">Company Logo</span>
        {logoDisplayUrl ? (
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-3 w-36 bg-blue-50/30">
            <img src={logoDisplayUrl} alt="logo" className="w-full h-auto object-contain max-h-16" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 text-slate-400 text-xs bg-slate-50">No logo uploaded</div>
        )}
      </div>
      <InfoRow label="Company Name">{company.name || <span className="text-slate-400 italic">Not Specified</span>}</InfoRow>
      <InfoRow label="Email ID">{company.email || <span className="text-slate-400 italic">Not Specified</span>}</InfoRow>
      {viewSecondary.length > 0 && <InfoRow label="Secondary Email"><div className="flex flex-col gap-1">{viewSecondary.map((e: string) => <span key={e}>{e}</span>)}</div></InfoRow>}
      <InfoRow label="Company Type">{company.companyType || <span className="text-slate-400 italic">Not Specified</span>}</InfoRow>
      <InfoRow label="Pin Code">{company.pincode || <span className="text-slate-400 italic">Not Specified</span>}</InfoRow>
      <InfoRow label="City">{company.city || <span className="text-slate-400 italic">Not Specified</span>}</InfoRow>
      <InfoRow label="State">{company.state || <span className="text-slate-400 italic">Not Specified</span>}</InfoRow>
      <InfoRow label="Company Address Line">{company.address || <span className="text-slate-400 italic">Not Specified</span>}</InfoRow>
      <InfoRow label="Company Description">{company.description || <span className="text-slate-400 italic">Not Specified</span>}</InfoRow>
    </div>
  );

  const editLogoPreviewUrl = logoPreview || resolveLogoUrl(editData.logoUrl);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-3xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><div className="w-1 h-7 bg-blue-500 rounded-full" /><h3 className="font-bold text-slate-800 text-lg">Edit Company Details</h3></div>
        <button onClick={cancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <label className="w-full md:w-52 text-sm text-slate-700 font-medium shrink-0">Company Logo:</label>
        <div className="flex gap-2 flex-1 w-full">
          <input className="flex-1 min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-slate-50" readOnly value={logoFile ? logoFile.name : (editData.logoUrl || "")} placeholder="No file chosen" />
          <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }} />
          <button onClick={() => fileRef.current?.click()} className="px-4 md:px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 whitespace-nowrap transition-colors">Browse</button>
        </div>
      </div>
      {editLogoPreviewUrl && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <span className="hidden md:block w-52 shrink-0" />
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-3 w-28 bg-blue-50/30">
            <img src={editLogoPreviewUrl} alt="preview" className="w-full h-auto object-contain max-h-14" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
        <label className="w-full md:w-52 text-sm text-slate-700 font-medium shrink-0">Company Name: <span className="text-red-500">*</span></label>
        <input className={inputCls} value={editData.name || ""} onChange={e => set("name", e.target.value)} />
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
        <label className="w-full md:w-52 text-sm text-slate-700 font-medium shrink-0">Email ID: <span className="text-red-500">*</span></label>
        <input className={inputCls} type="email" value={editData.email || ""} onChange={e => set("email", e.target.value)} />
      </div>
      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3 mb-4">
        <label className="w-full md:w-52 text-sm text-slate-700 font-medium shrink-0 md:pt-2">Secondary Email</label>
        <div className="flex-1 flex flex-col gap-2 w-full min-w-0">
          {secondaryEmails.map(email => (
            <div key={email} className="flex items-center gap-2 w-full">
              <span className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 overflow-hidden text-ellipsis">{email}</span>
              <button onClick={() => setSecondaryEmails(p => p.filter(e => e !== email))} className="w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 shrink-0 transition-colors"><X size={13} /></button>
            </div>
          ))}
          <div className="flex items-center gap-2 w-full">
            <input className={`${inputCls} flex-1 min-w-0`} type="email" placeholder="Add secondary email" value={newSecondaryEmail} onChange={e => setNewSecondaryEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && addSecondaryEmail()} />
            <button onClick={addSecondaryEmail} className="px-4 py-2 shrink-0 rounded-full border border-blue-500 text-blue-600 text-sm font-semibold hover:bg-blue-50 whitespace-nowrap transition-colors">Add</button>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
        <label className="w-full md:w-52 text-sm text-slate-700 font-medium shrink-0">Industry Type:</label>
        <select className={selectCls} value={editData.companyType || ""} onChange={e => set("companyType", e.target.value)}>
          <option value="">Select...</option>
          {["Human Resources / HR","Information Technology","Finance","Manufacturing","Healthcare","Education","Other"].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      {[{label:"Pin Code:",key:"pincode"},{label:"City:",key:"city"},{label:"State:",key:"state"},{label:"Registered Company Address:",key:"address"}].map(({label,key})=>(
        <div key={key} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
          <label className="w-full md:w-52 text-sm text-slate-700 font-medium shrink-0">{label} <span className="text-red-500">*</span></label>
          <input className={inputCls} value={editData[key]||""} onChange={e=>set(key,e.target.value)} />
        </div>
      ))}
      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3 mb-4">
        <label className="w-full md:w-52 text-sm text-slate-700 font-medium shrink-0 md:pt-2">Description:</label>
        <textarea className={inputCls + " resize-y w-full"} rows={4} placeholder="Add company description here" value={editData.description||""} onChange={e=>set("description",e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button onClick={cancel} className="px-6 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
        <button onClick={save} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">{saving?"Saving...":"Save"}</button>
      </div>
    </div>
  );
}

// ── LOCATIONS ────────────────────────────────────────────────────
function LocationsTab() {
  const [locations, setLocations] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ country: "India", state: "", city: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  useEffect(() => { api.get("/company/locations").then(r => setLocations(Array.isArray(r.data)?r.data:[])).catch(()=>setLocations([])); }, []);
  const openAdd = () => { setEditId(null); setForm({ country: "India", state: "", city: "" }); setModal(true); };
  const openEdit = (l: any) => { setEditId(l.id); setForm({ country: l.country||"India", state: l.state, city: l.city }); setModal(true); };
  const save = async () => {
    if (!form.state || !form.city.trim()) return alert("Please fill State and City");
    setSaving(true);
    try {
      if (editId) { const r = await api.put(`/company/locations/${editId}`, form); setLocations(ls => ls.map(l => l.id === editId ? r.data : l)); }
      else { const r = await api.post("/company/locations", form); setLocations(ls => [...ls, r.data]); }
      setModal(false);
    } catch(e:any){ alert("Error: "+(e?.response?.data?.message||e.message)); }
    finally { setSaving(false); }
  };
  const del = async (id: string) => {
    if(!confirm("Delete this location?")) return;
    try { await api.delete(`/company/locations/${id}`); setLocations(ls=>ls.filter(l=>l.id!==id)); }
    catch(e:any){ alert("Delete failed: "+(e?.response?.data?.message||e.message)); }
  };
  const paged = locations.slice((page-1)*PER_PAGE, page*PER_PAGE);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-4xl shadow-sm">
      <SectionTitle title="Locations" action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm"><Plus size={15}/>Add Location</button>}/>
      <DataTable headers={["Sl. No","State","City","Actions"]} rows={paged.map((l,i) => [(page-1)*PER_PAGE+i+1, l.state, l.city, <ActionBtns key={l.id} onEdit={() => openEdit(l)} onDelete={() => del(l.id)} />])}/>
      <Pagination page={page} totalPages={Math.ceil(locations.length/PER_PAGE)} onPageChange={setPage} />
      {modal && (
        <Modal title={editId ? "Edit Location" : "Add Location"} onClose={() => setModal(false)}>
          <FormField label="Country" required><select className={selectCls} value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))}><option value="India">India</option></select></FormField>
          <FormField label="State" required><select className={selectCls} value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}><option value="">Select State</option>{INDIAN_STATES.map(s=><option key={s}>{s}</option>)}</select></FormField>
          <FormField label="City" required><input className={inputCls} placeholder="Enter city" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&save()} autoFocus /></FormField>
          <ModalFooter onCancel={() => setModal(false)} onSave={save} saving={saving} saveLabel={editId ? "Update" : "Add"} />
        </Modal>
      )}
    </div>
  );
}

// ── DEPARTMENTS ──────────────────────────────────────────────────
function DepartmentsTab() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  useEffect(()=>{ api.get("/company/departments").then(r=>setDepartments(Array.isArray(r.data)?r.data:[])).catch(()=>setDepartments([])); },[]);
  const openAdd = () => { setEditId(null); setInput(""); setModal(true); };
  const openEdit = (d: any) => { setEditId(d.id); setInput(d.name); setModal(true); };
  const save = async () => {
    if (!input.trim()) return alert("Enter department name");
    setSaving(true);
    try {
      if (editId) { const r = await api.put(`/company/departments/${editId}`, { name: input }); setDepartments(ds => ds.map(d => d.id === editId ? r.data : d)); }
      else { const r = await api.post("/company/departments", { name: input }); setDepartments(ds => [...ds, r.data]); }
      setModal(false);
    } catch(e:any){ alert("Error: "+(e?.response?.data?.message||e.message)); }
    finally { setSaving(false); }
  };
  const del = async(id:string)=>{ if(!confirm("Delete this department?")) return; try { await api.delete(`/company/departments/${id}`); setDepartments(ds=>ds.filter(d=>d.id!==id)); } catch(e:any){ alert("Delete failed: "+(e?.response?.data?.message||e.message)); } };
  const paged = departments.slice((page-1)*PER_PAGE, page*PER_PAGE);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-3xl shadow-sm">
      <SectionTitle title="Departments" action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm"><Plus size={15}/>Add Department</button>}/>
      <DataTable headers={["Sl. No","Department","Actions"]} rows={paged.map((d,i) => [(page-1)*PER_PAGE+i+1, d.name, <ActionBtns key={d.id} onEdit={() => openEdit(d)} onDelete={() => del(d.id)} />])}/>
      <Pagination page={page} totalPages={Math.ceil(departments.length/PER_PAGE)} onPageChange={setPage} />
      {modal && (
        <Modal title={editId ? "Edit Department" : "Add Department"} onClose={() => setModal(false)}>
          <FormField label="Department Name" required><input className={inputCls} placeholder="Enter department name" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} autoFocus /></FormField>
          <ModalFooter onCancel={() => setModal(false)} onSave={save} saving={saving} saveLabel={editId ? "Update" : "Add"} />
        </Modal>
      )}
    </div>
  );
}

// ── DESIGNATIONS ─────────────────────────────────────────────────
function DesignationsTab() {
  const [designations, setDesignations] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  useEffect(()=>{ api.get("/company/designations").then(r=>setDesignations(Array.isArray(r.data)?r.data:[])).catch(()=>setDesignations([])); },[]);
  const openAdd = () => { setEditId(null); setInput(""); setModal(true); };
  const openEdit = (d: any) => { setEditId(d.id); setInput(d.title); setModal(true); };
  const save = async () => {
    if (!input.trim()) return alert("Enter designation");
    setSaving(true);
    try {
      if (editId) { const r = await api.put(`/company/designations/${editId}`, { title: input }); setDesignations(ds => ds.map(d => d.id === editId ? r.data : d)); }
      else { const r = await api.post("/company/designations", { title: input }); setDesignations(ds => [...ds, r.data]); }
      setModal(false);
    } catch(e:any){ alert("Error: "+(e?.response?.data?.message||e.message)); }
    finally { setSaving(false); }
  };
  const del = async(id:string, title:string)=>{
    if(!confirm(`Delete designation "${title}"?\n\nIf any employees have this designation, it will be cleared from their profile first.`)) return;
    try {
      try { await api.patch("/hrm/employees/bulk-clear-designation", { designation: title }); } catch {}
      await api.delete(`/company/designations/${id}`);
      setDesignations(ds=>ds.filter(d=>d.id!==id));
    } catch(e:any){ alert("Delete failed: " + (e?.response?.data?.message || e.message || "")); }
  };
  const paged = designations.slice((page-1)*PER_PAGE, page*PER_PAGE);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-3xl shadow-sm">
      <SectionTitle title="Designations" action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm"><Plus size={15}/>Add Designation</button>}/>
      <DataTable headers={["Sl. No","Designation","Actions"]} rows={paged.map((d,i) => [(page-1)*PER_PAGE+i+1, d.title, <ActionBtns key={d.id} onEdit={() => openEdit(d)} onDelete={() => del(d.id, d.title)} />])}/>
      <Pagination page={page} totalPages={Math.ceil(designations.length/PER_PAGE)} onPageChange={setPage} />
      {modal && (
        <Modal title={editId ? "Edit Designation" : "Add Designation"} onClose={() => setModal(false)}>
          <FormField label="Designation Title" required><input className={inputCls} placeholder="Enter designation" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} autoFocus /></FormField>
          <ModalFooter onCancel={() => setModal(false)} onSave={save} saving={saving} saveLabel={editId ? "Update" : "Add"} />
        </Modal>
      )}
    </div>
  );
}

// ── PROFESSIONAL TAX ─────────────────────────────────────────────
function ProfessionalTaxTab() {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({payMin:"",payMax:"",deduction:"",state:""});
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [filterState, setFilterState] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  useEffect(()=>{ api.get("/company/professional-tax").then(r=>setTaxes(Array.isArray(r.data)?r.data:[])).catch(()=>setTaxes([])); },[]);
  const openAdd = () => { setEditId(null); setForm({payMin:"",payMax:"",deduction:"",state:""}); setModal(true); };
  const openEdit = (t: any) => { setEditId(t.id); setForm({payMin:String(t.payMin),payMax:String(t.payMax),deduction:String(t.deduction),state:t.state}); setModal(true); };
  const save = async () => {
    if (!form.payMin||!form.payMax||!form.deduction||!form.state) return alert("Fill all fields");
    setSaving(true);
    try {
      const payload = {payMin:Number(form.payMin),payMax:Number(form.payMax),deduction:Number(form.deduction),state:form.state};
      if (editId) { const r = await api.put(`/company/professional-tax/${editId}`, payload); setTaxes(ts => ts.map(t => t.id === editId ? r.data : t)); }
      else { const r = await api.post("/company/professional-tax", payload); setTaxes(ts => [...ts, r.data]); }
      setModal(false);
    } catch(e:any){ alert("Error: "+(e?.response?.data?.message||e.message)); }
    finally { setSaving(false); }
  };
  const del = async(id:string)=>{ if(!confirm("Delete this tax entry?")) return; try { await api.delete(`/company/professional-tax/${id}`); setTaxes(ts=>ts.filter(t=>t.id!==id)); } catch(e:any){ alert("Delete failed: "+(e?.response?.data?.message||e.message)); } };
  const filtered = filterState ? taxes.filter(t=>t.state===filterState) : taxes;
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-5xl shadow-sm">
      <SectionTitle title="Professional Tax" action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm"><Plus size={15}/>Add Entry</button>}/>
      <div className="mb-4">
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 transition-all" value={filterState} onChange={e=>{setFilterState(e.target.value);setPage(1);}}>
          <option value="">All States</option>
          {INDIAN_STATES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
            {["Sl. No","Salary Range","Monthly Deduction","State","Actions"].map(h=><th key={h} className="text-left px-4 py-3 font-semibold text-slate-700">{h}</th>)}
          </tr></thead>
          <tbody>
            {paged.length===0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No records found</td></tr>
              : paged.map((t,i) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3">{(page-1)*PER_PAGE+i+1}</td>
                  <td className="px-4 py-3">₹{t.payMin} – ₹{t.payMax}</td>
                  <td className="px-4 py-3">₹{Number(t.deduction).toFixed(2)}</td>
                  <td className="px-4 py-3">{t.state}</td>
                  <td className="px-4 py-3"><ActionBtns onEdit={() => openEdit(t)} onDelete={() => del(t.id)} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={Math.ceil(filtered.length/PER_PAGE)} onPageChange={setPage} />
      {modal && (
        <Modal title={editId ? "Edit Professional Tax" : "Add Professional Tax"} onClose={() => setModal(false)}>
          <FormField label="State" required><select className={selectCls} value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}><option value="">Select State</option>{INDIAN_STATES.map(s=><option key={s}>{s}</option>)}</select></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Min Salary (₹)" required><input type="number" className={inputCls} placeholder="0" value={form.payMin} onChange={e=>setForm(f=>({...f,payMin:e.target.value}))} /></FormField>
            <FormField label="Max Salary (₹)" required><input type="number" className={inputCls} placeholder="0" value={form.payMax} onChange={e=>setForm(f=>({...f,payMax:e.target.value}))} /></FormField>
          </div>
          <FormField label="Monthly Deduction (₹)" required><input type="number" className={inputCls} placeholder="0" value={form.deduction} onChange={e=>setForm(f=>({...f,deduction:e.target.value}))} /></FormField>
          <ModalFooter onCancel={() => setModal(false)} onSave={save} saving={saving} saveLabel={editId ? "Update" : "Add"} />
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LETTER TEMPLATES
   ✅ FIX 1: Only show sections that were selected in wizard
   ✅ FIX 2: Individual delete button per section (in edit form)
   ✅ FIX 3: Overall delete button per template row
═══════════════════════════════════════════════════ */
const LETTER_TYPES = ["Offer Letter", "Probation Letter", "Increment Letter", "Exit Letter"];
const LETTER_TYPE_MAP: Record<string, string> = {
  "Offer Letter": "OFFER",
  "Probation Letter": "PROBATION",
  "Increment Letter": "INCREMENT",
  "Exit Letter": "EXPERIENCE",
};

const TERMS_SUBCLAUSES = [
  "Offered Designation", "Date of join", "Reporting and Responsibilities",
  "Compensation details", "Working hours", "Responsibilities",
  "Non - disclosure obligations and intellectual property", "Confidentiality",
  "Company property", "Notice of Change", "Termination", "Exclusivity / Prior Commitment",
  "Non-Compete / Non-Solicit", "Notices", "Jurisdiction", "Terms and conditions",
];

// ── Rich Editor ──────────────────────────────────────────────────
function RichEditor({ value, onChange, placeholder, minHeight = 220 }: { value: string; onChange: (v: string) => void; placeholder?: string; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInit = useRef(false);
  useEffect(() => { if (ref.current && !isInit.current) { ref.current.innerHTML = value || ""; isInit.current = true; } }, []);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || ""; }, [value]);
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); ref.current?.focus(); };
  const ToolBtn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" title={title} onMouseDown={e => { e.preventDefault(); onClick(); }} className="px-2 py-1 rounded text-sm text-slate-600 hover:bg-slate-200 transition-colors">{children}</button>
  );
  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <ToolBtn onClick={() => exec("undo")} title="Undo">↩</ToolBtn>
        <ToolBtn onClick={() => exec("redo")} title="Redo">↪</ToolBtn>
        <div className="w-px bg-slate-300 mx-1" />
        <ToolBtn onClick={() => exec("bold")} title="Bold"><strong>B</strong></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic"><em>I</em></ToolBtn>
        <div className="w-px bg-slate-300 mx-1" />
        <ToolBtn onClick={() => exec("justifyLeft")} title="Left">≡</ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Center">☰</ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Right">≣</ToolBtn>
        <ToolBtn onClick={() => exec("justifyFull")} title="Justify">▤</ToolBtn>
        <div className="w-px bg-slate-300 mx-1" />
        <ToolBtn onClick={() => exec("outdent")} title="Outdent">⇤</ToolBtn>
        <ToolBtn onClick={() => exec("indent")} title="Indent">⇥</ToolBtn>
        <div className="w-px bg-slate-300 mx-1" />
        <ToolBtn onClick={() => exec("insertOrderedList")} title="Ordered">1≡</ToolBtn>
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet">•≡</ToolBtn>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning data-placeholder={placeholder}
        onInput={() => onChange(ref.current?.innerHTML || "")}
        style={{ minHeight }}
        className="px-4 py-3 text-sm text-slate-800 outline-none leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400" />
    </div>
  );
}

// ✅ FIX: CollapsibleSection — null = deleted, string = present (shown)
interface CollapsibleSectionProps {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  onDelete: () => void;
  placeholder?: string;
}

function CollapsibleSection({ label, value, onChange, onDelete, placeholder }: CollapsibleSectionProps) {
  if (value === null) {
    return (
      <div className="flex items-start gap-4 mb-5">
        <label className="w-56 text-sm text-slate-600 font-medium shrink-0 pt-2">{label}</label>
        <button onClick={() => onChange("")}
          className="flex items-center gap-2 px-5 py-1.5 border border-dashed border-blue-300 rounded-lg text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all">
          <Plus size={13} /> Add Section
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-4 mb-5">
      <label className="w-56 text-sm text-slate-700 font-medium shrink-0 pt-2">{label}</label>
      <div className="flex-1">
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
            <button type="button" onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 text-xs font-semibold rounded-full transition-colors border border-red-100">
              <Trash2 size={11} /> Delete Section
            </button>
          </div>
          <RichEditor value={value} onChange={onChange} placeholder={placeholder} minHeight={160} />
        </div>
      </div>
    </div>
  );
}

type TemplateForm = {
  name: string; type: string; content: string;
  annexure1: string | null;
  annexure2: string | null;
  compensationNotes: string | null;
  isDefault: boolean;
};

const EMPTY_FORM: TemplateForm = { name: "", type: "OFFER", content: "", annexure1: null, annexure2: null, compensationNotes: null, isDefault: false };

function CustomCheckbox({ checked, onChange, indeterminate = false }: { checked: boolean; onChange: (v: boolean) => void; indeterminate?: boolean }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0 ${checked ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 hover:border-blue-400"}`}>
      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      {!checked && indeterminate && <div className="w-2 h-0.5 bg-blue-400 rounded" />}
    </button>
  );
}

// ── Terms Selection Step ─────────────────────────────────────────
interface TermsSelectionProps {
  useTerms: boolean; setUseTerms: (v: boolean) => void;
  selectedSubclauses: string[]; setSelectedSubclauses: (v: string[]) => void;
  useAnnexure1: boolean; setUseAnnexure1: (v: boolean) => void;
  useAnnexure2: boolean; setUseAnnexure2: (v: boolean) => void;
  useCompNotes: boolean; setUseCompNotes: (v: boolean) => void;
  onBack: () => void; onContinue: () => void;
}

function TermsSelectionStep({ useTerms, setUseTerms, selectedSubclauses, setSelectedSubclauses, useAnnexure1, setUseAnnexure1, useAnnexure2, setUseAnnexure2, useCompNotes, setUseCompNotes, onBack, onContinue }: TermsSelectionProps) {
  const toggleSubclause = (clause: string) => setSelectedSubclauses(selectedSubclauses.includes(clause) ? selectedSubclauses.filter(c => c !== clause) : [...selectedSubclauses, clause]);
  const handleTermsToggle = (checked: boolean) => { setUseTerms(checked); if (checked) setSelectedSubclauses([...TERMS_SUBCLAUSES]); else setSelectedSubclauses([]); };
  const handleAnnexuresToggle = (checked: boolean) => { setUseAnnexure1(checked); setUseAnnexure2(checked); };
  const allSubSelected = selectedSubclauses.length === TERMS_SUBCLAUSES.length;
  const someSubSelected = selectedSubclauses.length > 0 && !allSubSelected;
  const bothAnnexures = useAnnexure1 && useAnnexure2;
  const someAnnexures = (useAnnexure1 || useAnnexure2) && !bothAnnexures;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-6 py-5">
      <p className="text-sm text-slate-600 mb-5">Select sections to include in your letter template. You can customize each section after continuing.</p>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <CustomCheckbox checked={allSubSelected} indeterminate={someSubSelected} onChange={handleTermsToggle} />
          <span className="text-sm font-semibold text-slate-800 cursor-pointer select-none" onClick={() => handleTermsToggle(!useTerms)}>Terms</span>
        </div>
        {useTerms && (
          <div className="ml-8 flex flex-col gap-2.5 mb-4 border-l-2 border-blue-100 pl-4">
            {TERMS_SUBCLAUSES.map(clause => (
              <label key={clause} className="flex items-center gap-3 cursor-pointer select-none group">
                <CustomCheckbox checked={selectedSubclauses.includes(clause)} onChange={() => toggleSubclause(clause)} />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{clause}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <CustomCheckbox checked={bothAnnexures} indeterminate={someAnnexures} onChange={handleAnnexuresToggle} />
          <span className="text-sm font-semibold text-slate-800 cursor-pointer select-none" onClick={() => handleAnnexuresToggle(!bothAnnexures)}>Annexures</span>
        </div>
        <div className="ml-8 flex flex-col gap-2.5 border-l-2 border-blue-100 pl-4">
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <CustomCheckbox checked={useAnnexure1} onChange={v => setUseAnnexure1(v)} />
            <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">Annexure 1 — Intellectual Property</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <CustomCheckbox checked={useAnnexure2} onChange={v => setUseAnnexure2(v)} />
            <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">Annexure 2 — Confidential Information</span>
          </label>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <CustomCheckbox checked={useCompNotes} onChange={setUseCompNotes} />
          <span className="text-sm font-semibold text-slate-800 cursor-pointer select-none" onClick={() => setUseCompNotes(!useCompNotes)}>Compensation Notes</span>
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"><ChevronLeft size={15} /> Back</button>
        <button onClick={onContinue} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Continue</button>
      </div>
    </div>
  );
}

// ── Shared Letter Edit Form ──────────────────────────────────────
function LetterEditForm({ title, form, setForm, saving, onCancel, onBack, onSave }: {
  title: string; form: TemplateForm; setForm: React.Dispatch<React.SetStateAction<TemplateForm>>;
  saving: boolean; onCancel: () => void; onBack?: () => void; onSave: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-4xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3"><div className="w-1 h-7 bg-blue-500 rounded-full" /><h3 className="font-bold text-slate-800 text-lg">{title}</h3></div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
      </div>
      <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
        <strong>Hint:</strong> To add numbering (1, 2, 3) to each clause, prefix each clause with &apos;<strong>-SNo-</strong>&apos;.
      </div>
      <div className="flex items-center gap-4 mb-5">
        <label className="w-56 text-sm text-slate-700 font-medium shrink-0">Offer Type: <span className="text-red-500">*</span></label>
        <input className={inputCls} placeholder="e.g. Default, Default-Internship, Contract To Hire…" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="flex items-center gap-4 mb-5">
        <label className="w-56 text-sm text-slate-700 font-medium shrink-0">Letter Type:</label>
        <select className={selectCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {Object.entries(LETTER_TYPE_MAP).map(([label, val]) => <option key={val} value={val}>{label}</option>)}
        </select>
      </div>
      {/* Terms — always shown */}
      <div className="flex items-start gap-4 mb-5">
        <label className="w-56 text-sm text-slate-700 font-medium shrink-0 pt-2">Terms: <span className="text-red-500">*</span></label>
        <div className="flex-1">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Terms & Conditions</span>
            </div>
            <RichEditor value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} placeholder="Enter the terms and conditions for this letter…" minHeight={260} />
          </div>
        </div>
      </div>
      {/* ✅ FIX: Each section only shows if not null. Delete sets to null. */}
      <CollapsibleSection label="Annexure 1: Intellectual Property" value={form.annexure1}
        onChange={v => setForm(f => ({ ...f, annexure1: v }))} onDelete={() => setForm(f => ({ ...f, annexure1: null }))}
        placeholder="Enter Annexure I — Intellectual Property content…"/>
      <CollapsibleSection label="Annexure 2: Confidential Information" value={form.annexure2}
        onChange={v => setForm(f => ({ ...f, annexure2: v }))} onDelete={() => setForm(f => ({ ...f, annexure2: null }))}
        placeholder="Enter Annexure II — Confidential Information content…"/>
      <CollapsibleSection label="Compensation Notes" value={form.compensationNotes}
        onChange={v => setForm(f => ({ ...f, compensationNotes: v }))} onDelete={() => setForm(f => ({ ...f, compensationNotes: null }))}
        placeholder="Enter compensation notes…"/>
      <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-4">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
          Set as Default
        </label>
        <div className="flex gap-3">
          {onBack && <button onClick={onBack} className="flex items-center gap-2 px-5 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"><ChevronLeft size={15} /> Back</button>}
          <button onClick={onCancel} className="px-6 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">{saving ? "Saving..." : "Save As"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Customize Wizard ─────────────────────────────────────────────
type CustomizeStep = "choose" | "edit";

function CustomizeWizard({ letterType, templates, onCancel, onComplete }: { letterType: string; templates: any[]; onCancel: () => void; onComplete: (form: TemplateForm) => void }) {
  const [step, setStep] = useState<CustomizeStep>("choose");
  const [useTerms, setUseTerms] = useState(false);
  const [selectedSubclauses, setSelectedSubclauses] = useState<string[]>([]);
  const [useAnnexure1, setUseAnnexure1] = useState(false);
  const [useAnnexure2, setUseAnnexure2] = useState(false);
  const [useCompNotes, setUseCompNotes] = useState(false);
  const seed = templates.find(t => t.type === letterType);
  const [form, setForm] = useState<TemplateForm>({ ...EMPTY_FORM, type: letterType });
  const [saving, setSaving] = useState(false);

  const handleContinue = () => {
    let termsContent = "";
    if (useTerms && selectedSubclauses.length > 0) {
      termsContent = seed?.content || selectedSubclauses.map(clause => `<p><strong>${clause}</strong></p><p>-SNo- [Enter ${clause} details here]</p>`).join("");
    }
    setForm(f => ({
      ...f,
      content: termsContent,
      // ✅ FIX: Only set non-null for sections the user selected
      annexure1: useAnnexure1 ? (seed?.annexure1 ?? "") : null,
      annexure2: useAnnexure2 ? (seed?.annexure2 ?? "") : null,
      compensationNotes: useCompNotes ? (seed?.compensationNotes ?? "") : null,
    }));
    setStep("edit");
  };

  if (step === "choose") {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6"><div className="w-1 h-7 bg-blue-500 rounded-full" /><h3 className="font-bold text-slate-800 text-lg">Customize Letter Template</h3></div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-4 flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Start from scratch</p>
            <p className="text-xs text-slate-500 mt-0.5">Create a blank template and customize it to your needs</p>
          </div>
          <button
            onClick={() => { setUseTerms(false); setSelectedSubclauses([]); setUseAnnexure1(false); setUseAnnexure2(false); setUseCompNotes(false); setForm({ ...EMPTY_FORM, type: letterType }); setStep("edit"); }}
            className="ml-6 shrink-0 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Create Blank Template
          </button>
        </div>
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide px-2">or use existing sections</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
        </div>
        <TermsSelectionStep
          useTerms={useTerms} setUseTerms={setUseTerms}
          selectedSubclauses={selectedSubclauses} setSelectedSubclauses={setSelectedSubclauses}
          useAnnexure1={useAnnexure1} setUseAnnexure1={setUseAnnexure1}
          useAnnexure2={useAnnexure2} setUseAnnexure2={setUseAnnexure2}
          useCompNotes={useCompNotes} setUseCompNotes={setUseCompNotes}
          onBack={onCancel} onContinue={handleContinue}
        />
      </div>
    );
  }

  const save = async () => {
    if (!form.name.trim()) return alert("Enter a template name (Offer Type)");
    if (!form.content || form.content === "<br>") return alert("Terms content cannot be empty");
    setSaving(true);
    try { onComplete(form); } finally { setSaving(false); }
  };

  return <LetterEditForm title="Add Letter Format" form={form} setForm={setForm} saving={saving} onCancel={onCancel} onBack={() => setStep("choose")} onSave={save} />;
}

// ── Letter Templates Main Tab ────────────────────────────────────
function LetterTemplatesTab() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [letterTab, setLetterTab] = useState("Offer Letter");
  const [view, setView] = useState<"list" | "customize" | "edit">("list");
  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const PER_PAGE = 10;

  useEffect(() => { api.get("/company/letter-templates").then(r => setTemplates(Array.isArray(r.data) ? r.data : [])).catch(() => setTemplates([])); }, []);

  const filtered = templates.filter(t => t.type === LETTER_TYPE_MAP[letterTab]);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openEdit = (t: any) => {
    setEditId(t.id);
    setForm({
      name: t.name || "", type: t.type || "OFFER", content: t.content || "",
      // ✅ FIX: Map empty string from DB back to null so section is shown/hidden correctly
      // If the saved value is "" treat it as null (not selected), otherwise use the value
      annexure1: (t.annexure1 !== undefined && t.annexure1 !== null && t.annexure1 !== "") ? t.annexure1 : null,
      annexure2: (t.annexure2 !== undefined && t.annexure2 !== null && t.annexure2 !== "") ? t.annexure2 : null,
      compensationNotes: (t.compensationNotes !== undefined && t.compensationNotes !== null && t.compensationNotes !== "") ? t.compensationNotes : null,
      isDefault: !!t.isDefault,
    });
    setView("edit");
  };

  const cancel = () => { setView("list"); setEditId(null); setForm(EMPTY_FORM); };

  const saveForm = async (f: TemplateForm) => {
    setSaving(true);
    try {
      const payload = {
        ...f,
        // null → "" for DB storage
        annexure1: f.annexure1 ?? "",
        annexure2: f.annexure2 ?? "",
        compensationNotes: f.compensationNotes ?? "",
      };
      if (editId) {
        const r = await api.put(`/company/letter-templates/${editId}`, payload);
        setTemplates(ts => ts.map(t => t.id === editId ? r.data : t));
      } else {
        const r = await api.post("/company/letter-templates", payload);
        setTemplates(ts => [...ts, r.data]);
      }
      cancel();
    } catch (e: any) { alert("Error: " + (e?.response?.data?.message || e.message)); }
    finally { setSaving(false); }
  };

  // ✅ FIX: Delete individual template
  const del = async (id: string) => {
    try {
      await api.delete(`/company/letter-templates/${id}`);
      setTemplates(ts => ts.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    } catch (e: any) { alert("Delete failed: " + (e?.response?.data?.message || e.message)); }
  };

  const toggleDefault = async (id: string, val: boolean) => {
    try {
      await api.put(`/company/letter-templates/${id}`, { isDefault: val });
      setTemplates(ts => ts.map(t => t.id === id ? { ...t, isDefault: val } : t));
    } catch {}
  };

  if (view === "customize") {
    return <CustomizeWizard letterType={LETTER_TYPE_MAP[letterTab]} templates={templates} onCancel={cancel} onComplete={saveForm} />;
  }

  if (view === "edit") {
    const save = async () => {
      if (!form.name.trim()) return alert("Enter a template name (Offer Type)");
      if (!form.content || form.content === "<br>") return alert("Terms content cannot be empty");
      await saveForm(form);
    };
    return <LetterEditForm title="Edit Letter Format" form={form} setForm={setForm} saving={saving} onCancel={cancel} onSave={save} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-4xl shadow-sm">
      <SectionTitle title="Letter Templates"
        action={<button onClick={() => setView("customize")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm"><Plus size={15} /> Add Template</button>}
      />
      <div className="flex border-b border-slate-200 mb-5 gap-1">
        {LETTER_TYPES.map(lt => (
          <button key={lt} onClick={() => { setLetterTab(lt); setPage(1); }}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px rounded-t-lg ${letterTab === lt ? "text-blue-600 border-blue-600 bg-blue-50/50" : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"}`}>
            {lt}
          </button>
        ))}
      </div>
      <DataTable
        headers={["Sl. No", "Template Name", "Set As Default", "Actions"]}
        rows={paged.map((t, i) => [
          (page - 1) * PER_PAGE + i + 1,
          <span key="name" className="font-medium">{t.name}</span>,
          <input key={t.id + "cb"} type="checkbox" checked={!!t.isDefault} onChange={e => toggleDefault(t.id, e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />,
          // ✅ FIX: Both Edit and Delete buttons in actions column
          <div key={t.id + "ac"} className="flex gap-2">
            <button onClick={() => openEdit(t)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"><Pencil size={11} /> Edit</button>
            <button onClick={() => setDeleteConfirmId(t.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"><Trash2 size={11} /> Delete</button>
          </div>,
        ])}
      />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PER_PAGE)} onPageChange={setPage} />

      {/* ✅ Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Delete Template</h3>
                  <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete this letter template?</p>
              <div className="flex gap-3">
                <button onClick={() => del(deleteConfirmId)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
                  Yes, Delete
                </button>
                <button onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function OrganizationPage() {
  const [tab, setTab] = useState("company");
  return (
    <AppShell title="Organization Data">
      <div className="mb-5">
        <h2 className="page-title">Organization Data</h2>
        <p className="page-sub">Manage company details and structure</p>
      </div>
      <div className="flex border-b border-slate-200 mb-6 gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px rounded-t-lg ${tab === t.id ? "text-blue-600 border-blue-600 bg-blue-50/50" : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>
      {tab === "company"         && <CompanyTab />}
      {tab === "locations"       && <LocationsTab />}
      {tab === "departments"     && <DepartmentsTab />}
      {tab === "designations"    && <DesignationsTab />}
      {tab === "professionaltax" && <ProfessionalTaxTab />}
      {tab === "lettertemplates" && <LetterTemplatesTab />}
    </AppShell>
  );
}