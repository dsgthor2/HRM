"use client";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Plus, Download, Trash2, X, Zap, FileText, Settings,
  LayoutTemplate, ChevronLeft, ChevronRight, Eye, Edit3,
  CheckCircle2, Clock, AlertCircle, Users, TrendingUp,
  DollarSign, BarChart3, Sparkles, Mail, Upload, Save,
  Building2, Check, Image as ImageIcon, PlusCircle, Trash,
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const CY = new Date().getFullYear();

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => { setM(true); }, []);
  return m;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    GENERATED: { label: "Generated", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <CheckCircle2 size={11} /> },
    READY: { label: "Ready to generate", cls: "bg-blue-50 text-blue-600 border border-blue-200", icon: <Clock size={11} /> },
    PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-600 border border-amber-200", icon: <AlertCircle size={11} /> },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

function StatCard({ label, value, icon, color, delay }: any) {
  const mounted = useMounted();
  return (
    <div
      className="card group relative overflow-hidden"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
      }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${color.bg}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className={`text-2xl font-black ${color.text}`}>{value}</div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">{label}</div>
        </div>
        <div className={`p-2 rounded-xl ${color.iconBg}`}>
          <span className={color.text}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Mini payslip preview thumbnails ─────────────────────────────────────────
function StandardPreview() {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden text-[7px] bg-white scale-100 shadow-sm">
      <div className="bg-[#1e2d4a] text-white px-3 py-1.5 text-center">
        <div className="font-bold text-[8px]">PAYSLIP</div>
        <div className="text-[6px] text-slate-300">DefenseBlu Private Limited</div>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-2 gap-1 mb-2">
          {["Name: John Doe", "Emp Code: EMP001", "Designation: Engineer", "Department: Tech"].map(t => (
            <div key={t} className="text-[6px] text-slate-500">{t}</div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-[#1e2d4a] text-white text-center py-0.5 text-[6px] font-bold">EARNINGS</div>
          <div className="bg-[#1e2d4a] text-white text-center py-0.5 text-[6px] font-bold">DEDUCTIONS</div>
          {["Basic  12,000", "HRA  6,000", "Transport  1,600", "Special  5,400"].map(r => (
            <div key={r} className="text-[5.5px] text-slate-600 px-0.5">{r}</div>
          ))}
          {["EPF  1,440", "PT  200", "ESI  90"].map(r => (
            <div key={r} className="text-[5.5px] text-slate-600 px-0.5">{r}</div>
          ))}
        </div>
        <div className="mt-1 bg-slate-100 text-center text-[6px] py-0.5 font-bold text-[#1e2d4a]">Net Pay: ₹23,270</div>
      </div>
    </div>
  );
}

function ClassicPreview() {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden text-[7px] bg-white shadow-sm">
      <div className="flex justify-between items-center px-3 py-1.5 border-b border-slate-200">
        <div>
          <div className="font-bold text-[7px] text-[#1e2d4a]">PAYSLIP</div>
          <div className="text-[5.5px] text-slate-400">DefenseBlu</div>
        </div>
        <div className="w-5 h-5 rounded-full bg-[#1e2d4a] flex items-center justify-center text-white text-[6px] font-bold">F</div>
      </div>
      <div className="p-2 text-[5.5px] text-slate-500">
        <div className="text-[6px] font-bold text-slate-600 mb-1">Payslip for March 2024</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mb-1">
          {["Name: John Doe", "Paid Days: 26", "Emp Code: EMP001", "LOP Days: 0", "Designation: Engineer", "Bank: ICICI"].map(t => (
            <div key={t}>{t}</div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          <div className="flex-1 border border-slate-200 rounded p-1">
            <div className="font-bold text-[5.5px] mb-0.5">EARNINGS</div>
            {["Basic 12,000", "HRA 6,000", "Special 5,400"].map(r => (
              <div key={r} className="flex justify-between"><span>{r.split(" ")[0]}</span><span>{r.split(" ")[1]}</span></div>
            ))}
          </div>
          <div className="flex-1 border border-slate-200 rounded p-1">
            <div className="font-bold text-[5.5px] mb-0.5">DEDUCTIONS</div>
            {["EPF 1,440", "PT 200", "ESI 90"].map(r => (
              <div key={r} className="flex justify-between"><span>{r.split(" ")[0]}</span><span>{r.split(" ")[1]}</span></div>
            ))}
          </div>
        </div>
        <div className="mt-1 text-center bg-[#1e2d4a] text-white rounded py-0.5 text-[5.5px] font-bold">
          Net Payable: ₹23,270
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PayslipPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(CY);
  const [showGen, setShowGen] = useState(false);
  const [editSlip, setEditSlip] = useState<any>(null);
  const [previewSlip, setPreviewSlip] = useState<any>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const mounted = useMounted();

  // ── Settings modal state ──────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [companyData, setCompanyData] = useState<any>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [salaryComponents, setSalaryComponents] = useState([
    { id: "basic", label: "Basic", checked: true },
    { id: "hra", label: "HRA", checked: true },
    { id: "special", label: "Special Allowance", checked: true },
    { id: "epfesi", label: "EPF & ESI", checked: false },
  ]);
  const [customAllows, setCustomAllows] = useState<string[]>([]);
  const [customDeducts, setCustomDeducts] = useState<string[]>([]);

  // ── Salary Settings from localStorage ──
  const [basicPct, setBasicPct] = useState(40);
  const [hraRules, setHraRules] = useState<any[]>([]);
  const [welfareRules, setWelfareRules] = useState<any[]>([]);
  const [ptRules, setPtRules] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const b = localStorage.getItem("sc_basic");
      if (b) { const parsed = JSON.parse(b); if (parsed[0]?.value) setBasicPct(Number(parsed[0].value)); }
      const h = localStorage.getItem("sc_hra");
      if (h) setHraRules(JSON.parse(h));
      const w = localStorage.getItem("sc_epf");
      if (w) setWelfareRules(JSON.parse(w));
      const p = localStorage.getItem("sc_pt");
      if (p) setPtRules(JSON.parse(p));
      else { api.get("/company/professional-tax").then(r => { setPtRules(r.data); localStorage.setItem("sc_pt", JSON.stringify(r.data)); }); }
      
      const l = localStorage.getItem("sc_locs");
      if (l) setLocations(JSON.parse(l));
      else { api.get("/company/locations").then(r => { setLocations(r.data); localStorage.setItem("sc_locs", JSON.stringify(r.data)); }); }
    }
  }, []);

  // ── Templates modal state ─────────────────────────────────────────────────
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"standard" | "classic">("standard");
  const [savedTemplate, setSavedTemplate] = useState<"standard" | "classic">("standard");

  // ── Employee to Payroll modal state ───────────────────────────────────────
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  // ── Send Email modal state ────────────────────────────────────────────────
  const [emailSlip, setEmailSlip] = useState<any>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [directEmailLoading, setDirectEmailLoading] = useState<string | null>(null);
  const [historicalSalary, setHistoricalSalary] = useState<number | null>(null);
  const [bulkDate, setBulkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkGenMode, setBulkGenMode] = useState<"SINGLE" | "RANGE">("SINGLE");
  const [rangeMonths, setRangeMonths] = useState(3);

  const [form, setForm] = useState<{
    employeeId: string;
    month: string;
    year: string;
    paidDays: string;
    presentDays: string;
    otherAllow: string;
    otherDeduct: string;
    basicPct: string;
    hraPct: string;
    generatedDate: string;
  }>({
    employeeId: "",
    month: MONTHS[new Date().getMonth()],
    year: String(CY),
    paidDays: "26",
    presentDays: "26",
    otherAllow: "0",
    otherDeduct: "0",
    basicPct: "",
    hraPct: "",
    generatedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (form.employeeId && form.month && form.year) {
      api.get(`/employees/${form.employeeId}/active-salary?month=${form.month}&year=${form.year}`)
        .then(res => setHistoricalSalary(res.data.salary))
        .catch(() => setHistoricalSalary(null));
    } else {
      setHistoricalSalary(null);
    }
  }, [form.employeeId, form.month, form.year]);

  const filterMonth = MONTHS[currentMonth];
  const filterYear = String(currentYear);
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const load = () => {
    api.get(`/payslip?month=${filterMonth}&year=${filterYear}`)
      .then(r => setPayslips(r.data)).catch(() => { });
  };
  useEffect(() => { load(); }, [currentMonth, currentYear]);
  useEffect(() => {
    api.get("/employees?status=ACTIVE,PROBATION,CONTRACT,INTERN").then(r => setEmployees(r.data)).catch(() => { });
  }, []);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  // ── Generate / Edit / Delete ──────────────────────────────────────────────
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault(); setGenLoading(true);
    try { await api.post("/payslip/generate", { ...form, template: savedTemplate }); setShowGen(false); load(); }
    catch (err: any) { alert(err.response?.data?.message || "Error generating payslip"); }
    finally { setGenLoading(false); }
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editSlip) return; setGenLoading(true);
    try { await api.put(`/payslip/${editSlip.id}`, { ...editSlip, template: savedTemplate }); setEditSlip(null); load(); }
    catch (err: any) { alert(err.response?.data?.message || "Error updating payslip"); }
    finally { setGenLoading(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payslip?")) return;
    await api.delete(`/payslip/${id}`); load();
  };
  const handleGeneratePDF = async (id: string) => {
    try { await api.post(`/payslip/${id}/generate-pdf`, { template: savedTemplate }); load(); }
    catch { alert("PDF generation failed"); }
  };

  // ── Bulk generate ─────────────────────────────────────────────────────────
  const handleBulkGenerate = async () => {
    if (bulkSelected.size === 0) { alert("Select at least one employee."); return; }
    
    let payload: any = {
      employeeIds: Array.from(bulkSelected),
      template: savedTemplate,
      generatedDate: bulkDate
    };

    if (bulkGenMode === "SINGLE") {
      if (!confirm(`Generate payslips for ${bulkSelected.size} employee(s) for ${filterMonth} ${filterYear}?`)) return;
      payload.month = filterMonth;
      payload.year = filterYear;
    } else {
      if (!confirm(`Generate payslips for ${bulkSelected.size} employee(s) for the last ${rangeMonths} months?`)) return;
      
      const range = [];
      const date = new Date(currentYear, currentMonth, 1);
      for (let i = 0; i < rangeMonths; i++) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        range.push({ month: MONTHS[d.getMonth()], year: d.getFullYear() });
      }
      payload.range = range;
    }

    setBulkLoading(true);
    try {
      const res = await api.post("/payslip/generate-bulk", payload);
      const done = res.data.results.filter((r: any) => r.status === "generated").length;
      const skipped = res.data.results.filter((r: any) => r.status === "already_exists").length;
      alert(`Done! ${done} payslip(s) generated.${skipped > 0 ? ` ${skipped} already existed and were skipped.` : ""}`);
      setShowBulkModal(false); setBulkSelected(new Set()); load();
    } catch (err: any) { alert(err.response?.data?.message || "Bulk generation failed"); }
    finally { setBulkLoading(false); }
  };

  // ── Table-row bulk generate (for checked payslip rows → regenerate PDF) ──
  const handleTableBulkGenerate = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => api.post(`/payslip/${id}/generate-pdf`, { template: savedTemplate })));
      alert(`PDFs generated for ${ids.length} payslip(s).`);
      setSelected(new Set()); load();
    } catch { alert("Some PDFs failed to generate."); }
    finally { setBulkLoading(false); }
  };

  // ── Settings ──────────────────────────────────────────────────────────────
  const openSettings = async () => {
    try {
      const r = await api.get("/company");
      setCompanyData(r.data);
      if (r.data.logoUrl) setLogoPreview(`https://hrm-6kly.onrender.com${r.data.logoUrl}`);
    } catch { }
    setShowSettings(true);
  };
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };
  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      if (logoFile) {
        const fd = new FormData(); fd.append("logo", logoFile);
        const r = await api.post("/company/upload-logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setCompanyData((d: any) => ({ ...d, logoUrl: r.data.logoUrl }));
        await api.put("/company", { ...companyData, logoUrl: r.data.logoUrl });
      } else {
        await api.put("/company", companyData);
      }
      setShowSettings(false); alert("Settings saved!");
    } catch (err: any) { alert(err.response?.data?.message || "Failed to save"); }
    finally { setSettingsLoading(false); }
  };

  // ── Templates ─────────────────────────────────────────────────────────────
  const handleSaveTemplate = () => {
    setSavedTemplate(selectedTemplate);
    setShowTemplates(false);
    alert(`Template "${selectedTemplate === "standard" ? "Standard" : "Classic"}" saved!`);
  };

  // ── Send Email ────────────────────────────────────────────────────────────
  const openEmailModal = (slip: any) => {
    setEmailSlip(slip);
    setEmailAddress(slip.employee?.email || "");
  };
  const handleSendEmail = async () => {
    if (!emailSlip) return;
    if (!emailAddress) { alert("Please enter an email address."); return; }
    setEmailSending(true);
    try {
      const res = await api.post(`/payslip/${emailSlip.id}/send-email`, { email: emailAddress });
      alert(res.data.message || "Email sent!");
      setEmailSlip(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send email. Check SMTP settings in backend .env");
    } finally { setEmailSending(false); }
  };
  const handleDirectSendEmail = async (slip: any) => {
    const targetEmail = slip.employee?.email || "the employee's registered email";
    if (!confirm(`Send payslip for ${slip.month} ${slip.year} to ${targetEmail}?`)) return;
    setDirectEmailLoading(slip.id);
    try {
      const res = await api.post(`/payslip/${slip.id}/send-email`);
      alert(res.data.message || "Email sent to registered address!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send email.");
    } finally { setDirectEmailLoading(null); }
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleSelect = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Auto-fetch attendance for payslip ──
  useEffect(() => {
    if (form.employeeId && form.month && form.year) {
      const monthIndex = MONTHS.indexOf(form.month) + 1;
      api.get(`/attendance/report/${form.employeeId}?month=${monthIndex}&year=${form.year}`)
        .then(res => {
          if (res.data && res.data.summary) {
            const d = new Date(parseInt(form.year), monthIndex, 0);
            const totalDaysInMonth = d.getDate();
            const totalAttendanceRecords = res.data.total;
            
            // Calculate present days based on attendance status rules
            const present = (res.data.summary.PRESENT || 0) + 
                            (res.data.summary.WFH || 0) + 
                            (res.data.summary.WEEKEND || 0) + 
                            (res.data.summary.HOLIDAY || 0) +
                            ((res.data.summary.HALFDAY || 0) * 0.5);

            // If we have actual attendance logged for the month, use it. Otherwise, default to the month's total days.
            const finalWorking = totalAttendanceRecords > 0 ? totalAttendanceRecords : totalDaysInMonth;
            const finalPresent = totalAttendanceRecords > 0 ? Math.ceil(present) : totalDaysInMonth;
            
            setForm(f => ({ ...f, paidDays: finalWorking.toString(), presentDays: finalPresent.toString() }));
          }
        }).catch(() => {});
    }
  }, [form.employeeId, form.month, form.year]);
  const toggleAll = () => selected.size === payslips.length ? setSelected(new Set()) : setSelected(new Set(payslips.map(p => p.id)));
  const toggleBulk = (id: string) => setBulkSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAllBulk = () => bulkSelected.size === employees.length ? setBulkSelected(new Set()) : setBulkSelected(new Set(employees.map(e => e.id)));

  /* live preview for generate modal */
  const preview = (() => {
    const emp = employees.find(e => e.id === form.employeeId);
    if (!emp) return null;

    const g = historicalSalary !== null ? historicalSalary : emp.salary;
    const present = parseInt(form.presentDays) || 26, working = parseInt(form.paidDays) || 26;
    const lop = Math.max(0, working - present);
    const eff = g - (lop > 0 ? (g / working) * lop : 0);

    // Prioritize individual employee settings, fallback to global settings
    const bPForm = Number(form.basicPct);
    const bP = (bPForm ? bPForm : (emp.basicPct ? emp.basicPct : basicPct)) / 100;
    const basic = eff * bP;

    // HRA logic
    let hP = 0.5; // default 50% of basic
    const hPForm = Number(form.hraPct);
    if (hPForm) {
      hP = hPForm / 100;
    } else if (emp.hraPct) {
      hP = emp.hraPct / 100;
    } else if (hraRules.length > 0) {
      // attempt to match location
      const loc = emp.workLocation || emp.city || "";
      const rule = hraRules.find(r => loc.includes(r.city) || loc.includes(r.state));
      if (rule) hP = rule.hra / 100;
    }
    const hra = basic * hP;

    const special = Math.max(0, eff - basic - hra);
    const gross = basic + hra + special + parseFloat(form.otherAllow || "0");

    // EPF & ESI logic: No automatic fallbacks, strictly use employee record or 0
    const epf = (emp.epfEmployee !== null && emp.epfEmployee !== undefined && emp.epfEmployee !== "") ? Number(emp.epfEmployee) : 0;
    const esi = (emp.esiEmployee !== null && emp.esiEmployee !== undefined && emp.esiEmployee !== "") ? Number(emp.esiEmployee) : 0;
    const tds = eff > 50000 ? eff * 0.1 : 0;

    // PT logic: No automatic rule matching, strictly use manual override or 0
    let pt = 0;
    if (emp.ptOverride !== null && emp.ptOverride !== undefined && emp.ptOverride !== "") {
      pt = Number(emp.ptOverride);
    } else {
      pt = 0;
    }

    const totalDeduct = epf + esi + tds + pt + parseFloat(form.otherDeduct || "0");
    const transport = 0; // fallback for preview
    return { basic, hra, transport, specialAllow: special, gross, epf, esi, tds, pt, totalDeduct, net: gross - totalDeduct };
  })();

  const totalGross = payslips.reduce((s, p) => s + p.grossSalary, 0);
  const totalDeduct = payslips.reduce((s, p) => s + p.totalDeduct, 0);
  const totalNet = payslips.reduce((s, p) => s + p.netSalary, 0);

  return (
    <AppShell title="Payslip">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="page-title">Employee Payslip Details</h2>
          <p className="page-sub">Use the date picker to see the payslips for the corresponding month.</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button className="btn-ghost gap-2 text-sm" onClick={openSettings}>
            <Settings size={14} /> Settings
          </button>
          <button className="btn-ghost gap-2 text-sm" onClick={() => setShowTemplates(true)}>
            <LayoutTemplate size={14} /> Templates
          </button>

          {/* Month Navigator */}
          <div className="flex items-center gap-1 bg-white border border-cream-dark rounded-xl px-3 py-2 shadow-sm">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-sm font-bold text-navy px-3 min-w-[110px] text-center">{filterMonth} {filterYear}</span>
            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><ChevronRight size={16} /></button>
          </div>

          <button
            className="btn-ghost gap-2 text-sm border-navy text-navy hover:bg-navy hover:text-white transition-all"
            onClick={() => { setBulkSelected(new Set(employees.map(e => e.id))); setShowBulkModal(true); }}
          >
            <Users size={14} /> Employee to Payroll
          </button>
          <button className="btn-primary gap-2" onClick={() => { setForm(f => ({ ...f, month: filterMonth, year: filterYear })); setShowGen(true); }}>
            <Plus size={15} /> Generate Payslip
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      {payslips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <StatCard label="Total Gross" value={fmt(totalGross)} icon={<TrendingUp size={16} />} color={{ bg: "bg-blue-50", text: "text-accent", iconBg: "bg-blue-50" }} delay={0} />
          <StatCard label="Total Deductions" value={fmt(totalDeduct)} icon={<BarChart3 size={16} />} color={{ bg: "bg-red-50", text: "text-red-500", iconBg: "bg-red-50" }} delay={80} />
          <StatCard label="Total Net Payout" value={fmt(totalNet)} icon={<DollarSign size={16} />} color={{ bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-50" }} delay={160} />
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="card overflow-hidden p-0">
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-navy text-white text-sm animate-fadeIn">
            <span className="font-semibold">{selected.size} selected</span>
            <button className="ml-auto btn-sm bg-white/10 hover:bg-white/20 text-white gap-1" onClick={handleTableBulkGenerate} disabled={bulkLoading}>
              <Zap size={13} /> {bulkLoading ? "Generating..." : `Generate PDFs (${selected.size})`}
            </button>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-dark bg-slate-50/60">
                <th className="th w-10"><input type="checkbox" className="rounded" checked={selected.size === payslips.length && payslips.length > 0} onChange={toggleAll} /></th>
                <th className="th">Employee</th>
                <th className="th">Designation</th>
                <th className="th">Department</th>
                <th className="th">Last Updated</th>
                <th className="th">Status</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="td text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center"><FileText size={24} className="text-slate-300" /></div>
                      <div>
                        <div className="font-semibold text-slate-500 text-sm">No payslips for {filterMonth} {filterYear}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          <button onClick={() => setShowGen(true)} className="text-accent hover:underline">Generate now →</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : payslips.map((p, i) => (
                <tr key={p.id} className="tr group" style={{ animation: `slideInRow 0.3s ease ${i * 50}ms both` }}>
                  <td className="td"><input type="checkbox" className="rounded" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
  
                  <td className="td">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {p.employee?.name?.[0] || "?"}
                      </div>
                      <Link href={`/hrm/employees?id=${p.employee?.id}`} className="group/link">
                        <div className="font-semibold text-navy text-sm group-hover/link:text-accent transition-colors">{p.employee?.name}</div>
                        <div className="text-xs text-slate-400">{p.employee?.employeeId}</div>
                      </Link>
                    </div>
                  </td>
                  <td className="td text-sm text-slate-600">{p.employee?.designation}</td>
                  <td className="td text-sm text-slate-600">{p.employee?.department}</td>
                  <td className="td text-xs text-slate-400">
                    {(() => {
                      const d = new Date(p.generated);
                      const dd = String(d.getUTCDate()).padStart(2, "0");
                      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
                      const yy = d.getUTCFullYear();
                      return `${dd}-${mm}-${yy}`;
                    })()}
                  </td>
                  <td className="td"><StatusBadge status={p.pdfUrl ? "GENERATED" : "READY"} /></td>
  
                  <td className="td">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button className="btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 gap-1" onClick={() => setEditSlip({ ...p })}>
                        <Edit3 size={12} /> Edit
                      </button>
  
                      {p.pdfUrl ? (
                        <>
                          <button className="btn-sm bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 gap-1" onClick={() => setPreviewSlip(p)}>
                            <Eye size={12} /> Preview
                          </button>
                          <a href={`https://hrm-6kly.onrender.com${p.pdfUrl}?token=${localStorage.getItem('fg_token')}`} target="_blank" rel="noreferrer"
                            className="btn-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 gap-1">
                            <Download size={12} /> PDF
                          </a>
  
                        </>
                      ) : (
                        <button className="btn-sm bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 gap-1" onClick={() => handleGeneratePDF(p.id)}>
                          <Sparkles size={12} /> Generate
                        </button>
                      )}
  
                      <button className="btn-icon btn-sm text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payslips.length > 0 && (
          <div className="px-5 py-3 border-t border-cream-dark bg-slate-50/40 flex items-center justify-between">
            <span className="text-xs text-slate-400">{payslips.length} payslip{payslips.length !== 1 ? "s" : ""} · {filterMonth} {filterYear}</span>
            <button className="btn-ghost btn-sm gap-1 text-xs" onClick={() => { setBulkSelected(new Set(employees.map((e: any) => e.id))); setShowBulkModal(true); }} disabled={bulkLoading}>
              <Zap size={12} /> {bulkLoading ? "Generating..." : "Bulk Generate All"}
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          SETTINGS MODAL
      ══════════════════════════════════════════ */}
      {showSettings && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSettings(false)}>
          <div className="modal-box max-w-2xl slide-in overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center"><Settings size={16} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-navy">Payslip Settings</h3>
                  <p className="text-xs text-slate-400">Configure company details & salary components</p>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="btn-icon"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* ── Edit Company Details ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={16} className="text-navy" />
                  <h4 className="font-bold text-navy text-sm">Edit Company Details</h4>
                </div>

                {/* Logo */}
                <div className="mb-5">
                  <div className="text-xs font-semibold text-accent mb-2">Company Logo</div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                      {logoPreview
                        ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain p-1" />
                        : <ImageIcon size={24} className="text-slate-300" />
                      }
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                      <span className="text-accent text-xs font-bold underline flex items-center gap-1"><Upload size={12} /> UPLOAD</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company Name</label>
                    <input className="input" value={companyData.name || ""} onChange={e => setCompanyData((d: any) => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Contact Email</label>
                    <input className="input" type="email" value={companyData.email || ""} onChange={e => setCompanyData((d: any) => ({ ...d, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Company Mobile No.</label>
                    <input className="input" placeholder="Mobile Number" value={companyData.phone || ""} onChange={e => setCompanyData((d: any) => ({ ...d, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Website URL</label>
                    <input className="input" placeholder="Website Url" value={companyData.website || ""} onChange={e => setCompanyData((d: any) => ({ ...d, website: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Company Address</label>
                    <input className="input" value={companyData.address || ""} onChange={e => setCompanyData((d: any) => ({ ...d, address: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="border-t border-cream-dark" />

              {/* ── Additional Settings ── */}
              <div>
                <h4 className="font-bold text-navy text-sm mb-1">Additional Settings</h4>
                <p className="text-xs text-slate-400 mb-4">Uncheck salary components not impacted by Loss of Pay.</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {salaryComponents.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded accent-accent"
                        checked={c.checked}
                        onChange={() => setSalaryComponents(cs => cs.map(x => x.id === c.id ? { ...x, checked: !x.checked } : x))}
                      />
                      <span className="text-sm text-slate-700">{c.label}</span>
                    </label>
                  ))}
                </div>

                {/* Add Salary Component */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Salary Additions</div>
                  {customAllows.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <input className="input flex-1 py-1 text-sm" value={c} onChange={e => setCustomAllows(arr => arr.map((v, j) => j === i ? e.target.value : v))} />
                      <button onClick={() => setCustomAllows(arr => arr.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash size={14} /></button>
                    </div>
                  ))}
                  <button className="flex items-center gap-1.5 text-accent text-sm font-semibold mt-1" onClick={() => setCustomAllows(a => [...a, ""])}>
                    <PlusCircle size={16} /> Add Salary Component
                  </button>
                </div>

                {/* Salary Deductions */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Salary Deductions</div>
                  {customDeducts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <input className="input flex-1 py-1 text-sm" value={c} onChange={e => setCustomDeducts(arr => arr.map((v, j) => j === i ? e.target.value : v))} />
                      <button onClick={() => setCustomDeducts(arr => arr.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash size={14} /></button>
                    </div>
                  ))}
                  <button className="flex items-center gap-1.5 text-accent text-sm font-semibold mt-1" onClick={() => setCustomDeducts(a => [...a, ""])}>
                    <PlusCircle size={16} /> Add Deduction Component
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6 border-t border-cream-dark pt-4">
              <button className="btn-primary flex-1 gap-2" onClick={handleSaveSettings} disabled={settingsLoading}>
                <Save size={15} /> {settingsLoading ? "Saving..." : "Update"}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setShowSettings(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TEMPLATES MODAL
      ══════════════════════════════════════════ */}
      {showTemplates && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTemplates(false)}>
          <div className="modal-box max-w-3xl slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center"><LayoutTemplate size={16} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-navy">Choose Payslip Template</h3>
                  <p className="text-xs text-slate-400">Select the layout for generated payslip PDFs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-primary gap-2" onClick={handleSaveTemplate}>
                  <Save size={14} /> Save Changes
                </button>
                <button onClick={() => setShowTemplates(false)} className="btn-icon"><X size={18} /></button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              {/* Standard Template */}
              <div
                className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${selectedTemplate === "standard" ? "border-accent shadow-lg shadow-accent/10" : "border-slate-200 hover:border-slate-300"}`}
                onClick={() => setSelectedTemplate("standard")}
              >
                <div className="text-center font-bold text-navy mb-4 text-sm">Standard Template</div>
                <StandardPreview />
                <div className="mt-4 flex items-center justify-between">
                  {savedTemplate === "standard" && (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">DEFAULT</span>
                  )}
                  {selectedTemplate === "standard" ? (
                    <button
                      className="ml-auto btn-primary text-xs gap-1.5 py-1.5 px-3"
                      onClick={e => { e.stopPropagation(); setSelectedTemplate("standard"); }}
                    >
                      <Check size={13} /> Selected
                    </button>
                  ) : (
                    <button className="ml-auto btn-ghost text-xs py-1.5 px-3" onClick={e => { e.stopPropagation(); setSelectedTemplate("standard"); }}>
                      Choose Template
                    </button>
                  )}
                </div>
              </div>

              {/* Classic Template */}
              <div
                className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${selectedTemplate === "classic" ? "border-accent shadow-lg shadow-accent/10" : "border-slate-200 hover:border-slate-300"}`}
                onClick={() => setSelectedTemplate("classic")}
              >
                <div className="text-center font-bold text-navy mb-4 text-sm">Classic Template</div>
                <ClassicPreview />
                <div className="mt-4 flex items-center justify-between">
                  {savedTemplate === "classic" && (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">DEFAULT</span>
                  )}
                  {selectedTemplate === "classic" ? (
                    <button
                      className="ml-auto btn-primary text-xs gap-1.5 py-1.5 px-3"
                      onClick={e => { e.stopPropagation(); setSelectedTemplate("classic"); }}
                    >
                      <Check size={13} /> Selected
                    </button>
                  ) : (
                    <button className="ml-auto btn-ghost text-xs py-1.5 px-3" onClick={e => { e.stopPropagation(); setSelectedTemplate("classic"); }}>
                      Choose Template
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          EMPLOYEE TO PAYROLL (BULK) MODAL
      ══════════════════════════════════════════ */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowBulkModal(false)}>
          <div className="modal-box max-w-xl slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center"><Users size={16} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-navy">Employee to Payroll</h3>
                  <p className="text-xs text-slate-400">Bulk generate payslips for {filterMonth} {filterYear}</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="btn-icon"><X size={18} /></button>
            </div>

            <div className="px-6 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Generation Mode</label>
                  <select 
                    className="select" 
                    value={bulkGenMode} 
                    onChange={e => setBulkGenMode(e.target.value as any)}
                  >
                    <option value="SINGLE">Single Month</option>
                    <option value="RANGE">Month Range (3/6 Mo)</option>
                  </select>
                </div>
                {bulkGenMode === "SINGLE" ? (
                  <div>
                    <label className="label">Payslip Issue Date <span className="text-red-400">*</span></label>
                    <input 
                      type="date" 
                      className="input" 
                      value={bulkDate} 
                      onChange={e => {
                        setBulkDate(e.target.value);
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          setCurrentMonth(date.getMonth());
                          setCurrentYear(date.getFullYear());
                        }
                      }} 
                    />
                  </div>
                ) : (
                  <div>
                    <label className="label">Select Range</label>
                    <select 
                      className="select" 
                      value={rangeMonths} 
                      onChange={e => setRangeMonths(Number(e.target.value))}
                    >
                      <option value={3}>Last 3 Months</option>
                      <option value={6}>Last 6 Months</option>
                      <option value={12}>Last 1 Year</option>
                    </select>
                  </div>
                )}
              </div>
              
              {bulkGenMode === "RANGE" && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[11px] text-amber-700">
                  <span className="font-bold">Note:</span> This will generate payslips for the selected duration ending in <strong>{filterMonth} {filterYear}</strong>.
                </div>
              )}

              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-500">{bulkSelected.size} of {employees.length} selected</span>
                <button className="text-xs font-bold text-accent" onClick={toggleAllBulk}>
                  {bulkSelected.size === employees.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {employees.map(emp => {
                  const hasSlip = payslips.some(p => p.employeeId === emp.id);
                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${bulkSelected.has(emp.id) ? "border-accent bg-accent/5" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <input
                        type="checkbox"
                        className="rounded accent-accent"
                        checked={bulkSelected.has(emp.id)}
                        onChange={() => toggleBulk(emp.id)}
                      />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {emp.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-navy truncate flex items-center gap-2">
                          {emp.name}
                          {emp._count?.salaryHistory > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-tighter">
                              <TrendingUp size={9} /> Increment
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{emp.designation} · {emp.department}</div>
                      </div>
                      {hasSlip && (
                        <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                          <CheckCircle2 size={10} className="inline mr-0.5" />Done
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-5">
              <button
                className="btn-primary flex-1 gap-2"
                onClick={handleBulkGenerate}
                disabled={bulkLoading || bulkSelected.size === 0}
              >
                <Zap size={15} /> {bulkLoading ? "Generating..." : `Generate for ${bulkSelected.size} Employees`}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setShowBulkModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          GENERATE PAYSLIP MODAL
      ══════════════════════════════════════════ */}
      {showGen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGen(false)}>
          <div className="modal-box max-w-2xl slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center"><FileText size={17} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-navy">Generate Payslip</h3>
                  <p className="text-xs text-slate-400">PDF will be auto-generated after submission</p>
                </div>
              </div>
              <button onClick={() => setShowGen(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="label">Employee <span className="text-red-400">*</span></label>
                  <select 
                    className="select" 
                    required 
                    value={form.employeeId} 
                    onChange={e => {
                      const id = e.target.value;
                      const emp = employees.find(x => x.id === id);
                      setForm(f => ({
                        ...f,
                        employeeId: id,
                        basicPct: emp?.basicPct ? String(emp.basicPct) : "",
                        hraPct: emp?.hraPct ? String(emp.hraPct) : ""
                      }));
                    }}
                  >
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} – {e.designation}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Month <span className="text-red-400">*</span></label>
                    <select className="select" value={form.month} onChange={e => set("month", e.target.value)}>
                      {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Year <span className="text-red-400">*</span></label>
                    <select className="select" value={form.year} onChange={e => set("year", e.target.value)}>
                      {Array.from({ length: 11 }, (_, i) => CY - 5 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Total Days</label>
                    <input className="input" type="number" value={form.paidDays} onChange={e => set("paidDays", e.target.value)} min="1" max="31" />
                  </div>
                  <div>
                    <label className="label">Paid Days</label>
                    <input className="input" type="number" value={form.presentDays} onChange={e => set("presentDays", e.target.value)} min="0" max="31" />
                  </div>
                  <div>
                    <label className="label">Other Allowances (₹)</label>
                    <input className="input" type="number" value={form.otherAllow} onChange={e => set("otherAllow", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Other Deductions (₹)</label>
                    <input className="input" type="number" value={form.otherDeduct} onChange={e => set("otherDeduct", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Payslip Date (Issue Date) <span className="text-red-400">*</span></label>
                    <input 
                      className="input" 
                      type="date" 
                      value={form.generatedDate} 
                      onChange={e => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          const m = MONTHS[date.getMonth()];
                          const y = date.getFullYear().toString();
                          setForm(f => ({ ...f, generatedDate: e.target.value, month: m, year: y }));
                        } else {
                          set("generatedDate", e.target.value);
                        }
                      }} 
                      required 
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Edit3 size={14} /> Percentage Overrides (%)
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="label text-blue-700/60">Basic %</label>
                      <input className="input bg-white" type="number" value={form.basicPct} onChange={e => set("basicPct", e.target.value)} placeholder="e.g. 50" />
                    </div>
                    <div>
                      <label className="label text-blue-700/60">HRA %</label>
                      <input className="input bg-white" type="number" value={form.hraPct} onChange={e => set("hraPct", e.target.value)} placeholder="e.g. 40" />
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-400 mt-2 italic">* Leave blank to use organization defaults</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-500" />
                      Calculated Components
                    </div>
                    {historicalSalary !== null && employees.find(e => e.id === form.employeeId)?.salary !== historicalSalary && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 animate-pulse">
                        <TrendingUp size={10} /> Using Historical Salary
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label text-slate-400">Basic Salary (₹)</label>
                      <input className="input bg-white font-bold text-navy" readOnly value={preview?.basic.toFixed(0) || "0"} />
                    </div>
                    <div>
                      <label className="label text-slate-400">HRA (₹)</label>
                      <input className="input bg-white font-bold text-navy" readOnly value={preview?.hra.toFixed(0) || "0"} />
                    </div>
                    <div>
                      <label className="label text-slate-400">Professional Tax (₹)</label>
                      <input className="input bg-white font-bold text-red-500" readOnly value={preview?.pt.toFixed(0) || "0"} />
                    </div>
                    <div>
                      <label className="label text-slate-400">EPF (Employee) (₹)</label>
                      <input className="input bg-white font-bold text-red-500" readOnly value={preview?.epf.toFixed(0) || "0"} />
                    </div>
                    <div>
                      <label className="label text-slate-400">ESI (Employee) (₹)</label>
                      <input className="input bg-white font-bold text-red-500" readOnly value={preview?.esi.toFixed(0) || "0"} />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center px-1">
                    <div className="text-sm font-bold text-navy">Net Salary</div>
                    <div className="text-xl font-black text-emerald-600">₹{preview?.net.toFixed(0) || "0"}</div>
                  </div>
                </div>

                {/* Legacy preview block successfully removed */}
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button type="submit" className="btn-primary flex-1 gap-2" disabled={genLoading}>
                  <FileText size={15} /> {genLoading ? "Generating PDF..." : "Generate & Download PDF"}
                </button>
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowGen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          EDIT PAYSLIP MODAL
      ══════════════════════════════════════════ */}
      {editSlip && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditSlip(null)}>
          <div className="modal-box max-w-lg slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center"><Edit3 size={16} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-navy">Edit Payslip</h3>
                  <p className="text-xs text-slate-400">{editSlip.employee?.name} · {editSlip.month} {editSlip.year}</p>
                </div>
              </div>
              <button onClick={() => setEditSlip(null)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[["workingDays", "Total Days"], ["presentDays", "Paid Days"], ["otherAllow", "Other Allowances (₹)"], ["otherDeduct", "Other Deductions (₹)"]].map(([k, label]) => (
                    <div key={k}>
                      <label className="label">{label}</label>
                      <input className="input" type="number" value={editSlip[k]}
                        onChange={e => setEditSlip((s: any) => ({ ...s, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="label">Payslip Date (Issue Date) <span className="text-red-400">*</span></label>
                    <input 
                      className="input" 
                      type="date" 
                      value={new Date(editSlip.generated).toISOString().split('T')[0]} 
                      onChange={e => setEditSlip((s: any) => ({ ...s, generatedDate: e.target.value, generated: e.target.value }))} 
                    />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-cream-dark">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[["Gross", `₹${Number(editSlip.grossSalary || 0).toFixed(0)}`, "text-blue-600"], ["Deductions", `₹${Number(editSlip.totalDeduct || 0).toFixed(0)}`, "text-red-500"], ["Net Pay", `₹${Number(editSlip.netSalary || 0).toFixed(0)}`, "text-emerald-600"]].map(([l, v, c]) => (
                      <div key={String(l)}>
                        <div className={`text-base font-black ${c}`}>{v}</div>
                        <div className="text-xs text-slate-400">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button type="submit" className="btn-primary flex-1 gap-2" disabled={genLoading}>
                  {genLoading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn-ghost flex-1" onClick={() => setEditSlip(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PREVIEW MODAL
      ══════════════════════════════════════════ */}
      {previewSlip && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreviewSlip(null)}>
          <div className="modal-box max-w-lg slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center"><Eye size={16} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-navy">Payslip Preview</h3>
                  <p className="text-xs text-slate-400">{previewSlip.employee?.name} · {previewSlip.month} {previewSlip.year}</p>
                </div>
              </div>
              <button onClick={() => setPreviewSlip(null)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-navy rounded-xl p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">{previewSlip.employee?.name?.[0]}</div>
                  <div>
                    <div className="font-bold">{previewSlip.employee?.name}</div>
                    <div className="text-xs text-white/60">{previewSlip.employee?.designation} · {previewSlip.employee?.department}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/10">
                  {[["Total Days", previewSlip.workingDays], ["Paid Days", previewSlip.presentDays], ["LOP Days", previewSlip.workingDays - previewSlip.presentDays]].map(([l, v]) => (
                    <div key={String(l)}><div className="text-lg font-black">{v}</div><div className="text-xs text-white/50">{l}</div></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Earnings</div>
                  {[["Basic", previewSlip.basic], ["HRA", previewSlip.hra], ["Transport", previewSlip.transport], ["Special Allow", previewSlip.specialAllow], ["Other Allow", previewSlip.otherAllow]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between text-xs py-0.5">
                      <span className="text-slate-500">{l}</span><span className="font-semibold">₹{Number(v).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold border-t border-blue-200 mt-2 pt-1.5">
                    <span className="text-blue-700">Gross</span><span className="text-blue-700">₹{Number(previewSlip.grossSalary).toFixed(0)}</span>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Deductions</div>
                  {[["EPF", previewSlip.epf], ["ESI", previewSlip.esi], ["TDS", previewSlip.tds], ["Other", previewSlip.otherDeduct]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between text-xs py-0.5">
                      <span className="text-slate-500">{l}</span><span className="font-semibold text-red-500">₹{Number(v).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold border-t border-red-200 mt-2 pt-1.5">
                    <span className="text-red-600">Total</span><span className="text-red-600">₹{Number(previewSlip.totalDeduct).toFixed(0)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-600 rounded-xl p-4 flex items-center justify-between">
                <span className="text-white font-bold">Net Salary</span>
                <span className="text-2xl font-black text-white">₹{Number(previewSlip.netSalary).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              {previewSlip.pdfUrl && (
                <a href={`https://hrm-6kly.onrender.com${previewSlip.pdfUrl}?token=${localStorage.getItem('fg_token')}`} target="_blank" rel="noreferrer"
                  className="btn-primary flex-1 gap-2 text-center justify-center">
                  <Download size={15} /> Download PDF
                </a>
              )}
              <button className="btn-sm bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 gap-1 flex-1 justify-center"
                onClick={() => { setPreviewSlip(null); openEmailModal(previewSlip); }}>
                <Mail size={14} /> Send Email
              </button>
              <button className="btn-ghost flex-1" onClick={() => setPreviewSlip(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SEND EMAIL MODAL
      ══════════════════════════════════════════ */}
      {emailSlip && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEmailSlip(null)}>
          <div className="modal-box max-w-md slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center"><Mail size={16} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-navy">Send Payslip by Email</h3>
                  <p className="text-xs text-slate-400">{emailSlip.employee?.name} · {emailSlip.month} {emailSlip.year}</p>
                </div>
              </div>
              <button onClick={() => setEmailSlip(null)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Summary card */}
              <div className="bg-slate-50 border border-cream-dark rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {emailSlip.employee?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy text-sm">{emailSlip.employee?.name}</div>
                  <div className="text-xs text-slate-400">{emailSlip.employee?.designation}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Net Salary</div>
                  <div className="font-black text-emerald-600 text-sm">₹{Number(emailSlip.netSalary).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
              <div>
                <label className="label">Send To (Email) <span className="text-red-400">*</span></label>
                <input
                  className="input"
                  type="email"
                  placeholder="employee@example.com"
                  value={emailAddress}
                  onChange={e => setEmailAddress(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">The payslip PDF will be attached to this email.</p>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-700">
                <strong>Note:</strong> Configure SMTP settings in backend <code className="bg-violet-100 px-1 rounded">.env</code> file:<br />
                <code>SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS</code>
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6 mt-2">
              {emailSlip.pdfUrl && (
                <button 
                  onClick={() => {
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://hrm-6kly.onrender.com/api").replace("/api", "");
                    window.open(`${baseUrl}${emailSlip.pdfUrl}?token=${localStorage.getItem('fg_token')}`, "_blank");
                  }}
                  className="btn-ghost flex-1 gap-2 border border-slate-200">
                  <Download size={15} /> Download PDF
                </button>
              )}
              <button className="btn-primary flex-[1.5] gap-2" onClick={handleSendEmail} disabled={emailSending}>
                <Mail size={15} /> {emailSending ? "Sending..." : "Send Email"}
              </button>
            </div>
            <div className="px-6 pb-4">
               <button className="btn-ghost w-full text-xs text-slate-400" onClick={() => setEmailSlip(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRow { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease both; }
      `}</style>
    </AppShell>
  );
}
