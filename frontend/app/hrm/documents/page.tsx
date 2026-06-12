"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Upload, FileText, Trash2, CheckCircle, X, Eye } from "lucide-react";

const DOC_TYPES = [
  "AADHAAR", "PAN", "RESUME", "BANK_DETAILS",
  "OFFER_LETTER", "APPOINTMENT_LETTER", "PROBATION_LETTER",
  "INCREMENT_LETTER", "EXIT_LETTER", "PAYSLIP", "OTHER"
];

const DOC_COLORS: Record<string, string> = {
  AADHAAR: "bg-blue-50 text-blue-700",
  PAN: "bg-amber-50 text-amber-700",
  RESUME: "bg-purple-50 text-purple-700",
  OFFER_LETTER: "bg-emerald-50 text-emerald-700",
  OTHER: "bg-slate-50 text-slate-600",
};

export default function DocumentsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("OTHER");
  const [docName, setDocName] = useState("");

  useEffect(() => {
    api.get("/employees").then(r => setEmployees(r.data)).catch(() => {});
  }, []);

  const loadDocs = (id: string) => {
    setSelected(id);
    if (id) api.get(`/documents/${id}`).then(r => setDocs(r.data)).catch(() => {});
    else setDocs([]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selected) return alert("Select employee first");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", e.target.files[0]);
    fd.append("employeeId", selected);
    fd.append("type", docType);
    fd.append("name", docName || e.target.files[0].name);
    try {
      await api.post("/documents/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      loadDocs(selected);
      setDocName("");
      e.target.value = "";
    } catch (err: any) {
      alert(err.response?.data?.message);
    } finally {
      setUploading(false);
    }
  };

  const verify = async (id: string) => {
    await api.put(`/documents/${id}/verify`);
    loadDocs(selected);
  };

  const deleteDoc = async (id: string) => {
    if (!confirm("Delete document?")) return;
    await api.delete(`/documents/${id}`);
    loadDocs(selected);
  };

  const selectedEmployee = employees.find(e => e.id === selected);

  return (
    <AppShell title="Documents">
      <div className="mb-5">
        <h2 className="page-title">Employee Documents</h2>
        <p className="page-sub">Upload, verify and manage employee documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Panel */}
        <div className="space-y-4">
          <div className="card">
            <label className="label">Select Employee</label>
            <select className="select" value={selected} onChange={e => loadDocs(e.target.value)}>
              <option value="">Choose employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>

            {selectedEmployee && (
              <div className="mt-4 p-3 bg-cream rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
                    {selectedEmployee.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-navy text-sm">{selectedEmployee.name}</div>
                    <div className="text-xs text-slate-400">{selectedEmployee.designation}</div>
                    <div className="text-xs text-slate-400">{selectedEmployee.employeeId}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selected && (
            <div className="card">
              <h4 className="font-semibold text-navy text-sm mb-3">Upload Document</h4>
              <div className="space-y-3">
                <div>
                  <label className="label">Document Type</label>
                  <select className="select" value={docType} onChange={e => setDocType(e.target.value)}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Document Name (optional)</label>
                  <input className="input" placeholder="e.g. Aadhaar Card" value={docName} onChange={e => setDocName(e.target.value)} />
                </div>
                <label className={`btn-primary w-full cursor-pointer flex items-center justify-center gap-2 ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
                  <Upload size={15} />
                  {uploading ? "Uploading..." : "Choose & Upload File"}
                  <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                </label>
                <p className="text-[10px] text-slate-400 text-center">PDF, JPG, PNG, DOC up to 10MB</p>
              </div>
            </div>
          )}

          {/* Stats */}
          {docs.length > 0 && (
            <div className="card">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-black text-navy">{docs.length}</div>
                  <div className="text-xs text-slate-400">Total Docs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-600">{docs.filter(d => d.verified).length}</div>
                  <div className="text-xs text-slate-400">Verified</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel – Doc list */}
        <div className="col-span-2">
          {!selected ? (
            <div className="card flex flex-col items-center justify-center h-64 text-slate-400">
              <FileText size={48} className="mb-3 opacity-20" />
              <p className="text-sm">Select an employee to view documents</p>
            </div>
          ) : docs.length === 0 ? (
            <div className="card flex flex-col items-center justify-center h-64 text-slate-400">
              <FileText size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-semibold">No documents uploaded</p>
              <p className="text-xs mt-1">Use the panel on the left to upload</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {docs.map(d => (
                <div key={d.id} className="card hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${DOC_COLORS[d.type] || DOC_COLORS.OTHER}`}>
                      {d.type.replace(/_/g, " ")}
                    </div>
                    {d.verified
                      ? <span className="badge badge-green text-[10px]"><CheckCircle size={10} className="mr-1" />Verified</span>
                      : <span className="badge badge-yellow text-[10px]">Pending</span>}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-navy truncate">{d.name || d.type.replace(/_/g, " ")}</div>
                      <div className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString("en-IN")}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a href={`https://fingrowhrm.info${d.fileUrl}?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer"
                      className="btn-ghost btn-sm flex-1 flex items-center justify-center gap-1">
                      <Eye size={13} /> View
                    </a>
                    {!d.verified && (
                      <button onClick={() => verify(d.id)}
                        className="btn-success btn-sm flex items-center gap-1">
                        <CheckCircle size={13} /> Verify
                      </button>
                    )}
                    <button onClick={() => deleteDoc(d.id)}
                      className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

