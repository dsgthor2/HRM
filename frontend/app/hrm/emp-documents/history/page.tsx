"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import api from "@/lib/api";
import {
  FileText, Search, Download, Trash2,
  Calendar, User, RefreshCw,
  ArrowLeft, Edit3, MailPlus, Eye, X, Check,
  AlertCircle, Send, ExternalLink
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://fingrowhrm.info/api").replace("/api", "");

const TYPE_COLORS: Record<string, string> = {
  OFFER: "bg-blue-50 text-blue-700 border-blue-200",
  PROBATION: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INCREMENT: "bg-amber-50 text-amber-700 border-amber-200",
  EXIT: "bg-rose-50 text-rose-700 border-rose-200",
  EXPERIENCE: "bg-purple-50 text-purple-700 border-purple-200",
  APPOINTMENT: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

// ─── PREVIEW MODAL ────────────────────────────────────────────────────────────
function PreviewModal({ letter, onClose }: { letter: any; onClose: () => void }) {
  const pdfUrl = letter.pdfUrl ? `${API_BASE}${letter.pdfUrl}?token=${localStorage.getItem('token')}` : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <div className="font-black text-navy text-sm uppercase tracking-widest">
                {letter.type} Letter
              </div>
              <div className="text-[10px] text-slate-400 font-bold">
                {letter.employee?.name || (letter.metadata as any)?.name || "Manual Entry"} •{" "}
                {new Date(letter.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-xs font-black hover:bg-navy/90 transition-all"
              >
                <Download size={14} /> Download
              </a>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-slate-100">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title="Letter Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <AlertCircle size={40} className="text-slate-300 mx-auto" />
                <p className="text-slate-400 font-bold text-sm">PDF not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EMAIL MODAL ──────────────────────────────────────────────────────────────
function EmailModal({
  letter,
  onClose,
  onSent,
}: {
  letter: any;
  onClose: () => void;
  onSent: () => void;
}) {
  const meta = (letter.metadata || {}) as any;
  const [email, setEmail] = useState(
    letter.employee?.email || meta.email || meta.contact || ""
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await api.post(`/letters/${letter.id}/send-email`, { overrideEmail: email });
      setSent(true);
      setTimeout(() => {
        onSent();
        onClose();
      }, 1500);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Email delivery failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-blue-500 flex items-center justify-center">
            <Send size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-navy text-base">Send via Email</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {letter.type} Letter
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
          >
            <X size={15} />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
              <Check size={32} className="text-white" />
            </div>
            <div className="font-black text-navy">Email Sent!</div>
          </div>
        ) : (
          <>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@email.com"
            />
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                <AlertCircle size={13} />
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><RefreshCw size={15} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={15} /> Send Email</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteModal({
  letter,
  onClose,
  onDeleted,
}: {
  letter: any;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/letters/${letter.id}`);
      onDeleted();
      onClose();
    } catch {
      alert("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-sm p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-black text-navy">Delete Record</h3>
            <p className="text-xs text-slate-400">This cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete this{" "}
          <strong>{letter.type}</strong> letter? The PDF file will also be removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <><RefreshCw size={15} className="animate-spin" /> Deleting...</>
            ) : (
              <><Trash2 size={15} /> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LetterHistoryPage() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  const [previewLetter, setPreviewLetter] = useState<any>(null);
  const [emailLetter, setEmailLetter] = useState<any>(null);
  const [deleteLetter, setDeleteLetter] = useState<any>(null);
  const [directEmailLoading, setDirectEmailLoading] = useState<string | null>(null);

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const url =
        filterType !== "ALL" ? `/letters?type=${filterType}` : "/letters";
      const res = await api.get(url);
      setLetters(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, [filterType]);

  const handleDirectSend = async (letter: any) => {
    const meta = (letter.metadata || {}) as any;
    const recipientEmail = letter.employee?.email || meta.email || meta.contact || "";
    if (!confirm(`Send ${letter.type} letter to ${recipientEmail || "the registered email"}?`)) return;
    
    setDirectEmailLoading(letter.id);
    try {
      await api.post(`/letters/${letter.id}/send-email`);
      alert("Email sent successfully!");
      fetchLetters();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to send email. Check SMTP settings.");
    } finally {
      setDirectEmailLoading(null);
    }
  };

  const handleSyncToProfile = async (letter: any) => {
    if (!letter.employeeId) {
      alert("This letter is not linked to an active employee profile.");
      return;
    }

    if (!confirm(`Apply the details from this ${letter.type} letter to the employee's official profile? This will update their salary, designation, and other fields.`)) return;

    try {
      const meta = (letter.metadata || {}) as any;
      // Extract fields from metadata
      const payload: any = {
        designation: meta.designation || meta.revisedDesignation,
        department: meta.department,
        salary: Number(meta.revisedCtc || meta.revisedCtcOffer || meta.ctc || meta.monthlyGross || 0),
        workLocation: meta.workLocation || meta.location,
        basicPct: meta.basicPct ? Number(meta.basicPct) : undefined,
        hraPct: meta.hraPct ? Number(meta.hraPct) : undefined,
        gratuityPct: meta.gratuityPct ? Number(meta.gratuityPct) : undefined,
        epfEmployee: meta.manualEpf ? Number(meta.manualEpf) : undefined,
        esiEmployee: meta.manualEsi ? Number(meta.manualEsi) : undefined,
        ptOverride: meta.manualPt ? Number(meta.manualPt) : undefined,
      };

      // Clean up undefined
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await api.put(`/employees/${letter.employeeId}`, payload);
      alert("✅ Employee profile synchronized with letter data!");
    } catch (err: any) {
      alert("❌ Sync failed: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredLetters = letters.filter((l) => {
    const name =
      l.employee?.name || (l.metadata as any)?.name || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase())
    );
  });

  const editLink = (l: any) => {
    const typeMap: Record<string, string> = {
      OFFER: "offer",
      PROBATION: "probation",
      INCREMENT: "increment",
      EXIT: "exit",
      EXPERIENCE: "exit",
    };
    const slug = typeMap[l.type] || "offer";
    return `/hrm/emp-documents/${slug}-letter?edit=${l.id}`;
  };

  return (
    <AppShell title="Letter Repository">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[28px] border border-cream-dark">
          <div className="flex items-center gap-4">
            <Link
              href="/hrm/emp-documents"
              className="w-10 h-10 rounded-full border border-cream-dark flex items-center justify-center hover:bg-cream transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-navy uppercase tracking-tighter">
                Letter Repository
              </h1>
              <p className="text-sm text-slate-400">
                Manage and track all issued HR documents
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-cream-dark gap-0.5">
            {["ALL", "OFFER", "PROBATION", "INCREMENT", "EXIT"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={clsx(
                  "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  filterType === t
                    ? "bg-white text-navy shadow-sm"
                    : "text-slate-400 hover:text-navy"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search bar ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 bg-white p-4 rounded-[20px] border border-cream-dark">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={16}
            />
            <input
              className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-cream/20"
              placeholder="Search by name or document type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchLetters}
            className="w-11 h-11 rounded-xl border border-cream-dark flex items-center justify-center text-slate-400 hover:bg-cream/50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[28px] border border-cream-dark overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-cream-dark text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Document Type</th>
                <th className="px-4 py-4">Recipient</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Generated Date</th>
                <th className="px-4 py-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-5">
                      <div className="h-4 bg-cream/50 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-cream/30 rounded-full flex items-center justify-center">
                        <FileText size={28} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        No records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((l) => {
                  const meta = (l.metadata || {}) as any;
                  const name =
                    l.employee?.name || meta.name || "Manual Entry";
                  const email =
                    l.employee?.email || meta.email || meta.contact || "";
                  const typeCls =
                    TYPE_COLORS[l.type] || "bg-slate-50 text-slate-600 border-slate-200";

                  return (
                    <tr
                      key={l.id}
                      className="group hover:bg-cream/10 transition-all"
                    >
                      {/* Type */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-all">
                            <FileText size={18} />
                          </div>
                          <div>
                            <span
                              className={clsx(
                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                typeCls
                              )}
                            >
                              {l.type}
                            </span>
                            <div className="text-[9px] text-slate-400 font-bold mt-1">
                              Ref: #{l.id.slice(-8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-navy font-black text-sm">
                            {name[0] || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-navy">{name}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {email || "No email on file"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-5">
                        <span
                          className={clsx(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            l.sentByEmail
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          )}
                        >
                          {l.sentByEmail ? "Sent" : "Created"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Calendar size={13} />
                          {new Date(l.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-5 pr-6">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                          {/* Preview */}
                          <button
                            onClick={() => setPreviewLetter(l)}
                            title="Preview PDF"
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-navy hover:text-white transition-all"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit */}
                          <Link
                            href={editLink(l)}
                            title="Edit / Regenerate"
                            className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all"
                          >
                            <Edit3 size={15} />
                          </Link>

                          {/* Sync to Profile */}
                          {l.employeeId && (
                            <button
                              onClick={() => handleSyncToProfile(l)}
                              title="Sync to Employee Profile"
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                            >
                              <RefreshCw size={15} />
                            </button>
                          )}



                          {/* Download */}
                          {l.pdfUrl && (
                            <a
                              href={`${API_BASE}${l.pdfUrl}?token=${localStorage.getItem('token')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Download PDF"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                            >
                              <Download size={15} />
                            </a>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteLetter(l)}
                            title="Delete Record"
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Stats bar */}
        {filteredLetters.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 bg-white rounded-2xl border border-cream-dark text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>
              Showing {filteredLetters.length} of {letters.length} records
            </span>
            <span>
              {letters.filter((l) => l.sentByEmail).length} sent •{" "}
              {letters.filter((l) => !l.sentByEmail).length} pending
            </span>
          </div>
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
      {previewLetter && (
        <PreviewModal
          letter={previewLetter}
          onClose={() => setPreviewLetter(null)}
        />
      )}
      {emailLetter && (
        <EmailModal
          letter={emailLetter}
          onClose={() => setEmailLetter(null)}
          onSent={fetchLetters}
        />
      )}
      {deleteLetter && (
        <DeleteModal
          letter={deleteLetter}
          onClose={() => setDeleteLetter(null)}
          onDeleted={() => {
            setLetters((ls) => ls.filter((l) => l.id !== deleteLetter.id));
          }}
        />
      )}
    </AppShell>
  );
}
