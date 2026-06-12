"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import clsx from "clsx";
import {
  FileText, Check, ChevronRight, ChevronLeft, Download,
  User, Mail, Phone, Calendar, IndianRupee, Search,
  Users, UserCheck, RefreshCw, Shield, Fingerprint,
  ArrowLeft, Globe, TrendingUp, LogOut, ShieldCheck,
  MapPin, Briefcase, Building2, ExternalLink, AlertCircle,
  CheckCircle2, Clock, UserPlus, Save, Eye, Pencil, X
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface UnifiedLetterGeneratorProps {
  initialType?: string;
  onBack?: () => void;
  editId?: string | null;
}

const ALL_STEPS = [
  { id: 1, label: "Recipient", icon: Users },
  { id: 2, label: "Document", icon: FileText },
  { id: 3, label: "Personal", icon: User },
  { id: 4, label: "Address", icon: MapPin },
  { id: 5, label: "Contact", icon: Phone },
  { id: 6, label: "Role", icon: Briefcase },
  { id: 7, label: "Terms", icon: Clock },
  { id: 8, label: "Salary", icon: IndianRupee },
  { id: 9, label: "Settlement", icon: ShieldCheck },
  { id: 10, label: "Authority", icon: Shield },
  { id: 11, label: "Review", icon: CheckCircle2 },
];

const LETTER_TYPES = [
  { id: "OFFER", label: "Offer Letter", cat: "BOTH", color: "bg-blue-600", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  { id: "PROBATION", label: "Probation Letter", cat: "EMPLOYEE", color: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
  { id: "INCREMENT", label: "Increment Letter", cat: "EMPLOYEE", color: "bg-amber-600", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  { id: "EXIT", label: "Exit Letter", cat: "EMPLOYEE", color: "bg-rose-600", light: "bg-rose-50", text: "text-rose-700", border: "border-rose-300" },
];

const inp = "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white placeholder:text-slate-300";
const sel = "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white";
const lbl = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

function F({ label, req, span, children }: { label: string; req?: boolean; span?: boolean; children: React.ReactNode }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <label className={lbl}>{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

const formatDate = (d: any) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

function OrgLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} target="_blank"
      className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 font-bold hover:underline ml-2">
      <ExternalLink size={9} />{label}
    </Link>
  );
}

const cleanName = (fullName: string) => {
  const PREFIXES = ["Mr.", "Ms.", "Mrs.", "Dr.", "mr.", "ms.", "mrs.", "dr.", "Mr", "Ms", "Mrs", "Dr"];
  let clean = (fullName || "").trim();
  let prefix = "Mr.";
  
  for (const p of PREFIXES) {
    const pattern = p.endsWith(".") ? p.toLowerCase() : p.toLowerCase() + ".";
    const lower = clean.toLowerCase();
    
    if (lower.startsWith(pattern) || (lower.startsWith(p.toLowerCase() + " ") && !p.endsWith("."))) {
      const matchLength = lower.startsWith(pattern) ? pattern.length : p.length;
      const rawPrefix = p.replace(/\.$/, "") + ".";
      
      // Normalize casing
      if (rawPrefix.toLowerCase() === "mr.") prefix = "Mr.";
      else if (rawPrefix.toLowerCase() === "ms.") prefix = "Ms.";
      else if (rawPrefix.toLowerCase() === "mrs.") prefix = "Mrs.";
      else if (rawPrefix.toLowerCase() === "dr.") prefix = "Dr.";
      else prefix = rawPrefix;

      clean = clean.slice(matchLength).trim();
      break;
    }
  }
  return { prefix, clean };
};

const INIT: Record<string, any> = {
  prefix: "Mr.", firstName: "", lastName: "", fatherName: "",
  gender: "Male", dob: "", aadhaar: "", pan: "", passport: "", uan: "", pfNumber: "",
  address1: "", address2: "", city: "", state: "", pinCode: "", country: "India",
  email: "", mobile: "", altMobile: "",
  department: "", designation: "", workLocation: "", manager: "", empType: "Full-time", mode: "Office",
  joiningDate: "", offerDate: "", offerExpiry: "", probationPeriod: "6",
  probationStart: "", probationEnd: "", performanceCriteria: "", confirmStatus: "Confirmed", reviewer: "", reviewNotes: "",
  confirmationDate: "",
  effectiveDate: "", incrementType: "Annual", reason: "",
  currentCtc: "", revisedCtc: "", incAmount: "", incPercentage: "",
  resignationDate: "", lastWorkingDay: "", exitType: "Resigned", exitReason: "",
  noticePeriod: "30", noticeServed: "Yes", noticePayRecovery: "0",
  leaveEncashment: "0", deductions: "0", finalAmount: "0",
  itClearance: "Yes", hrClearance: "Yes", assetReturn: "Completed",
  basicPct: "40", hraPct: "50", gratuityPct: "4.81", revisedCtcOffer: "",
  date: "", sigName: "", sigDesignation: "HR Manager", duration: "3",
  internshipStart: "", internshipEnd: "",
  includeEPF: "No", includeESI: "No", includePT: "No",
  bankName: "", accountNo: "", ifsc: "",
  empId: "", candidateId: "",
};

// ─── VISIBILITY RULES ─────────────────────────────────────────────────────────
// Each step is only visible when it has real content for the given letter type.
// Keeping this as a pure function (no closures) prevents stale-state bugs.
function visible(sid: number, lt: string): boolean {
  switch (sid) {
    case 7:
      // Terms: PROBATION has probation details, INCREMENT has appraisal, EXIT has exit details.
      // OFFER and INTERNSHIP skip it entirely (those fields live inside step 6).
      return lt !== "OFFER" && lt !== "INTERNSHIP";

    case 8:
      // Salary breakdown: only relevant for OFFER, INCREMENT and INTERNSHIP.
      return lt === "OFFER" || lt === "INCREMENT" || lt === "INTERNSHIP";

    case 9:
      // Settlement / Evaluation summary: EXIT needs F&F settlement, PROBATION needs evaluation summary.
      // INCREMENT, OFFER and INTERNSHIP have nothing here → skip.
      return lt === "EXIT" || lt === "PROBATION";

    default:
      return true;
  }
}

export default function UnifiedLetterGenerator({ initialType, onBack, editId: propEditId }: UnifiedLetterGeneratorProps) {
  const searchParams = useSearchParams();
  const editId = propEditId || searchParams.get("edit");

  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [category, setCategory] = useState(
    initialType && ["PROBATION", "INCREMENT", "EXIT"].includes(initialType || "") ? "EMPLOYEE" : "CANDIDATE"
  );
  const [letterType, setLetterType] = useState(initialType || "OFFER");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [genResult, setGenResult] = useState<any>(null);
  const [form, setForm] = useState({ ...INIT });
  const [isNewTarget, setIsNewTarget] = useState(false);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [ptRules, setPtRules] = useState<any[]>([]);
  const [salComps, setSalComps] = useState<any[]>([]);
  const [hraSettings, setHraSettings] = useState<any[]>([]);
  const [epfSettings, setEpfSettings] = useState<any[]>([]);
  const [basicPctSetting, setBasicPctSetting] = useState(40);
  const [gratuityPctSetting, setGratuityPctSetting] = useState(4.8);

  const visibleSteps = ALL_STEPS.filter(s => visible(s.id, letterType));

  // ─── VALIDATION ─────────────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    // Step 1: Recipient selection
    if (step === 1) {
      if (!selectedTarget) { alert("⚠️ Please select a recipient first."); return false; }
    }
    // Step 2: Document & Template
    if (step === 2) {
      if (!letterType) { alert("⚠️ Please select a letter type."); return false; }
      if (!selectedTemplate) { alert("⚠️ Please select a template."); return false; }
    }
    // Step 3: Personal Information
    if (step === 3) {
      if (!form.firstName.trim()) { alert("⚠️ First Name is required!"); return false; }
      if (category === "EMPLOYEE" && !form.lastName.trim()) { alert("⚠️ Last Name is required!"); return false; }
    }
    // Step 4: Residential Address
    if (step === 4) {
      if (!form.city.trim()) { alert("⚠️ City is required!"); return false; }
      if (!form.state.trim()) { alert("⚠️ State is required!"); return false; }
      if (!form.pinCode.trim()) { alert("⚠️ PIN Code is required!"); return false; }
    }
    // Step 5: Contact Information
    if (step === 5) {
      if (!form.email.trim()) { alert("⚠️ Email Address is required!"); return false; }
      if (!form.mobile.trim()) { alert("⚠️ Mobile Number is required!"); return false; }
    }
    // Step 6: Role & Organization
    if (step === 6) {
      if (!form.designation) { alert("⚠️ Designation is required!"); return false; }
      if (!form.department) { alert("⚠️ Department is required!"); return false; }
      if (!form.empType) { alert("⚠️ Employment Type is required!"); return false; }
      
      if (letterType === "OFFER") {
        if (["Internship", "Contract"].includes(form.empType)) {
          if (!form.internshipStart) { alert("⚠️ Effective From date is required!"); return false; }
          if (!form.internshipEnd) { alert("⚠️ Effective To date is required!"); return false; }
        } else {
          if (!form.joiningDate) { alert("⚠️ Date of Joining is required!"); return false; }
        }
        if (!form.offerDate) { alert("⚠️ Offer Date is required!"); return false; }
        if (!form.offerExpiry) { alert("⚠️ Offer Validity date is required!"); return false; }
      }
    }
    // Step 7: Terms (Conditional)
    if (step === 7) {
       if (letterType === "PROBATION") {
         if (!form.joiningDate) { alert("⚠️ Joining Date is required!"); return false; }
         if (!form.probationStart) { alert("⚠️ Probation Start Date is required!"); return false; }
         if (!form.probationEnd) { alert("⚠️ Probation End Date is required!"); return false; }
       } else if (letterType === "INCREMENT") {
         if (!form.effectiveDate) { alert("⚠️ Effective From Date is required!"); return false; }
       } else if (letterType === "EXIT") {
         if (!form.joiningDate) { alert("⚠️ Date of Joining is required!"); return false; }
         if (!form.resignationDate) { alert("⚠️ Resignation Date is required!"); return false; }
         if (!form.lastWorkingDay) { alert("⚠️ Last Working Day is required!"); return false; }
       }
    }
    // Step 8: Salary
    if (step === 8) {
      if (letterType === "OFFER" && !form.revisedCtcOffer) { alert("⚠️ Annual CTC is required!"); return false; }
      if (letterType === "INCREMENT") {
        if (!form.currentCtc) { alert("⚠️ Current Annual CTC is required!"); return false; }
        if (!form.revisedCtc) { alert("⚠️ Revised Annual CTC is required!"); return false; }
      }
    }
    // Step 9: Settlement / Evaluation
    if (step === 9) {
      if (letterType === "PROBATION") {
        if (!form.confirmationDate) { alert("⚠️ Formal Confirmation Date is required!"); return false; }
        if (!form.revisedCtcOffer) { alert("⚠️ Revised Annual CTC is required!"); return false; }
      }
    }
    // Step 10: Authority
    if (step === 10) {
      if (!form.date) { alert("⚠️ Document Issue Date is required!"); return false; }
      if (!form.sigName.trim()) { alert("⚠️ Signatory Name is required!"); return false; }
    }

    return true;
  };

  // Navigate forward: skip any invisible steps
  const nextStep = () => {
    if (!validateStep()) return;

    let n = step + 1;
    while (n <= 11 && !visible(n, letterType)) n++;
    setStep(Math.min(n, 11));
  };

  // Navigate backward: skip any invisible steps
  const prevStep = () => {
    let p = step - 1;
    while (p >= 1 && !visible(p, letterType)) p--;
    setStep(Math.max(p, 1));
  };

  // When letter type changes mid-wizard, if current step is now invisible jump to nearest visible step
  useEffect(() => {
    if (!visible(step, letterType)) {
      // Try going forward first, then backward
      let n = step + 1;
      while (n <= 11 && !visible(n, letterType)) n++;
      if (n <= 11) { setStep(n); return; }
      let p = step - 1;
      while (p >= 1 && !visible(p, letterType)) p--;
      setStep(Math.max(p, 1));
    }
  }, [letterType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      try {
        const [c, e, d, l, des, t, ptr, sc] = await Promise.all([
          api.get("/candidates"), api.get("/employees"),
          api.get("/company/departments"), api.get("/company/locations"),
          api.get("/company/designations"), api.get("/letters/templates"),
          api.get("/company/professional-tax"), api.get("/company/salary-components"),
        ]);
        const candidatesData = c.data || [];
        const employeesData = e.data || [];
        setCandidates(candidatesData); setEmployees(employeesData);
        setDepts(d.data || []); setLocs(l.data || []);
        setDesignations(des.data || []); setTemplates(t.data || []);
        setPtRules(ptr.data || []); setSalComps(sc.data || []);

        if (typeof window !== "undefined") {
          const h = localStorage.getItem("sc_hra");
          if (h) setHraSettings(JSON.parse(h));
          const e = localStorage.getItem("sc_epf");
          if (e) setEpfSettings(JSON.parse(e));
          const b = localStorage.getItem("sc_basic");
          if (b) {
            const val = JSON.parse(b)[0]?.value;
            if (val) {
              setBasicPctSetting(val);
              setForm(f => f.basicPct ? f : { ...f, basicPct: String(val) });
            }
          }
          const g = localStorage.getItem("sc_gratuity");
          if (g) {
            const val = JSON.parse(g)[0]?.value;
            if (val) {
              setGratuityPctSetting(val);
              setForm(f => f.gratuityPct ? f : { ...f, gratuityPct: String(val) });
            }
          }
          const d = localStorage.getItem("sc_deductions");
          if (d) {
            const deductionsArr = JSON.parse(d);
            const epfesi = deductionsArr.find((x: any) => x.id === "epfesi");
            if (epfesi) {
              setForm(f => ({ ...f, includeEPF: epfesi.checked ? "Yes" : "No", includeESI: epfesi.checked ? "Yes" : "No" }));
            }
          }
        }

        if (editId) {
          const res = await api.get(`/letters/${editId}`);
          if (res.data?.metadata) {
            setForm(f => ({ ...f, ...res.data.metadata }));
            setLetterType(res.data.type);
            setIsNewTarget(false);
            setStep(3);
          }
        } else {
          const targetId = searchParams.get("targetId");
          const targetType = searchParams.get("targetType")?.toUpperCase();
          if (targetId && targetType) {
            try {
              const endpoint = targetType === "CANDIDATE" ? `/candidates/${targetId}` : `/employees/${targetId}`;
              const res = await api.get(endpoint);
              const target = res.data;
              if (target) {
                setCategory(targetType as any);
                setSelectedTarget(target);
                const { prefix, clean } = cleanName(target.name || "");
                const n = clean.split(" ");
                setForm(f => ({
                  ...f,
                  prefix: prefix,
                  firstName: n[0] || "",
                  lastName: n.slice(1).join(" ") || "",
                  email: target.email || "",
                  mobile: target.phone || target.mobile || "",
                  designation: target.designation || target.position || "",
                  department: target.department || "",
                  empId: target.employeeId || "",
                  candidateId: target.candidateId || "",
                  workLocation: target.workLocation || target.location || "Tirupati",
                  address1: target.addressLine1 || target.address || "",
                  address2: target.addressLine2 || "",
                  city: target.city || "",
                  state: target.state || "",
                  pinCode: target.pincode || "",
                  country: target.country || "India",
                  dob: formatDate(target.dob),
                  gender: target.gender || "Male",
                  pan: target.pan || "",
                  aadhaar: target.aadhaar || "",
                  uan: target.uan || "",
                  pfNumber: target.pfNumber || "",
                  joiningDate: formatDate(target.joinDate || target.joiningDate),
                  currentCtc: target.salary ? String(target.salary * 12) : "",
                  basicPct: target.basicPct ? String(target.basicPct) : f.basicPct,
                  hraPct: target.hraPct ? String(target.hraPct) : f.hraPct,
                  gratuityPct: target.gratuityPct ? String(target.gratuityPct) : f.gratuityPct,
                  manualEpf: target.epfEmployee ? String(target.epfEmployee) : undefined,
                  manualEsi: target.esiEmployee ? String(target.esiEmployee) : undefined,
                  manualPt: target.ptOverride ? String(target.ptOverride) : undefined,
                  includeEPF: target.epfEmployee ? "Yes" : "No",
                  includeESI: target.esiEmployee ? "Yes" : "No",
                  includePT: target.ptOverride ? "Yes" : "No",
                  bankName: target.bankName || "",
                  accountNo: target.accountNo || "",
                  ifsc: target.ifsc || "",
                }));
                setIsNewTarget(false);
                setStep(2);
              }
            } catch (err) {
              console.error("Auto-fetch target failed", err);
            }
          }
        }
      } catch (err) { console.error(err); }
    })();
  }, [editId, searchParams]);

  const targetTemplates = useMemo(() => {
    if (letterType === "EXIT") return templates.filter(t => ["EXPERIENCE", "RELIEVING", "TERMINATION", "EXIT"].includes(t.type));
    return templates.filter(t => t.type === letterType);
  }, [letterType, templates]);

  useEffect(() => {
    const match = targetTemplates.find(t => t.isDefault) || targetTemplates[0];
    setSelectedTemplate(match || null);
  }, [letterType, targetTemplates]);

  const salary = useMemo(() => {
    // TREAT INPUT AS ANNUAL CTC (Cost to Company)
    let rawVal = Number(letterType === "INCREMENT" ? form.revisedCtc : form.revisedCtcOffer) || 0;
    // For Internships, the input is Monthly Stipend, so convert to Annual for the formula below
    if (letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship")) {
      rawVal = rawVal * 12;
    }
    const annualCTC = rawVal;
    
    // Monthly Gross = (Annual CTC) / (12 + (Basic% * Grat% / 100))
    // Simplification for reverse calculation: roughly divide by 12.048 if gratuity is 4.8% of basic (which is 40% of gross)
    // Actually, let's do it precisely:
    // Base parameters
    const bPSetting = salComps.find(c => c.name.toLowerCase() === "basic");
    const bP = Number(form.basicPct) ? (Number(form.basicPct) / 100) : (bPSetting ? (Number(bPSetting.value) / 100) : 0.40);
    
    const gPSetting = salComps.find(c => c.name.toLowerCase() === "gratuity");
    const gP = Number(form.gratuityPct) ? (Number(form.gratuityPct) / 100) : (gPSetting ? (Number(gPSetting.value) / 100) : 0.048);

    // Precise reverse calculation for Monthly Gross, accounting for flat manual employer contributions
    let fixedEmployerYearly = 0;
    if (form.includeEPF === "Yes" && form.manualEpf) fixedEmployerYearly += Number(form.manualEpf) * 12;
    if (form.includeESI === "Yes" && form.manualEsi) fixedEmployerYearly += Number(form.manualEsi) * 12;

    const isInt = letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship");
    const monthlyGross = isInt ? (Number(form.revisedCtcOffer) || 0) : (Math.max(0, (annualCTC - fixedEmployerYearly) / (12 * (1 + (bP * gP)))) || 0);
    
    const mBasic = monthlyGross * bP;
    
    // Dynamic Components from salComps
    const dynamicEarnings: { name: string; value: number }[] = [];
    let dynamicTotal = 0;

    // We process components in a specific order: Basic, HRA, then others
    // Start with Basic
    dynamicEarnings.push({ name: "Basic Salary", value: mBasic });
    dynamicTotal += mBasic;

    // Process HRA and others from settings
    let mHra = 0;
    salComps.forEach(c => {
      const lower = c.name.toLowerCase();
      if (!c.includeInLetter || lower === "basic" || lower === "gratuity" || lower === "epf" || lower === "esi") return;

      let val = 0;
      if (lower.includes("hra")) {
        val = mBasic * (Number(form.hraPct) / 100);
        mHra = val;
      } else if (c.calcType === "% of CTC") {
        val = monthlyGross * (Number(c.value) / 100);
      } else if (c.calcType === "% of Basic") {
        val = mBasic * (Number(c.value) / 100);
      } else if (lower.includes("transport")) {
        // Linked to settings amount
        val = Number(c.amount) || 0;
      } else if (c.amount) {
        val = Number(c.amount);
      }
      
      if (val > 0) {
        dynamicEarnings.push({ name: c.name, value: val });
        dynamicTotal += val;
      }
    });

    const mGratuity = mBasic * gP;
    const mSpec = Math.max(0, monthlyGross - dynamicTotal);

    // Deductions
    // Welfare Rules from settings
    const epfRule = epfSettings.find(r => (r.welfare || "").trim().toUpperCase() === "EPF") || { employee: 12.0, employer: 12.0 };
    const esiRule = epfSettings.find(r => (r.welfare || "").trim().toUpperCase() === "ESI") || { employee: 0.75, employer: 3.25 };

    const includeEPF = form.includeEPF === "Yes";
    const includeESI = form.includeESI === "Yes";
    const includePT = form.includePT === "Yes";

    const esiApplicable = includeESI;
    // Base rule values or manual flat overrides
    const mEsiEmp = esiApplicable ? (form.manualEsi ? Number(form.manualEsi) : Math.ceil(monthlyGross * (esiRule.employee / 100))) : 0;
    const mEsiEmpr = esiApplicable ? (form.manualEsi ? Number(form.manualEsi) : Math.ceil(monthlyGross * (esiRule.employer / 100))) : 0;
    const mEpfEmp = includeEPF ? (form.manualEpf ? Number(form.manualEpf) : Math.min(1800, mBasic * (epfRule.employee / 100))) : 0;
    const mEpfEmpr = includeEPF ? (form.manualEpf ? Number(form.manualEpf) : Math.min(1800, mBasic * (epfRule.employer / 100))) : 0;

    let mPT = 0;
    if (includePT) {
      if (form.manualPt) {
        mPT = Number(form.manualPt);
      } else {
        const stateRules = ptRules.filter(r => r.state === (form.state || ""));
        const rule = stateRules.find(r => monthlyGross >= r.payMin && monthlyGross <= r.payMax);
        mPT = rule ? rule.deduction : (stateRules.length > 0 ? 0 : (monthlyGross > 15000 ? 200 : 0));
      }
    }

    return {
      annual: { basic: mBasic * 12, grat: mGratuity * 12, spec: mSpec * 12, ctc: annualCTC },
      monthly: {
        basic: mBasic, hra: mHra, grat: mGratuity, spec: mSpec, ctc: monthlyGross,
        esiEmp: mEsiEmp, esiEmpr: mEsiEmpr, epfEmp: mEpfEmp, epfEmpr: mEpfEmpr, pt: mPT,
        dynamicEarnings
      },
    };
  }, [form.revisedCtcOffer, form.revisedCtc, form.basicPct, form.hraPct, form.gratuityPct, form.includeEPF, form.includeESI, form.includePT, form.state, letterType, salComps, ptRules, epfSettings, hraSettings, basicPctSetting, gratuityPctSetting, form.manualEpf, form.manualEsi, form.manualPt]);

  useEffect(() => {
    if (form.currentCtc && form.revisedCtc) {
      const diff = Number(form.revisedCtc) - Number(form.currentCtc);
      const pct = ((diff / Number(form.currentCtc)) * 100).toFixed(2);
      setForm(f => ({ ...f, incAmount: String(diff), incPercentage: pct }));
    }
  }, [form.currentCtc, form.revisedCtc]);

  useEffect(() => {
    if (form.workLocation) {
      // Find matching HRA % from settings
      const hraMatch = hraSettings.find(h => 
        h.city.toLowerCase() === form.workLocation.toLowerCase() || 
        h.state.toLowerCase() === form.workLocation.toLowerCase()
      );
      if (hraMatch) {
         setForm(f => ({ ...f, hraPct: String(hraMatch.hra) }));
      }
      
      // Find matching State from company locations for PT lookup
      const locMatch = locs.find(l => 
        l.city.toLowerCase() === form.workLocation.toLowerCase() ||
        l.state.toLowerCase() === form.workLocation.toLowerCase()
      );
      if (locMatch) {
        setForm(f => ({ ...f, state: locMatch.state }));
      }
    }
  }, [form.workLocation, hraSettings, locs]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const fmt = (n: number) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const stepIdx = visibleSteps.findIndex(s => s.id === step);
  const stepPct = Math.round(((stepIdx + 1) / visibleSteps.length) * 100);
  const ltConfig = LETTER_TYPES.find(t => t.id === letterType) || LETTER_TYPES[0];
  const filtered = (category === "CANDIDATE" ? candidates : employees)
    .filter(i => {
      const match = (i.name || "").toLowerCase().includes(search.toLowerCase());
      if (category === "CANDIDATE") {
        return match && i.stage !== "HIRED" && i.stage !== "REJECTED";
      }
      return match;
    });

  const handleSaveProfile = async () => {
    // Frontend validation for required fields
    if (!form.firstName.trim()) return alert("⚠️ First Name is required!");
    if (!form.email.trim()) return alert("⚠️ Email Address is required!");
    if (!form.mobile.trim()) return alert("⚠️ Mobile Number is required!");
    if (!form.designation) return alert("⚠️ Designation is required!");
    if (!form.department) return alert("⚠️ Department is required!");
    if (!form.city.trim() || !form.state.trim()) return alert("⚠️ City and State are required for official records!");
    if (!form.pinCode.trim()) return alert("⚠️ PIN Code is required!");

    // Additional checks for specific letter types
    if (letterType === "OFFER") {
      if (!form.joiningDate && !form.internshipStart) return alert("⚠️ Date of Joining/Beginning is required!");
      if (!form.offerDate) return alert("⚠️ Offer Date is required!");
      if (!form.offerExpiry) return alert("⚠️ Offer Validity Date is required!");
    } else if (letterType === "PROBATION") {
      if (!form.joiningDate) return alert("⚠️ Date of Joining is required!");
      if (!form.probationStart) return alert("⚠️ Probation Start Date is required!");
      if (!form.probationEnd) return alert("⚠️ Probation End Date is required!");
    } else if (letterType === "INCREMENT") {
      if (!form.effectiveDate) return alert("⚠️ Effective Date is required!");
    } else if (letterType === "EXIT") {
      if (!form.joiningDate) return alert("⚠️ Date of Joining is required!");
      if (!form.resignationDate) return alert("⚠️ Resignation Date is required!");
      if (!form.lastWorkingDay) return alert("⚠️ Last Working Day is required!");
    }

    if (!selectedTarget && !isNewTarget) return;
    setLoading(true);
    try {
      const payload: any = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.mobile,
        department: form.department,
        designation: form.designation,
        workLocation: form.workLocation,
        addressLine1: form.address1,
        addressLine2: form.address2,
        city: form.city,
        state: form.state,
        pincode: form.pinCode,
        country: form.country,
        dob: form.dob,
        gender: form.gender,
        pan: form.pan,
        aadhaar: form.aadhaar,
        basicPct: form.basicPct,
        hraPct: form.hraPct,
        gratuityPct: form.gratuityPct,
        epfEmployee: form.includeEPF === "Yes" ? (form.manualEpf ? Number(form.manualEpf) : undefined) : null,
        esiEmployee: form.includeESI === "Yes" ? (form.manualEsi ? Number(form.manualEsi) : undefined) : null,
        ptOverride: form.includePT === "Yes" ? (form.manualPt ? Number(form.manualPt) : undefined) : null,
      };

      if (category === "EMPLOYEE") {
        if (selectedTarget?.id && selectedTarget.id !== "NEW" && !isNewTarget) {
          await api.put(`/employees/${selectedTarget.id}`, payload);
          alert("✅ Employee profile updated successfully!");
        } else {
          // Create new employee if id is "NEW" OR isNewTarget is true
          const res = await api.post("/employees", { ...payload, joinDate: new Date().toISOString(), status: "ACTIVE" });
          setSelectedTarget(res.data);
          setIsNewTarget(false);
          alert("✅ New employee profile created and saved!");
        }
      } else {
        const candPayload = {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            position: form.designation,
            department: payload.department,
        };
        if (selectedTarget?.id && selectedTarget.id !== "NEW" && !isNewTarget) {
            await api.put(`/candidates/${selectedTarget.id}`, candPayload);
            alert("✅ Candidate details updated successfully!");
        } else {
            // Create new candidate if id is "NEW" OR isNewTarget is true
            const res = await api.post("/candidates", { ...candPayload, position: form.designation || "N/A" });
            setSelectedTarget(res.data);
            setIsNewTarget(false);
            alert("✅ New candidate profile created and saved!");
        }
      }
    } catch (err: any) {
        alert("❌ Failed to save profile updates. " + (err?.response?.data?.message || err.message));
    } finally {
        setLoading(false);
    }
  };

      const generate = async () => {
    setLoading(true);
    try {
      let targetId = selectedTarget?.id;

      // If this is a new person, create them first
      if (isNewTarget) {
        const payload: any = {
          name: `${form.prefix} ${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.mobile,
          department: form.department,
          status: "Active", // Note: backend sanitize() removes this if it's an employee, for candidate it was causing issues before so I'll put it in the logic below
        };

        if (category === "CANDIDATE") {
          delete payload.status; // Candidate doesn't have status
          payload.position = form.designation;
          payload.stage = "OFFER_SENT";
          payload.joiningDate = form.joiningDate || form.offerDate;
        } else {
          payload.designation = form.designation;
          payload.joinDate = form.joiningDate || new Date().toISOString();
          payload.workLocation = form.workLocation;
          payload.status = "ACTIVE";
          payload.addressLine1 = form.address1;
          payload.city = form.city;
          payload.state = form.state;
          payload.pincode = form.pinCode;
        }

        const createRes = await api.post(category === "CANDIDATE" ? "/candidates" : "/employees", payload);
        targetId = createRes.data.id;
      }

      const s = salary;
      const salaryData = (letterType === "OFFER" || letterType === "INCREMENT" || letterType === "PROBATION") ? {
        grossMonthly: s.monthly.ctc, monthlyCTC: s.monthly.ctc, annualCTC: s.annual.ctc,
        epf: s.monthly.epfEmpr,
        esi: s.monthly.esiEmpr,
        gratuity: s.monthly.grat,
        earnings: [
          ...(s.monthly.dynamicEarnings || []),
          ...(s.monthly.spec > 0 ? [{ name: "Special Allowance", value: s.monthly.spec }] : []),
        ].filter(e => Number(e.value) > 0),
        deductions: [
          ...(s.monthly.epfEmp > 0 ? [{ name: "Employee contribution to EPF", value: s.monthly.epfEmp }] : []),
          ...(s.monthly.esiEmp > 0 ? [{ name: "Employee contribution to ESI", value: s.monthly.esiEmp }] : []),
          ...(s.monthly.pt > 0 ? [{ name: "Professional Tax", value: s.monthly.pt }] : []),
        ],
        totalDeductions: s.monthly.epfEmp + s.monthly.esiEmp + s.monthly.pt,
        netMonthly: s.monthly.ctc - (s.monthly.epfEmp + s.monthly.esiEmp + s.monthly.pt),
        totalEmployer: s.monthly.epfEmpr + s.monthly.esiEmpr + s.monthly.grat,
      } : undefined;

      // Determine correct candidateId / employeeId — always use the freshly created targetId
      const finalCandidateId = category === "CANDIDATE" ? targetId : null;
      const finalEmployeeId  = category === "EMPLOYEE"  ? targetId : null;

      const res = await api.post("/letters/generate-advanced", {
        candidateId: finalCandidateId,
        employeeId: finalEmployeeId,
        type: letterType, templateId: selectedTemplate?.id, salaryData,
        data: {
          ...form, ...s.annual,
          revisedCtc: form.revisedCtcOffer || form.revisedCtc,
          validTill: form.offerExpiry,
          offerExpiry: form.offerExpiry,
          name: `${form.firstName} ${form.lastName}`.trim(),
          address: [form.address1, form.address2, form.city, form.state, form.pinCode].filter(Boolean).join(", "),
          location: form.workLocation,
          epfEmployerOverride: form.manualEpf || undefined,
          esiEmployerOverride: form.manualEsi || undefined,
          ptOverride: form.manualPt || undefined,
          // monthlyGross = net gross (after removing employer contributions) — NOT the full CTC budget
          monthlyGross: s.monthly.ctc,
          // Also send individual overrides so backend can write them to employee record
          epfEmployee: form.includeEPF === "Yes" ? (form.manualEpf ? Number(form.manualEpf) : undefined) : undefined,
          esiEmployee: form.includeESI === "Yes" ? (form.manualEsi ? Number(form.manualEsi) : undefined) : undefined,
          ptAmount: form.includePT === "Yes" ? (form.manualPt ? Number(form.manualPt) : undefined) : undefined,
          basicPct: form.basicPct,
          hraPct: form.hraPct,
          gratuityPct: form.gratuityPct,
          designation: form.designation,
          department: form.department,
          empType: form.empType,
        },
      });
      setGenResult(res.data);

      // Automatic stage update for candidates
      if (category === "CANDIDATE" && letterType === "OFFER") {
        try {
          await api.put(`/candidates/${targetId}/stage`, { stage: "OFFER_SENT" });
        } catch (e) { console.error("Stage update failed", e); }
      }

      setStep(99);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.response?.data?.message || "Generation failed.");
    } finally { setLoading(false); }
  };

  const preview = async () => {
    setLoading(true);
    try {
      const s = salary;
      const salaryData = (letterType === "OFFER" || letterType === "INCREMENT" || letterType === "PROBATION") ? {
        grossMonthly: s.monthly.ctc, monthlyCTC: s.monthly.ctc, annualCTC: s.annual.ctc,
        epf: s.monthly.epfEmpr,
        esi: s.monthly.esiEmpr,
        gratuity: s.monthly.grat,
        earnings: [
          ...(s.monthly.dynamicEarnings || []),
          ...(s.monthly.spec > 0 ? [{ name: "Special Allowance", value: s.monthly.spec }] : []),
        ].filter(e => Number(e.value) > 0),
        deductions: [
          ...(s.monthly.epfEmp > 0 ? [{ name: "Employee contribution to EPF", value: s.monthly.epfEmp }] : []),
          ...(s.monthly.esiEmp > 0 ? [{ name: "Employee contribution to ESI", value: s.monthly.esiEmp }] : []),
          ...(s.monthly.pt > 0 ? [{ name: "Professional Tax", value: s.monthly.pt }] : []),
        ],
        totalDeductions: s.monthly.epfEmp + s.monthly.esiEmp + s.monthly.pt,
        netMonthly: s.monthly.ctc - (s.monthly.epfEmp + s.monthly.esiEmp + s.monthly.pt),
        totalEmployer: s.monthly.epfEmpr + s.monthly.esiEmpr + s.monthly.grat,
      } : undefined;

      const res = await api.post("/letters/preview", {
        type: letterType, 
        templateId: selectedTemplate?.id, 
        salaryData,
        data: {
          ...form, ...s.annual,
          revisedCtc: form.revisedCtcOffer || form.revisedCtc,
          validTill: form.offerExpiry,
          offerExpiry: form.offerExpiry,
          name: `${form.firstName} ${form.lastName}`.trim(),
          address: [form.address1, form.address2, form.city, form.state, form.pinCode].filter(Boolean).join(", "),
          location: form.workLocation,
          epfEmployerOverride: form.manualEpf || undefined,
          esiEmployerOverride: form.manualEsi || undefined,
          ptOverride: form.manualPt || undefined,
          monthlyGross: s.monthly.ctc,
          basicPct: form.basicPct,
          hraPct: form.hraPct,
          gratuityPct: form.gratuityPct,
          designation: form.designation,
          department: form.department,
          empType: form.empType,
        },
      });
      window.open(`${(process.env.NEXT_PUBLIC_API_URL || "https://fingrowhrm.info/api").replace("/api", "")}${res.data.pdfUrl}?token=${localStorage.getItem('token')}`, '_blank');
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.response?.data?.message || "Preview failed.");
    } finally { setLoading(false); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm text-sm font-black", ltConfig.color)}>
            <FileText size={16} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">{ltConfig.label} Generator</h1>
            <p className="text-[11px] text-slate-400">Fingrow Consulting Services • HR Document System</p>
          </div>
        </div>
        <span className={clsx("px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", ltConfig.light, ltConfig.text, ltConfig.border, "border")}>
          {ltConfig.label}
        </span>
      </div>

      {/* Progress */}
      {step <= 11 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              {stepIdx >= 0 ? visibleSteps[stepIdx]?.label : ""} • Step {stepIdx + 1} of {visibleSteps.length}
            </span>
            <span className="text-[11px] font-black text-slate-400">{stepPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mb-3">
            <div className={clsx("h-1 rounded-full transition-all duration-500", ltConfig.color)} style={{ width: `${stepPct}%` }} />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {visibleSteps.map((s, idx) => {
              const done = idx < stepIdx, active = s.id === step;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <div className={clsx(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                    done ? "bg-emerald-50 text-emerald-600"
                      : active ? clsx(ltConfig.light, ltConfig.text)
                        : "text-slate-300"
                  )}>
                    {done ? <Check size={10} /> : <s.icon size={10} />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {idx < visibleSteps.length - 1 && (
                    <div className={clsx("w-3 h-px mx-0.5", done ? "bg-emerald-200" : "bg-slate-100")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {step <= 11 && <div className={clsx("h-0.5", ltConfig.color)} />}

        <div className="p-7">

          {/* ── STEP 1 — RECIPIENT ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Who is this letter for?</h2>
                <p className="text-sm text-slate-400 mt-0.5">Select recipient type and choose from the list below</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "CANDIDATE", label: "Candidate", sub: "New hire / pre-joining", icon: Users },
                  { id: "EMPLOYEE", label: "Employee", sub: "Existing staff member", icon: UserCheck },
                ].map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    className={clsx("p-4 rounded-xl border-2 text-left transition-all",
                      category === c.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white")}>
                    <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center mb-2.5",
                      category === c.id ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400")}>
                      <c.icon size={16} />
                    </div>
                    <div className="font-black text-slate-800 text-sm">{c.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{c.sub}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input className={clsx(inp, "pl-10")} placeholder={`Search ${category.toLowerCase()}s by name...`}
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button
                  onClick={() => {
                    setIsNewTarget(true);
                    setSelectedTarget({ id: "NEW", name: "New " + category });
                    setForm({ ...INIT });
                    setStep(2);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  <UserPlus size={16} />
                  <span>Create New</span>
                </button>
              </div>

              {filtered.length === 0 && search ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No {category.toLowerCase()}s found</h3>
                  <p className="text-[11px] text-slate-400 mt-1 mb-4">We couldn't find anyone matching your search.</p>
                  <button
                    onClick={() => {
                      setIsNewTarget(true);
                      setSelectedTarget({ id: "NEW", name: "New " + category });
                      setForm({ ...INIT });
                      setStep(2);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Click here to create a new {category.toLowerCase()} instead
                  </button>
                </div>
              ) : filtered.length === 0 && !search ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                  <AlertCircle size={15} className="text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-700">No {category.toLowerCase()}s found in the database</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Please search for one or use the <b>Create New</b> button above.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 max-h-56 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                  {filtered.map(item => (
                    <button key={item.id}
                      onClick={async () => {
                        try {
                          const endpoint = category === "CANDIDATE" ? `/candidates/${item.id}` : `/employees/${item.id}`;
                          const res = await api.get(endpoint);
                          const target = res.data;
                          if (target) {
                            const { prefix, clean } = cleanName(target.name || "");
                            const n = clean.split(" ");
                            setSelectedTarget(target);
                            setIsNewTarget(false);
                            setForm(f => ({
                              ...f,
                              prefix: prefix,
                              firstName: n[0] || "",
                              lastName: n.slice(1).join(" ") || "",
                              email: target.email || "",
                              mobile: target.phone || target.mobile || "",
                              designation: target.designation || target.position || "",
                              department: target.department || "",
                              empId: target.employeeId || "",
                              candidateId: target.candidateId || "",
                              workLocation: target.workLocation || target.location || "Tirupati",
                              address1: target.addressLine1 || target.address || "",
                              address2: target.addressLine2 || "",
                              city: target.city || "",
                              state: target.state || "",
                              pinCode: target.pincode || "",
                              country: target.country || "India",
                              dob: formatDate(target.dob),
                              gender: target.gender || "Male",
                              pan: target.pan || "",
                              aadhaar: target.aadhaar || "",
                              joiningDate: formatDate(target.joinDate || target.joiningDate),
                              currentCtc: target.salary ? String(target.salary * 12) : "",
                              basicPct: target.basicPct ? String(target.basicPct) : f.basicPct,
                              hraPct: target.hraPct ? String(target.hraPct) : f.hraPct,
                              gratuityPct: target.gratuityPct ? String(target.gratuityPct) : f.gratuityPct,
                              manualEpf: target.epfEmployee ? String(target.epfEmployee) : undefined,
                              manualEsi: target.esiEmployee ? String(target.esiEmployee) : undefined,
                              manualPt: target.ptOverride ? String(target.ptOverride) : undefined,
                              includeEPF: target.epfEmployee ? "Yes" : "No",
                              includeESI: target.esiEmployee ? "Yes" : "No",
                              includePT: target.ptOverride ? "Yes" : "No",
                            }));
                            setStep(2);
                          }
                        } catch (err) {
                          console.error("Manual fetch target failed", err);
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50/50 transition-all group text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-sm shrink-0">
                          {(cleanName(item.name || "").clean || "?")[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{cleanName(item.name || "").clean}</div>
                          <div className="text-[11px] text-slate-400">{item.email}{item.designation ? ` • ${item.designation}` : ""}</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2 — DOCUMENT ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Document Type & Template</h2>
                <p className="text-sm text-slate-400 mt-0.5">Select the letter type and branding template to use</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LETTER_TYPES.filter(t => t.cat === category || t.cat === "BOTH").map(t => (
                  <button key={t.id} onClick={() => setLetterType(t.id)}
                    className={clsx("p-4 rounded-xl border-2 text-left transition-all",
                      letterType === t.id ? clsx(t.border, t.light) : "border-slate-200 hover:border-slate-300 bg-white")}>
                    <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2.5", t.color)}>
                      <FileText size={15} />
                    </div>
                    <div className="font-black text-slate-800 text-sm">{t.label}</div>
                    {letterType === t.id && <div className={clsx("text-[10px] font-bold mt-1", t.text)}>Selected ✓</div>}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className={lbl + " mb-0"}>Letter Template</label>
                  </div>
                {targetTemplates.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
                    No templates for {letterType}. Create one in Organization → Letter Templates.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {targetTemplates.map(t => (
                      <button key={t.id} onClick={() => setSelectedTemplate(t)}
                        className={clsx("w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all",
                          selectedTemplate?.id === t.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300")}>
                        <div>
                          <div className="font-black text-slate-800 text-sm">{t.name}</div>
                  {t.isDefault && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1 inline-block">
                              Default
                            </span>
                          )}
                        </div>
                        {selectedTemplate?.id === t.id
                          ? <Check size={15} className="text-blue-500" />
                          : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3 — PERSONAL ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Personal Information</h2>
                <p className="text-sm text-slate-400 mt-0.5">Basic identity details for the document</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 grid grid-cols-5 gap-3">
                  <div className="col-span-1">
                    <label className={lbl}>Prefix</label>
                    <select className={sel} value={form.prefix} onChange={e => set("prefix", e.target.value)}>
                      <option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>First Name <span className="text-red-500">*</span></label>
                    <input className={inp} placeholder="First Name" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Last Name <span className="text-red-500">*</span></label>
                    <input className={inp} placeholder="Last Name" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                  </div>
                </div>
                <F label="Father's / Guardian Name">
                  <input className={inp} placeholder="As per official records" value={form.fatherName} onChange={e => set("fatherName", e.target.value)} />
                </F>
                <F label="Date of Birth" req>
                  <input type="date" className={inp} value={form.dob} onChange={e => set("dob", e.target.value)} />
                </F>
                <F label="Gender">
                  <select className={sel} value={form.gender} onChange={e => set("gender", e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </F>
                <F label={`${category === "CANDIDATE" ? "Candidate" : "Employee"} ID`}>
                   <input className={clsx(inp, "bg-slate-50 font-mono text-slate-400")} readOnly
                     value={category === "CANDIDATE" ? form.candidateId : form.empId} />
                </F>
              </div>
            </div>
          )}

          {/* ── STEP 4 — ADDRESS ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Residential Address</h2>
                <p className="text-sm text-slate-400 mt-0.5">Mailing and permanent address for records</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Address Line 1" span><input className={inp} placeholder="House No., Street, Area" value={form.address1} onChange={e => set("address1", e.target.value)} /></F>
                <F label="Address Line 2 (Optional)" span><input className={inp} placeholder="Landmark, Locality" value={form.address2} onChange={e => set("address2", e.target.value)} /></F>
                <F label="City" req><input className={inp} value={form.city} onChange={e => set("city", e.target.value)} required /></F>
                <F label="State" req><input className={inp} value={form.state} onChange={e => set("state", e.target.value)} required /></F>
                <F label="PIN Code" req><input className={clsx(inp, "font-mono tracking-widest")} maxLength={6} value={form.pinCode} onChange={e => set("pinCode", e.target.value)} required /></F>

                <F label="Country"> <input className={inp} value={form.country} onChange={e => set("country", e.target.value)} /></F>
              </div>
            </div>
          )}

          {/* ── STEP 5 — CONTACT ─────────────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Contact Information</h2>
                <p className="text-sm text-slate-400 mt-0.5">Email and phone for official communication</p>
              </div>
              <div className="space-y-4">
                <F label="Email Address" req>
                  <div className="relative">
                    <input type="email" className={clsx(inp, "pl-9")} value={form.email} onChange={e => set("email", e.target.value)} />
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </F>
                <F label="Primary Mobile" req>
                  <div className="relative">
                    <input className={clsx(inp, "pl-9 font-mono")} placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={e => set("mobile", e.target.value)} />
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </F>
                <F label="Alternate Mobile">
                  <div className="relative">
                    <input className={clsx(inp, "pl-9 font-mono")} value={form.altMobile} onChange={e => set("altMobile", e.target.value)} />
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </F>
              </div>
            </div>
          )}

          {/* ── STEP 6 — ROLE ────────────────────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Role & Organization</h2>
                <p className="text-sm text-slate-400 mt-0.5">Department, designation, and reporting details</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Designation" req span>
                  <select className={sel} value={form.designation} onChange={e => set("designation", e.target.value)}>
                    <option value="">-- Select Designation --</option>
                    {designations.map(d => <option key={d.id} value={d.title}>{d.title}</option>)}
                  </select>
                  {designations.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1 font-bold">
                      No designations found. Please configure them in settings.
                    </p>
                  )}
                </F>
                <F label="Department" req>
                  <select className={sel} value={form.department} onChange={e => set("department", e.target.value)}>
                    <option value="">-- Select --</option>
                    {depts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </F>
                <F label="Work Location">
                  <select className={sel} value={form.workLocation} onChange={e => set("workLocation", e.target.value)}>
                    <option value="">-- Select --</option>
                    {locs.map(l => <option key={l.id} value={l.city}>{l.city}{l.state ? `, ${l.state}` : ""}</option>)}
                  </select>
                </F>
                <F label="Reporting Manager">
                  <input className={inp} placeholder="Manager name" value={form.manager} onChange={e => set("manager", e.target.value)} />
                </F>
                <F label="Employment Type" req>
                  <select className={sel} value={form.empType} onChange={e => set("empType", e.target.value)}>
                    <option>Full-time</option><option>Internship</option><option>Contract</option><option>Part-time</option>
                  </select>
                </F>
                {(form.empType === "Internship" || letterType === "INTERNSHIP") && (
                  <F label="Internship Duration (Months)">
                    <input type="number" className={inp} value={form.duration} onChange={e => set("duration", e.target.value)} />
                  </F>
                )}
                <F label="Work Mode">
                  <select className={sel} value={form.mode} onChange={e => set("mode", e.target.value)}>
                    <option>Office</option><option>Remote</option><option>Hybrid</option>
                  </select>
                </F>
                {/* OFFER-specific role fields — joining dates, probation live here */}
                {(letterType === "OFFER" || letterType === "INTERNSHIP") && (<>
                  {["Internship", "Contract"].includes(form.empType) || letterType === "INTERNSHIP" ? (
                    <>
                      <F label="Effective From" req>
                        <input type="date" className={inp} value={form.internshipStart} onChange={e => set("internshipStart", e.target.value)} />
                      </F>
                      <F label="Effective To" req>
                        <input type="date" className={inp} value={form.internshipEnd} onChange={e => set("internshipEnd", e.target.value)} />
                      </F>
                    </>
                  ) : (
                    <F label="Date of Joining" req>
                      <input type="date" className={inp} value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)} />
                    </F>
                  )}
                  <F label="Offer Date" req>
                    <input type="date" className={inp} value={form.offerDate} onChange={e => set("offerDate", e.target.value)} />
                  </F>
                  <F label="Offer Valid Till" req>
                    <input type="date" className={inp} value={form.offerExpiry} onChange={e => set("offerExpiry", e.target.value)} />
                  </F>
                  <F label="Probation Period">
                    <select className={sel} value={form.probationPeriod} onChange={e => set("probationPeriod", e.target.value)}>
                      <option value="3">3 Months</option><option value="6">6 Months</option>
                      <option value="12">12 Months</option><option value="0">None</option>
                    </select>
                  </F>
                </>)}
              </div>
            </div>
          )}

          {/* ── STEP 7 — TERMS ───────────────────────────────────────────── */}
          {/* Completely absent from visibleSteps for OFFER, so nextStep/prevStep never lands here for OFFER. */}
          {/* Each block is independently conditioned to ensure no blank render. */}

          {step === 7 && letterType === "PROBATION" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Probation Details</h2>
                <p className="text-sm text-slate-400 mt-0.5">Review period and evaluation outcome</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Date of Joining" req>
                  <input type="date" className={inp} value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)} />
                </F>
                <F label="Probation Period">
                  <select className={sel} value={form.probationPeriod} onChange={e => set("probationPeriod", e.target.value)}>
                    <option value="3">3 Months</option><option value="6">6 Months</option><option value="12">12 Months</option>
                  </select>
                </F>
                <F label="Probation Start Date" req>
                  <input type="date" className={inp} value={form.probationStart} onChange={e => set("probationStart", e.target.value)} />
                </F>
                <F label="Probation End Date" req>
                  <input type="date" className={inp} value={form.probationEnd} onChange={e => set("probationEnd", e.target.value)} />
                </F>
                <div className="col-span-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Evaluation Outcome</div>
                    <div className="text-sm font-bold text-emerald-600 mt-1">Confirmed Placement</div>
                  </div>
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                </div>
                <F label="Reviewer Name">
                  <input className={inp} value={form.reviewer} onChange={e => set("reviewer", e.target.value)} />
                </F>
                <F label="Performance Notes" span>
                  <textarea className={clsx(inp, "min-h-[90px] resize-none")} placeholder="Key deliverables and observations..."
                    value={form.performanceCriteria} onChange={e => set("performanceCriteria", e.target.value)} />
                </F>
              </div>
            </div>
          )}

          {step === 7 && letterType === "INCREMENT" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Appraisal Details</h2>
                <p className="text-sm text-slate-400 mt-0.5">Performance and revision information</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Effective From Date" req>
                  <input type="date" className={inp} value={form.effectiveDate} onChange={e => set("effectiveDate", e.target.value)} />
                </F>
                <F label="Increment Type">
                  <select className={sel} value={form.incrementType} onChange={e => set("incrementType", e.target.value)}>
                    <option>Annual</option>
                  </select>
                </F>
                <F label="Reason / Feedback" span>
                  <textarea className={clsx(inp, "min-h-[90px] resize-none")} placeholder="Performance summary and reason..."
                    value={form.reason} onChange={e => set("reason", e.target.value)} />
                </F>
              </div>
            </div>
          )}

          {step === 7 && letterType === "EXIT" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Exit Details</h2>
                <p className="text-sm text-slate-400 mt-0.5">Separation and departure information</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Date of Joining" req>
                  <input type="date" className={inp} value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)} />
                </F>
                <F label="Resignation Date" req>
                  <input type="date" className={inp} value={form.resignationDate} onChange={e => set("resignationDate", e.target.value)} />
                </F>
                <F label="Last Working Day" req>
                  <input type="date" className={inp} value={form.lastWorkingDay} onChange={e => set("lastWorkingDay", e.target.value)} />
                </F>

                <F label="Notice Period (Days)">
                  <input type="number" className={inp} value={form.noticePeriod} onChange={e => set("noticePeriod", e.target.value)} />
                </F>
                <F label="Notice Served">
                  <select className={sel} value={form.noticeServed} onChange={e => set("noticeServed", e.target.value)}>
                    <option>Yes</option><option>No</option><option>Partial</option>
                  </select>
                </F>
                <F label="Reason for Exit" span>
                  <textarea className={clsx(inp, "min-h-[80px] resize-none")} value={form.exitReason} onChange={e => set("exitReason", e.target.value)} />
                </F>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <label className={lbl + " mb-3"}>Clearance Status</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: "IT Clearance", k: "itClearance" },
                      { l: "HR Clearance", k: "hrClearance" },
                      { l: "Asset Return", k: "assetReturn" },
                    ].map(({ l, k }) => (
                      <div key={k}>
                        <label className={lbl}>{l}</label>
                        <select className={sel} value={(form as any)[k]} onChange={e => set(k, e.target.value)}>
                          <option value="Yes">Completed</option><option value="No">Not Done</option><option value="Pending">Pending</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 8 — SALARY (OFFER, INTERNSHIP & INCREMENT) ─────────── */}
          {step === 8 && (letterType === "OFFER" || letterType === "INTERNSHIP" || (letterType === "OFFER" && form.empType === "Internship")) && (
            <div className="space-y-5">
              {(letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship")) ? (
                <>
                  <div>
                    <h2 className="text-xl font-black text-indigo-800">Stipend Details</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Fixed monthly allowance for the internship</p>
                  </div>
                  <div className="p-6 bg-indigo-50/50 rounded-2xl border-2 border-indigo-200 shadow-xl shadow-indigo-500/5">
                    <label className={clsx(lbl, "text-indigo-600 mb-3")}>Monthly Stipend Amount (INR) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <IndianRupee size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                      <input type="number" className={clsx(inp, "pl-12 h-16 text-2xl font-black border-indigo-300 focus:ring-indigo-500/20 focus:border-indigo-500")} placeholder="e.g. 15000"
                        value={form.revisedCtcOffer} onChange={e => set("revisedCtcOffer", e.target.value)} />
                    </div>
                    <p className="text-[10px] text-indigo-500/70 mt-4 font-bold italic leading-relaxed">
                      Note: This amount will be processed as a fixed monthly stipend. 
                      Statutory components like EPF, ESI, and HRA percentages are typically not applicable for interns.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Compensation Package</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Annual CTC and auto-calculated component breakdown</p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <label className={clsx(lbl, "text-blue-600 mb-3")}>Annual CTC (Cost to Company) <span className="text-red-500">*</span></label>
                      <div className="relative mb-4">
                        <IndianRupee size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input type="number" className={clsx(inp, "pl-10 h-12 text-lg font-black")} placeholder="e.g. 350000"
                          value={form.revisedCtcOffer} onChange={e => set("revisedCtcOffer", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                        <div className="col-span-2">
                           <label className={lbl}>Work Location (for this letter)</label>
                           <input className={inp} placeholder="e.g. Tirupati" value={form.workLocation} onChange={e => set("workLocation", e.target.value)} />
                        </div>
                        {[{ l: "Basic %", k: "basicPct" }, { l: "HRA %", k: "hraPct" }, { l: "Gratuity %", k: "gratuityPct" }].map(({ l, k }) => (
                          <div key={k}>
                            <label className={clsx(lbl, "text-[10px] mb-1")}>{l}</label>
                            <input className={inp} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-200">
                        <div className="space-y-3">
                          <div>
                            <label className={lbl}>Include EPF</label>
                            <select className={sel} value={form.includeEPF} onChange={e => set("includeEPF", e.target.value)}>
                              <option>No</option><option>Yes</option>
                            </select>
                          </div>
                          {form.includeEPF === "Yes" && (
                            <div>
                              <label className={clsx(lbl, "text-[10px]")}>Manual EPF ₹/mo (Optional)</label>
                              <input type="number" className={inp} placeholder="e.g. 1800" value={form.manualEpf || ""} onChange={e => set("manualEpf", e.target.value)} />
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className={lbl}>Include ESI</label>
                            <select className={sel} value={form.includeESI} onChange={e => set("includeESI", e.target.value)}>
                              <option>No</option><option>Yes</option>
                            </select>
                          </div>
                          {form.includeESI === "Yes" && (
                            <div>
                              <label className={clsx(lbl, "text-[10px]")}>Manual ESI ₹/mo (Optional)</label>
                              <input type="number" className={inp} placeholder="e.g. 300" value={form.manualEsi || ""} onChange={e => set("manualEsi", e.target.value)} />
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className={lbl}>Professional Tax</label>
                            <select className={sel} value={form.includePT} onChange={e => set("includePT", e.target.value)}>
                              <option>No</option><option>Yes</option>
                            </select>
                          </div>
                          {form.includePT === "Yes" && (
                            <div>
                              <label className={clsx(lbl, "text-[10px]")}>Manual PT ₹/mo (Optional)</label>
                              <input type="number" className={inp} placeholder="e.g. 200" value={form.manualPt || ""} onChange={e => set("manualPt", e.target.value)} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {salary.annual.ctc > 0 && (
                      <div className="p-5 bg-slate-800 rounded-xl text-white">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Monthly Breakdown (Auto-calculated)</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { l: "Basic Salary", v: salary.monthly.basic },
                            { l: "House Rent Allowance", v: salary.monthly.hra },
                            { l: "Special Allowances", v: salary.monthly.spec },
                            { l: "Gross Monthly", v: salary.monthly.ctc, hi: true },
                          ].map(({ l, v, hi }) => (
                            <div key={l} className="flex justify-between items-center py-1.5 border-b border-white/5">
                              <span className="text-[11px] text-white/50 font-bold">{l}</span>
                              <span className={clsx("font-mono font-black text-sm", hi ? "text-blue-400" : "text-white")}>₹{fmt(v)}</span>
                            </div>
                          ))}
                          {(salary.monthly.epfEmpr > 0 || salary.monthly.esiEmpr > 0 || salary.monthly.pt > 0) && (
                            <>
                              <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-red-400/80 mt-2 mb-1">Deductions / Statutory</div>
                              {[
                                { l: "EPF (Employer)", v: salary.monthly.epfEmpr },
                                { l: "ESI (Employer)", v: salary.monthly.esiEmpr },
                                { l: "Professional Tax", v: salary.monthly.pt },
                              ].filter(x => x.v > 0).map(({ l, v }) => (
                                <div key={l} className="flex justify-between items-center py-1.5 border-b border-red-500/10">
                                  <span className="text-[11px] text-red-200/50 font-bold">{l}</span>
                                  <span className="font-mono font-black text-sm text-red-300">₹{fmt(v)}</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {step === 8 && letterType === "INCREMENT" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Salary Revision</h2>
                <p className="text-sm text-slate-400 mt-0.5">Current and revised CTC details</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <label className={clsx(lbl, "mb-2")}>Current Annual CTC <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input type="number" className={clsx(inp, "pl-7")} value={form.currentCtc} onChange={e => set("currentCtc", e.target.value)} />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-300">
                    <label className={clsx(lbl, "mb-2 text-blue-600")}>Revised Annual CTC <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-sm">₹</span>
                      <input type="number" className={clsx(inp, "pl-7 border-blue-300")} value={form.revisedCtc} onChange={e => set("revisedCtc", e.target.value)} />
                    </div>
                  </div>
                </div>
                {form.incPercentage && (
                  <div className="p-5 bg-slate-800 rounded-xl text-white flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Increment</div>
                      <div className="text-2xl font-black text-blue-400 mt-1">{form.incPercentage}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Amount</div>
                      <div className="text-xl font-black mt-1">₹{Number(form.incAmount).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                )}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className={lbl}>Component Split</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[{ l: "Basic %", k: "basicPct" }, { l: "HRA %", k: "hraPct" }, { l: "Gratuity %", k: "gratuityPct" }].map(({ l, k }) => (
                      <div key={k}>
                        <label className={clsx(lbl, "text-[10px] mb-1")}>{l}</label>
                        <input className={inp} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── EPF / ESI / PT Section (same as Offer Letter) ── */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className={lbl}>Statutory Deductions</label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="space-y-3">
                      <div>
                        <label className={lbl}>Include EPF</label>
                        <select className={sel} value={form.includeEPF} onChange={e => set("includeEPF", e.target.value)}>
                          <option>No</option><option>Yes</option>
                        </select>
                      </div>
                      {form.includeEPF === "Yes" && (
                        <div>
                          <label className={clsx(lbl, "text-[10px]")}>EPF Amount ₹/mo</label>
                          <input type="number" className={inp} placeholder="e.g. 1800" value={form.manualEpf || ""} onChange={e => set("manualEpf", e.target.value)} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className={lbl}>Include ESI</label>
                        <select className={sel} value={form.includeESI} onChange={e => set("includeESI", e.target.value)}>
                          <option>No</option><option>Yes</option>
                        </select>
                      </div>
                      {form.includeESI === "Yes" && (
                        <div>
                          <label className={clsx(lbl, "text-[10px]")}>ESI Amount ₹/mo</label>
                          <input type="number" className={inp} placeholder="e.g. 300" value={form.manualEsi || ""} onChange={e => set("manualEsi", e.target.value)} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className={lbl}>Professional Tax</label>
                        <select className={sel} value={form.includePT} onChange={e => set("includePT", e.target.value)}>
                          <option>No</option><option>Yes</option>
                        </select>
                      </div>
                      {form.includePT === "Yes" && (
                        <div>
                          <label className={clsx(lbl, "text-[10px]")}>PT Amount ₹/mo</label>
                          <input type="number" className={inp} placeholder="e.g. 200" value={form.manualPt || ""} onChange={e => set("manualPt", e.target.value)} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {salary.annual.ctc > 0 && (
                  <div className="p-5 bg-slate-800 rounded-xl text-white">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Monthly Breakdown (Revised)</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { l: "Basic Salary", v: salary.monthly.basic },
                        { l: "House Rent Allowance", v: salary.monthly.hra },
                        { l: "Special Allowance", v: salary.monthly.spec },
                        { l: "Gross Monthly", v: salary.monthly.ctc, hi: true },
                      ].map(({ l, v, hi }) => (
                        <div key={l} className="flex justify-between items-center py-1.5 border-b border-white/5">
                          <span className="text-[11px] text-white/50 font-bold">{l}</span>
                          <span className={clsx("font-mono font-black text-sm", hi ? "text-blue-400" : "text-white")}>₹{fmt(v)}</span>
                        </div>
                      ))}
                      {(salary.monthly.epfEmp > 0 || salary.monthly.esiEmp > 0 || salary.monthly.pt > 0) && (
                        <>
                          <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-red-400/80 mt-2 mb-1">Deductions</div>
                          {[
                            { l: "EPF (Employee)", v: salary.monthly.epfEmp },
                            { l: "ESI (Employee)", v: salary.monthly.esiEmp },
                            { l: "Professional Tax", v: salary.monthly.pt },
                          ].filter(x => x.v > 0).map(({ l, v }) => (
                            <div key={l} className="flex justify-between items-center py-1.5 border-b border-red-500/10">
                              <span className="text-[11px] text-red-200/50 font-bold">{l}</span>
                              <span className="font-mono font-black text-sm text-red-300">₹{fmt(v)}</span>
                            </div>
                          ))}
                          <div className="col-span-2 flex justify-between items-center py-2 border-t border-white/10 mt-1">
                            <span className="text-[11px] text-emerald-300 font-black">Net Monthly Take-home</span>
                            <span className="font-mono font-black text-sm text-emerald-400">₹{fmt(salary.monthly.ctc - salary.monthly.epfEmp - salary.monthly.esiEmp - salary.monthly.pt)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 9 — SETTLEMENT (EXIT & PROBATION only) ──────────────── */}
          {step === 9 && letterType === "EXIT" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Full & Final Settlement</h2>
                <p className="text-sm text-slate-400 mt-0.5">Final dues calculation and disbursement</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { l: "Notice Pay Recovery (₹)", k: "noticePayRecovery", c: "text-red-600" },
                  { l: "Leave Encashment (₹)", k: "leaveEncashment", c: "text-emerald-600" },
                  { l: "Other Deductions (₹)", k: "deductions", c: "text-red-600" },
                  { l: "Final Payable Amount (₹)", k: "finalAmount", c: "text-emerald-700 font-black" },
                ].map(({ l, k, c }) => (
                  <F key={k} label={l}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input type="number" className={clsx(inp, "pl-7", c)} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
                    </div>
                  </F>
                ))}
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span className="text-sm font-black text-emerald-700">Net Disbursement</span>
                <span className="text-xl font-black text-emerald-700">₹{Number(form.finalAmount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {step === 9 && letterType === "PROBATION" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Evaluation Summary</h2>
                <p className="text-sm text-slate-400 mt-0.5">Final review outcome and observations</p>
              </div>
              <div className="space-y-4">
                <F label="Formal Confirmation Date" req>
                   <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-500/20">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-2">Effective Date</div>
                      <input type="date" className={clsx(inp, "h-12 text-base font-black border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20")} 
                        value={form.confirmationDate || ""} onChange={e => set("confirmationDate", e.target.value)} />
                   </div>
                </F>
                <F label="Revised Annual CTC" req>
                   <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-500/20">
                      <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-2">Confirmed Salary (Annual)</div>
                      <div className="relative mb-4">
                        <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                        <input type="number" className={clsx(inp, "pl-9 h-12 text-base font-black border-blue-200 focus:border-blue-500 focus:ring-blue-500/20")} 
                          placeholder="e.g. 500000"
                          value={form.revisedCtcOffer || ""} onChange={e => set("revisedCtcOffer", e.target.value)} />
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-200/30">
                        {[{ l: "Basic %", k: "basicPct" }, { l: "HRA %", k: "hraPct" }, { l: "Gratuity %", k: "gratuityPct" }].map(({ l, k }) => (
                          <div key={k}>
                            <label className={clsx(lbl, "text-[10px] mb-1 text-blue-500")}>{l}</label>
                            <input className={clsx(inp, "h-9 text-xs")} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-blue-200/30">
                        <div className="space-y-2">
                          <label className={clsx(lbl, "text-[10px] text-blue-500")}>Include EPF</label>
                          <select className={clsx(sel, "h-9 text-xs py-1")} value={form.includeEPF} onChange={e => set("includeEPF", e.target.value)}>
                            <option>No</option><option>Yes</option>
                          </select>
                          {form.includeEPF === "Yes" && (
                            <input type="number" className={clsx(inp, "h-9 text-xs")} placeholder="Manual ₹" value={form.manualEpf || ""} onChange={e => set("manualEpf", e.target.value)} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className={clsx(lbl, "text-[10px] text-blue-500")}>Include ESI</label>
                          <select className={clsx(sel, "h-9 text-xs py-1")} value={form.includeESI} onChange={e => set("includeESI", e.target.value)}>
                            <option>No</option><option>Yes</option>
                          </select>
                          {form.includeESI === "Yes" && (
                            <input type="number" className={clsx(inp, "h-9 text-xs")} placeholder="Manual ₹" value={form.manualEsi || ""} onChange={e => set("manualEsi", e.target.value)} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className={clsx(lbl, "text-[10px] text-blue-500")}>Prof. Tax</label>
                          <select className={clsx(sel, "h-9 text-xs py-1")} value={form.includePT} onChange={e => set("includePT", e.target.value)}>
                            <option>No</option><option>Yes</option>
                          </select>
                          {form.includePT === "Yes" && (
                            <input type="number" className={clsx(inp, "h-9 text-xs")} placeholder="Manual ₹" value={form.manualPt || ""} onChange={e => set("manualPt", e.target.value)} />
                          )}
                        </div>
                      </div>

                      {salary.annual.ctc > 0 && (
                        <div className="mt-4 p-4 bg-slate-900 rounded-xl">
                           <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Monthly Breakdown</div>
                           <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <div className="flex justify-between"><span className="text-[10px] text-white/50">Monthly Gross</span><span className="text-[10px] font-mono font-bold text-blue-400">₹{fmt(salary.monthly.ctc)}</span></div>
                              <div className="flex justify-between"><span className="text-[10px] text-white/50">Take Home</span><span className="text-[10px] font-mono font-bold text-emerald-400">₹{fmt(salary.monthly.ctc - (salary.monthly.epfEmp + salary.monthly.esiEmp + salary.monthly.pt))}</span></div>
                           </div>
                        </div>
                      )}
                   </div>
                </F>
                <F label="Review Notes">
                  <textarea className={clsx(inp, "min-h-[100px] resize-none")} placeholder="Overall assessment and observations..."
                    value={form.reviewNotes} onChange={e => set("reviewNotes", e.target.value)} />
                </F>
              </div>
            </div>
          )}

          {/* ── STEP 10 — AUTHORITY ──────────────────────────────────────── */}
          {step === 10 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Authorized Signatory</h2>
                <p className="text-sm text-slate-400 mt-0.5">Document date and issuing authority</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Document Issue Date" req span>
                  <input type="date" className={clsx(inp, "h-12 text-base font-bold")} value={form.date} onChange={e => set("date", e.target.value)} />
                </F>
                <div className="col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className={clsx(lbl, "text-center block mb-4")}>Signatory Details</label>
                  <div className="grid grid-cols-2 gap-4">
                    <F label="Name" req>
                      <input className={inp} placeholder="e.g. M. Harish" value={form.sigName} onChange={e => set("sigName", e.target.value)} />
                    </F>
                    <F label="Designation">
                      <input className={inp} placeholder="e.g. HR Manager" value={form.sigDesignation} onChange={e => set("sigDesignation", e.target.value)} />
                    </F>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 11 — REVIEW ─────────────────────────────────────────── */}
          {step === 11 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-black text-slate-800">Review & Confirm</h2>
                <p className="text-sm text-slate-400 mt-0.5">Verify all details before generating</p>
              </div>
              <div className="bg-slate-900 rounded-[32px] overflow-hidden text-white shadow-2xl shadow-navy/20">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl text-white">
                      {(form.firstName || "?")[0]}{(form.lastName || "?")[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-black">{form.prefix} {form.firstName} {form.lastName}</h4>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{form.designation} · {form.department}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                        {(form.empId || form.candidateId) ? (category === "CANDIDATE" ? `CND-${form.candidateId}` : `EMP-${form.empId}`) : (category === "CANDIDATE" ? "NEW CND" : "NEW EMP")} · {form.workLocation || "Tirupati"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={clsx("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg", ltConfig.color)}>
                      {ltConfig.label}
                    </span>
                    <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                      <Pencil size={12} /> Edit Profile
                    </button>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Email</div>
                    <div className="text-sm font-bold">{form.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Mobile</div>
                    <div className="text-sm font-bold">{form.mobile || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">PAN</div>
                    <div className="text-sm font-bold">{form.pan || "Not provided"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Address</div>
                    <div className="text-sm font-bold truncate max-w-[200px]">{[form.address1, form.city, form.state].filter(Boolean).join(", ") || "—"}</div>
                  </div>
                </div>

                {/* Compensation Box */}
                {(letterType === "OFFER" || letterType === "INTERNSHIP" || letterType === "INCREMENT" || letterType === "PROBATION") && (salary.annual.ctc > 0 || (letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship")) && Number(form.revisedCtcOffer) > 0) && (
                  <div className="m-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">{(letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship")) ? "Stipend" : "Compensation"}</h5>
                      <button onClick={() => setStep(letterType === "OFFER" || letterType === "INTERNSHIP" ? 8 : 9)} className="text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <IndianRupee size={12} /> Edit {(letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship")) ? "Stipend" : "Salary"}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{(letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship")) ? "Monthly Stipend" : "Annual CTC"}</div>
                        <div className="text-lg font-black text-blue-400">₹{(letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship")) ? fmt(form.revisedCtcOffer) : fmt(salary.annual.ctc)}</div>
                      </div>
                      {!(letterType === "INTERNSHIP" || form.empType === "Internship" || selectedTemplate?.name?.toLowerCase().includes("internship")) ? (
                        <>
                          <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Monthly</div>
                            <div className="text-lg font-black text-white">₹{fmt(salary.monthly.ctc)}</div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Structure</div>
                            <div className="text-lg font-black text-emerald-400">{form.basicPct}% + {form.hraPct}%</div>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 bg-indigo-500/5 rounded-2xl p-4 flex items-center justify-center border border-white/5 shadow-inner">
                           <div className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">Professional Internship Program</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Template Info */}
                <div className="px-8 pb-8 flex items-center gap-2">
                  <div className={clsx("w-2 h-2 rounded-full", selectedTemplate ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]")} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    Template: <span className="text-white/60">{selectedTemplate?.name || "Auto-Fallback"}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── SUCCESS ──────────────────────────────────────────────────── */}
          {step === 99 && (
            <div className="text-center py-10 space-y-5">
              <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25 ring-8 ring-emerald-500/10">
                <Check size={40} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Letter Generated!</h2>
                <p className="text-slate-400 text-sm mt-1">{ltConfig.label} is ready for download and distribution.</p>
              </div>
              <div className="flex flex-col gap-3 max-w-xs mx-auto pt-2">
                <a href={`${(process.env.NEXT_PUBLIC_API_URL || "https://fingrowhrm.info/api").replace("/api", "")}${genResult?.pdfUrl}?token=${localStorage.getItem('token')}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-800 text-white rounded-xl font-black text-sm hover:bg-slate-700 transition-all shadow-lg">
                  <Download size={16} /> Download PDF
                </a>
                
                {selectedTarget?.id && selectedTarget.id !== "NEW" && (
                  <Link href={category === "CANDIDATE" ? `/hrm/onboarding?candidate=${selectedTarget.id}` : `/hrm/employees?view=${selectedTarget.id}`}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-slate-200 text-slate-800 rounded-xl font-black text-sm hover:bg-slate-50 transition-all">
                    {category === "CANDIDATE" ? <UserPlus size={16} /> : <User size={16} />}
                    <span>View {category === "CANDIDATE" ? "Candidate" : "Employee"} Profile</span>
                  </Link>
                )}

                <button onClick={() => { setStep(1); setGenResult(null); setForm({ ...INIT }); setSelectedTarget(null); }}
                  className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-all py-2">
                  Generate Another Letter
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Navigation */}
        {step > 1 && step <= 11 && (
          <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50/50">
            <button onClick={prevStep}
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-white transition-all">
              <ChevronLeft size={15} /> Back
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all">
                <Eye size={15} /> Preview Details
              </button>
              {step === 11 ? (
                <button onClick={generate} disabled={loading}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-lg bg-slate-800 text-white font-black text-sm hover:bg-slate-700 disabled:opacity-50 transition-all shadow-md">
                  {loading ? <><RefreshCw size={15} className="animate-spin" /> Generating...</> : <><FileText size={15} /> Generate Letter</>}
                </button>
              ) : (
                <button onClick={nextStep}
                  className={clsx("flex items-center gap-2 px-7 py-2.5 rounded-lg text-white font-black text-sm transition-all shadow-md hover:opacity-90", ltConfig.color)}>
                  Continue <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="px-7 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
            <p className="text-[11px] text-slate-400 font-bold">Click on a name above to select and continue</p>
          </div>
        )}
      </div>

      {/* ── PREVIEW MODAL ────────────────────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-4xl my-auto shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black text-navy">Document Preview</h3>
                <p className="text-slate-400 text-sm font-medium">Review and edit details before final generation</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto bg-slate-50/50">
              {/* Summary Card (Dark) */}
              <div className="bg-slate-900 rounded-[32px] overflow-hidden text-white shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl text-white">
                      {(form.firstName || "?")[0]}{(form.lastName || "?")[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-black">{form.prefix} {form.firstName} {form.lastName}</h4>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{form.designation} · {form.department}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{form.empId || (category === "CANDIDATE" ? "NEW HIRE" : "EMP ID")} · {form.workLocation || "Tirupati"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={clsx("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg", ltConfig.color)}>
                      {ltConfig.label}
                    </span>
                    <button onClick={() => { setStep(3); setShowPreview(false); }} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                      <Pencil size={12} /> Edit Profile
                    </button>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Email</div>
                    <div className="text-sm font-bold">{form.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Mobile</div>
                    <div className="text-sm font-bold">{form.mobile || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">PAN</div>
                    <div className="text-sm font-bold">{form.pan || "Not provided"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Address</div>
                    <div className="text-sm font-bold truncate max-w-[200px]">{[form.address1, form.city, form.state].filter(Boolean).join(", ") || "—"}</div>
                  </div>
                </div>

                {/* Compensation Box */}
                {(letterType === "OFFER" || letterType === "INCREMENT" || letterType === "PROBATION") && salary.annual.ctc > 0 && (
                  <div className="m-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Compensation</h5>
                      <button onClick={() => { setStep(letterType === "PROBATION" ? 9 : 8); setShowPreview(false); }} className="text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <IndianRupee size={12} /> Edit Salary
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Annual CTC</div>
                        <div className="text-lg font-black text-blue-400">₹{fmt(salary.annual.ctc)}</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Monthly</div>
                        <div className="text-lg font-black text-white">₹{fmt(salary.monthly.ctc)}</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Structure</div>
                        <div className="text-lg font-black text-emerald-400">{form.basicPct}% + {form.hraPct}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Details Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Clock size={12} /> Timeline & Logistics
                 </h5>
                 <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Date of Joining</div>
                      <div className="text-sm font-bold text-slate-700">{form.joiningDate || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Reporting Manager</div>
                      <div className="text-sm font-bold text-slate-700">{form.manager || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Mode of Work</div>
                      <div className="text-sm font-bold text-slate-700">{form.mode || "—"}</div>
                    </div>
                 </div>
                 <button onClick={() => { setStep(6); setShowPreview(false); }} className="mt-6 text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                    <Pencil size={12} /> Edit Role & Logistics
                 </button>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button onClick={() => setShowPreview(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-100 transition-all text-sm uppercase tracking-widest">
                Close Preview
              </button>
              <button 
                onClick={() => { generate(); setShowPreview(false); }}
                className="flex-[2] py-4 bg-navy text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-navy/20 hover:opacity-90 transition-all"
              >
                Generate Document Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
