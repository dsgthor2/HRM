"use client";
import { Bell, Mail, Settings, X, ShieldCheck, CalendarX2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getUser } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [smtpForm, setSmtpForm] = useState({ user: "", pass: "" });
  const [loading, setLoading] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [showNotif, setShowNotif] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadMe = async () => {
    try {
      const res = await api.get("/auth/me");
      setSmtpForm({ user: res.data.smtpUser || "", pass: "" });
    } catch (_) {}
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get("/leaves/pending-count");
      setPendingLeaves(res.data.leaves || []);
      setNotifCount(res.data.count || 0);
    } catch (_) {}
  };

  useEffect(() => {
    setMounted(true);
    loadMe();
    loadNotifications();
    // Poll every 30 seconds for new leave requests
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/auth/smtp-settings", {
        smtpUser: smtpForm.user,
        smtpPass: smtpForm.pass
      });
      setShowSettings(false);
      alert("Mail settings saved! You can now send emails from your own account.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/leaves/${id}/approve`);
      await loadNotifications();
    } catch (_) { alert("Failed to approve"); }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/leaves/${id}/reject`);
      await loadNotifications();
    } catch (_) { alert("Failed to reject"); }
  };

  const user = mounted ? getUser() : null;
  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <header className="h-14 bg-white border-b border-cream-dark flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0">
      <h1 className="text-base font-bold text-navy">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="btn-icon" onClick={() => setShowSettings(true)} title="Mail Settings">
          <Mail size={17} className={smtpForm.user ? "text-emerald-500" : "text-slate-400"} />
        </button>

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative btn-icon"
            onClick={() => setShowNotif(v => !v)}
            title="Leave Notifications"
          >
            <Bell size={17} className={notifCount > 0 ? "text-navy" : "text-slate-400"} />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 border border-white">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotif && (
            <div className="absolute right-0 top-10 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <CalendarX2 size={15} className="text-navy" />
                  <span className="font-black text-navy text-sm">Leave Requests</span>
                  {notifCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {notifCount} Pending
                    </span>
                  )}
                </div>
                <button
                  className="text-xs text-blue-600 font-bold hover:underline"
                  onClick={() => { setShowNotif(false); router.push("/hrm/leaves"); }}
                >
                  View All →
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {pendingLeaves.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-500">All clear!</p>
                    <p className="text-xs text-slate-400 mt-0.5">No pending leave requests</p>
                  </div>
                ) : pendingLeaves.map(leave => (
                  <div key={leave.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-blue-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                          {(leave.employee?.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-navy text-sm leading-tight">{leave.employee?.name}</div>
                          <div className="text-[10px] text-slate-400">{leave.employee?.department}</div>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                        <Clock size={9} /> PENDING
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mb-1">
                      <span className="font-semibold">{leave.leaveType}</span> leave ·{" "}
                      {fmtDate(leave.fromDate)} → {fmtDate(leave.toDate)} · {leave.days} day{leave.days !== 1 ? "s" : ""}
                    </div>
                    {leave.reason && (
                      <div className="text-[11px] text-slate-400 italic mb-2 truncate">"{leave.reason}"</div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleApprove(leave.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle2 size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(leave.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                      <button
                        onClick={() => { setShowNotif(false); router.push("/hrm/leaves"); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {pendingLeaves.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                  <button
                    className="w-full py-2 rounded-xl bg-navy text-white text-xs font-black hover:bg-navy/90 transition-colors"
                    onClick={() => { setShowNotif(false); router.push("/hrm/leaves"); }}
                  >
                    Open Leave Management
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-3 border-l border-cream-dark">
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="text-xs leading-tight">
            <div className="font-semibold text-navy">
              {mounted ? user?.name || "Admin" : "Admin"}
            </div>
            <div className="text-slate-400 capitalize">
              {mounted ? user?.role?.toLowerCase() || "hr" : "hr"}
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-navy/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-navy text-lg leading-tight">Mail Settings</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Personal Dispatcher</p>
                  </div>
                </div>
                <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-2xl hover:bg-cream flex items-center justify-center transition-colors">
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed">
                Enter your Gmail / Work email credentials to send documents directly from your own account.
              </p>

              <form onSubmit={handleSaveSmtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                  <input
                    className="input h-12 text-sm"
                    placeholder="name@fingrow.in"
                    value={smtpForm.user}
                    onChange={e => setSmtpForm(f => ({ ...f, user: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">App Password</label>
                  <input
                    className="input h-12 text-sm font-mono"
                    type="password"
                    placeholder="16-character code"
                    value={smtpForm.pass}
                    onChange={e => setSmtpForm(f => ({ ...f, pass: e.target.value }))}
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1.5">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    Use a Google App Password, not your login password.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-navy text-white rounded-2xl font-black text-sm hover:bg-navy/90 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                  {loading ? "Updating..." : "Save Configuration"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}