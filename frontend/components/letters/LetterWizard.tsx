"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import clsx from "clsx";
import {
  X, ChevronDown, RefreshCw, Check, Download,
  User, Briefcase, IndianRupee, Calendar, Phone,
  Mail, MapPin, Shield, FileText, TrendingUp,
  LogOut, ShieldCheck, Upload
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type LetterType = "OFFER" | "PROBATION" | "INCREMENT" | "EXIT";

interface LetterWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  type: LetterType;
  initialData?: any;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white placeholder:text-slate-300";
const selectCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white appearance-none";
const labelCls = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && <span className="text-rose-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className={clsx("flex items-center gap-3 mb-5 pb-3 border-b-2", color)}>
        <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center text-white", color.replace("border-", "bg-").split(" ")[0])}>
          <Icon size={16} />
        </div>
        <h3 className="font-black text-navy text-sm uppercase tracking-widest">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function SelectWithChevron({ value, onChange, children, className }: any) {
  return (
    <div className="relative">
      <select className={clsx(selectCls, "pr-10", className)} value={value} onChange={onChange}>{children}</select>
      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ─── TEMPLATE SELECTOR ────────────────────────────────────────────────────────
function TemplateSelector({ type, value, onChange }: { type: LetterType; value: string; onChange: (v: string) => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const TYPE_MAP: Record<LetterType, string> = {
    OFFER: "OFFER", PROBATION: "PROBATION", INCREMENT: "INCREMENT", EXIT: "EXPERIENCE"
  };

  useEffect(() => {
    api.get("/letters/templates")
      .then(r => {
        const all = r.data || [];
        const filtered = all.filter((t: any) => t.type === TYPE_MAP[type]);
        setTemplates(filtered);
        // Auto-select default
        const def = filtered.find((t: any) => t.isDefault) || filtered[0];
        if (def && !value) onChange(def.id);
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <label className={labelCls}>Select Template</label>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
          <RefreshCw size={14} className="animate-spin" /> Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-sm text-rose-500 font-bold py-2">
          No templates found. Please add one in Configuration → Letter Templates.
        </div>
      ) : (
        <div className="relative">
          <select
            className={clsx(selectCls, "pr-10 bg-white font-bold")}
            value={value}
            onChange={e => onChange(e.target.value)}
          >
            <option value="">-- Select Template --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}{t.isDefault ? " (Default)" : ""}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      )}
    </div>
  );
}

// ─── OFFER LETTER FORM ────────────────────────────────────────────────────────
function OfferForm({ form, set }: { form: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <Section title="Basic Information" icon={User} color="border-blue-200">
        <Field label="Full Name" required>
          <div className="grid grid-cols-4 gap-2">
            <SelectWithChevron value={form.prefix} onChange={(e: any) => set("prefix", e.target.value)}>
              <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
            </SelectWithChevron>
            <div className="col-span-2"><input className={inputCls} placeholder="First Name" value={form.firstName} onChange={e => set("firstName", e.target.value)} /></div>
            <input className={inputCls} placeholder="Last Name" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
          </div>
        </Field>
        <Field label="Father's Name"><input className={inputCls} placeholder="Father / Guardian Name" value={form.fatherName} onChange={e => set("fatherName", e.target.value)} /></Field>
        <Field label="Date of Birth"><input type="date" className={inputCls} value={form.dob} onChange={e => set("dob", e.target.value)} /></Field>
        <Field label="Gender">
          <SelectWithChevron value={form.gender} onChange={(e: any) => set("gender", e.target.value)}>
            <option>Male</option><option>Female</option><option>Other</option>
          </SelectWithChevron>
        </Field>
        <Field label="Marital Status">
          <SelectWithChevron value={form.maritalStatus} onChange={(e: any) => set("maritalStatus", e.target.value)}>
            <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
          </SelectWithChevron>
        </Field>
      </Section>

      <Section title="Contact Details" icon={Phone} color="border-sky-200">
        <Field label="Mobile Number" required><input className={inputCls} placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={e => set("mobile", e.target.value)} /></Field>
        <Field label="Personal Email ID" required><input type="email" className={inputCls} placeholder="email@example.com" value={form.email} onChange={e => set("email", e.target.value)} /></Field>
        <div className="col-span-2">
          <Field label="Current Address"><input className={inputCls} placeholder="Current residential address" value={form.currentAddress} onChange={e => set("currentAddress", e.target.value)} /></Field>
        </div>
        <div className="col-span-2">
          <Field label="Permanent Address"><input className={inputCls} placeholder="Permanent address" value={form.permanentAddress} onChange={e => set("permanentAddress", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Identity Details" icon={Shield} color="border-violet-200">
        <Field label="Aadhaar Number"><input className={inputCls} placeholder="XXXX XXXX XXXX" maxLength={12} value={form.aadhaar} onChange={e => set("aadhaar", e.target.value)} /></Field>
        <Field label="PAN Number"><input className={inputCls} placeholder="ABCDE1234F" maxLength={10} value={form.pan} onChange={e => set("pan", e.target.value)} /></Field>
        <Field label="Passport Number (Optional)"><input className={inputCls} placeholder="A1234567" value={form.passport} onChange={e => set("passport", e.target.value)} /></Field>
      </Section>

      <Section title="Job Details" icon={Briefcase} color="border-emerald-200">
        <Field label="Employee ID"><input className={inputCls} placeholder="Auto / Manual" value={form.empId} onChange={e => set("empId", e.target.value)} /></Field>
        <Field label="Department" required><input className={inputCls} placeholder="Department" value={form.department} onChange={e => set("department", e.target.value)} /></Field>
        <Field label="Designation" required><input className={inputCls} placeholder="Job Title" value={form.designation} onChange={e => set("designation", e.target.value)} /></Field>
        <Field label="Work Location"><input className={inputCls} placeholder="City, Office" value={form.workLocation} onChange={e => set("workLocation", e.target.value)} /></Field>
        <Field label="Reporting Manager"><input className={inputCls} placeholder="Manager Name" value={form.manager} onChange={e => set("manager", e.target.value)} /></Field>
        <Field label="Employment Type">
          <SelectWithChevron value={form.empType} onChange={(e: any) => set("empType", e.target.value)}>
            <option>Full-time</option><option>Contract</option><option>Internship</option><option>Part-time</option>
          </SelectWithChevron>
        </Field>
      </Section>

      <Section title="Salary Details" icon={IndianRupee} color="border-amber-200">
        <Field label="CTC (Annual)" required>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span><input type="number" className={clsx(inputCls, "pl-8")} placeholder="600000" value={form.ctc} onChange={e => set("ctc", e.target.value)} /></div>
        </Field>
        <Field label="Basic Salary">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span><input type="number" className={clsx(inputCls, "pl-8")} placeholder="240000" value={form.basic} onChange={e => set("basic", e.target.value)} /></div>
        </Field>
        <Field label="HRA">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span><input type="number" className={clsx(inputCls, "pl-8")} placeholder="96000" value={form.hra} onChange={e => set("hra", e.target.value)} /></div>
        </Field>
        <Field label="Allowances">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span><input type="number" className={clsx(inputCls, "pl-8")} placeholder="60000" value={form.allowances} onChange={e => set("allowances", e.target.value)} /></div>
        </Field>
        <Field label="Bonus / Incentives">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span><input type="number" className={clsx(inputCls, "pl-8")} value={form.bonus} onChange={e => set("bonus", e.target.value)} /></div>
        </Field>
        <Field label="PF Applicable">
          <SelectWithChevron value={form.pfApplicable} onChange={(e: any) => set("pfApplicable", e.target.value)}>
            <option>Yes</option><option>No</option>
          </SelectWithChevron>
        </Field>
        <Field label="ESI Applicable">
          <SelectWithChevron value={form.esiApplicable} onChange={(e: any) => set("esiApplicable", e.target.value)}>
            <option>Yes</option><option>No</option>
          </SelectWithChevron>
        </Field>
      </Section>

      <Section title="Joining Details" icon={Calendar} color="border-teal-200">
        <Field label="Date of Joining" required><input type="date" className={inputCls} value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)} /></Field>
        <Field label="Offer Date"><input type="date" className={inputCls} value={form.offerDate} onChange={e => set("offerDate", e.target.value)} /></Field>
        <Field label="Probation Period">
          <SelectWithChevron value={form.probationPeriod} onChange={(e: any) => set("probationPeriod", e.target.value)}>
            <option>3 months</option><option>6 months</option><option>1 year</option><option>None</option>
          </SelectWithChevron>
        </Field>
        <Field label="Last Date to Accept Offer"><input type="date" className={inputCls} value={form.offerExpiry} onChange={e => set("offerExpiry", e.target.value)} /></Field>
      </Section>

      <Section title="Document Uploads" icon={Upload} color="border-rose-200">
        {["Resume", "Aadhaar Copy", "PAN Copy", "Photo", "Educational Certificates"].map(doc => (
          <Field key={doc} label={doc}>
            <div className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 flex items-center gap-2 hover:border-accent hover:text-accent transition-all cursor-pointer">
              <Upload size={14} /> Click to upload {doc}
            </div>
          </Field>
        ))}
      </Section>
    </>
  );
}

// ─── PROBATION FORM ───────────────────────────────────────────────────────────
function ProbationForm({ form, set }: { form: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <Section title="Employee Information" icon={User} color="border-emerald-200">
        <Field label="Employee Name" required>
          <div className="grid grid-cols-4 gap-2">
            <SelectWithChevron value={form.prefix} onChange={(e: any) => set("prefix", e.target.value)}>
              <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
            </SelectWithChevron>
            <div className="col-span-2"><input className={inputCls} placeholder="First Name" value={form.firstName} onChange={e => set("firstName", e.target.value)} /></div>
            <input className={inputCls} placeholder="Last Name" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
          </div>
        </Field>
        <Field label="Employee ID"><input className={inputCls} placeholder="EMP001" value={form.empId} onChange={e => set("empId", e.target.value)} /></Field>
        <Field label="Department" required><input className={inputCls} placeholder="Department" value={form.department} onChange={e => set("department", e.target.value)} /></Field>
        <Field label="Designation" required><input className={inputCls} placeholder="Job Title" value={form.designation} onChange={e => set("designation", e.target.value)} /></Field>
      </Section>

      <Section title="Joining Information" icon={Calendar} color="border-sky-200">
        <Field label="Date of Joining"><input type="date" className={inputCls} value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)} /></Field>
        <Field label="Probation Start Date" required><input type="date" className={inputCls} value={form.probationStart} onChange={e => set("probationStart", e.target.value)} /></Field>
        <Field label="Probation End Date" required><input type="date" className={inputCls} value={form.probationEnd} onChange={e => set("probationEnd", e.target.value)} /></Field>
      </Section>

      <Section title="Performance Details" icon={TrendingUp} color="border-amber-200">
        <Field label="Performance Rating">
          <SelectWithChevron value={form.performanceRating} onChange={(e: any) => set("performanceRating", e.target.value)}>
            <option value="">Select Rating</option>
            <option>Excellent</option><option>Good</option><option>Average</option><option>Below Average</option><option>Poor</option>
          </SelectWithChevron>
        </Field>
        <div className="col-span-2">
          <Field label="Manager Feedback">
            <textarea className={clsx(inputCls, "min-h-[100px] resize-none")} placeholder="Manager's observations and feedback..." value={form.managerFeedback} onChange={e => set("managerFeedback", e.target.value)} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="HR Remarks">
            <textarea className={clsx(inputCls, "min-h-[80px] resize-none")} placeholder="HR remarks..." value={form.hrRemarks} onChange={e => set("hrRemarks", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Decision" icon={ShieldCheck} color="border-violet-200">
        <div className="col-span-2">
          <Field label="Status / Decision" required>
            <div className="grid grid-cols-3 gap-3">
              {["Continue Probation", "Confirm Employment", "Terminate"].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("probationStatus", s)}
                  className={clsx(
                    "px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all",
                    form.probationStatus === s
                      ? s === "Terminate" ? "border-rose-500 bg-rose-50 text-rose-600"
                        : s === "Confirm Employment" ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : "border-amber-500 bg-amber-50 text-amber-600"
                      : "border-slate-200 text-slate-400 hover:border-slate-300"
                  )}
                >{s}</button>
              ))}
            </div>
          </Field>
        </div>
        {form.probationStatus === "Continue Probation" && (
          <>
            <Field label="Extended Till Date"><input type="date" className={inputCls} value={form.extendedTill} onChange={e => set("extendedTill", e.target.value)} /></Field>
            <Field label="Reason for Extension">
              <textarea className={clsx(inputCls, "min-h-[80px] resize-none")} placeholder="Reason for extending probation..." value={form.extensionReason} onChange={e => set("extensionReason", e.target.value)} />
            </Field>
          </>
        )}
      </Section>
    </>
  );
}

// ─── INCREMENT FORM ───────────────────────────────────────────────────────────
function IncrementForm({ form, set }: { form: any; set: (k: string, v: any) => void }) {
  // Auto-calculate increment amount and percentage
  useEffect(() => {
    const current = Number(form.currentCtc) || 0;
    const revised = Number(form.revisedCtc) || 0;
    if (current > 0 && revised > 0) {
      const diff = revised - current;
      const pct = ((diff / current) * 100).toFixed(2);
      set("incrementAmount", diff.toString());
      set("incrementPct", pct);
    }
  }, [form.currentCtc, form.revisedCtc]);

  return (
    <>
      <Section title="Employee Details" icon={User} color="border-amber-200">
        <Field label="Employee Name" required>
          <div className="grid grid-cols-4 gap-2">
            <SelectWithChevron value={form.prefix} onChange={(e: any) => set("prefix", e.target.value)}>
              <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
            </SelectWithChevron>
            <div className="col-span-2"><input className={inputCls} placeholder="First Name" value={form.firstName} onChange={e => set("firstName", e.target.value)} /></div>
            <input className={inputCls} placeholder="Last Name" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
          </div>
        </Field>
        <Field label="Employee ID"><input className={inputCls} placeholder="EMP001" value={form.empId} onChange={e => set("empId", e.target.value)} /></Field>
        <Field label="Department" required><input className={inputCls} placeholder="Department" value={form.department} onChange={e => set("department", e.target.value)} /></Field>
        <Field label="Designation" required><input className={inputCls} placeholder="Job Title" value={form.designation} onChange={e => set("designation", e.target.value)} /></Field>
      </Section>

      <Section title="Salary Revision" icon={IndianRupee} color="border-emerald-200">
        <Field label="Current CTC (Annual)" required>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input type="number" className={clsx(inputCls, "pl-8")} placeholder="500000" value={form.currentCtc} onChange={e => set("currentCtc", e.target.value)} /></div>
        </Field>
        <Field label="Revised CTC (Annual)" required>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input type="number" className={clsx(inputCls, "pl-8 border-emerald-300 ring-emerald-100")} placeholder="600000" value={form.revisedCtc} onChange={e => set("revisedCtc", e.target.value)} /></div>
        </Field>
        <Field label="Increment Amount">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input type="number" className={clsx(inputCls, "pl-8 bg-slate-50")} readOnly value={form.incrementAmount} /></div>
        </Field>
        <Field label="Increment Percentage">
          <div className="relative">
            <input type="text" className={clsx(inputCls, "pr-8 bg-slate-50 font-black text-emerald-600")} readOnly value={form.incrementPct ? `${form.incrementPct}%` : ""} />
          </div>
        </Field>
      </Section>

      <Section title="Effective Details" icon={Calendar} color="border-sky-200">
        <Field label="Effective From Date" required><input type="date" className={inputCls} value={form.effectiveDate} onChange={e => set("effectiveDate", e.target.value)} /></Field>
        <Field label="Appraisal Period"><input className={inputCls} placeholder="e.g. 2025–2026" value={form.appraisalPeriod} onChange={e => set("appraisalPeriod", e.target.value)} /></Field>
      </Section>

      <Section title="Performance Information" icon={TrendingUp} color="border-violet-200">
        <Field label="Performance Rating">
          <SelectWithChevron value={form.performanceRating} onChange={(e: any) => set("performanceRating", e.target.value)}>
            <option value="">Select Rating</option>
            <option>Excellent</option><option>Good</option><option>Average</option><option>Below Average</option>
          </SelectWithChevron>
        </Field>
        <div className="col-span-2">
          <Field label="Manager Comments">
            <textarea className={clsx(inputCls, "min-h-[100px] resize-none")} placeholder="Manager's comments on performance..." value={form.managerComments} onChange={e => set("managerComments", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Approval" icon={ShieldCheck} color="border-rose-200">
        <Field label="Approved By"><input className={inputCls} placeholder="Approver Name" value={form.approvedBy} onChange={e => set("approvedBy", e.target.value)} /></Field>
        <Field label="Approval Date"><input type="date" className={inputCls} value={form.approvalDate} onChange={e => set("approvalDate", e.target.value)} /></Field>
      </Section>
    </>
  );
}

// ─── EXIT FORM ────────────────────────────────────────────────────────────────
function ExitForm({ form, set }: { form: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <Section title="Employee Details" icon={User} color="border-rose-200">
        <Field label="Employee Name" required>
          <div className="grid grid-cols-4 gap-2">
            <SelectWithChevron value={form.prefix} onChange={(e: any) => set("prefix", e.target.value)}>
              <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
            </SelectWithChevron>
            <div className="col-span-2"><input className={inputCls} placeholder="First Name" value={form.firstName} onChange={e => set("firstName", e.target.value)} /></div>
            <input className={inputCls} placeholder="Last Name" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
          </div>
        </Field>
        <Field label="Employee ID"><input className={inputCls} placeholder="EMP001" value={form.empId} onChange={e => set("empId", e.target.value)} /></Field>
        <Field label="Department" required><input className={inputCls} placeholder="Department" value={form.department} onChange={e => set("department", e.target.value)} /></Field>
        <Field label="Designation" required><input className={inputCls} placeholder="Job Title" value={form.designation} onChange={e => set("designation", e.target.value)} /></Field>
      </Section>

      <Section title="Exit Details" icon={LogOut} color="border-orange-200">
        <Field label="Resignation Date" required><input type="date" className={inputCls} value={form.resignationDate} onChange={e => set("resignationDate", e.target.value)} /></Field>
        <Field label="Last Working Day" required><input type="date" className={inputCls} value={form.lastWorkingDay} onChange={e => set("lastWorkingDay", e.target.value)} /></Field>
        <Field label="Notice Period Served">
          <SelectWithChevron value={form.noticePeriodServed} onChange={(e: any) => set("noticePeriodServed", e.target.value)}>
            <option>Yes</option><option>No</option><option>Partial</option>
          </SelectWithChevron>
        </Field>
        <Field label="Exit Type" required>
          <SelectWithChevron value={form.exitType} onChange={(e: any) => set("exitType", e.target.value)}>
            <option value="">Select Exit Type</option>
            <option>Resigned</option><option>Terminated</option><option>Absconded</option><option>Retired</option>
          </SelectWithChevron>
        </Field>
        <div className="col-span-2">
          <Field label="Reason for Leaving">
            <textarea className={clsx(inputCls, "min-h-[80px] resize-none")} placeholder="Reason for separation..." value={form.exitReason} onChange={e => set("exitReason", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Clearance Details" icon={ShieldCheck} color="border-sky-200">
        <Field label="IT Clearance">
          <SelectWithChevron value={form.itClearance} onChange={(e: any) => set("itClearance", e.target.value)}>
            <option>Yes</option><option>No</option><option>Pending</option>
          </SelectWithChevron>
        </Field>
        <Field label="HR Clearance">
          <SelectWithChevron value={form.hrClearance} onChange={(e: any) => set("hrClearance", e.target.value)}>
            <option>Yes</option><option>No</option><option>Pending</option>
          </SelectWithChevron>
        </Field>
        <Field label="Accounts Clearance">
          <SelectWithChevron value={form.accountsClearance} onChange={(e: any) => set("accountsClearance", e.target.value)}>
            <option>Yes</option><option>No</option><option>Pending</option>
          </SelectWithChevron>
        </Field>
        <Field label="Assets Returned">
          <SelectWithChevron value={form.assetsReturned} onChange={(e: any) => set("assetsReturned", e.target.value)}>
            <option>Yes – All</option><option>Partial</option><option>No</option>
          </SelectWithChevron>
        </Field>
        <div className="col-span-2">
          <Field label="Assets Details (Laptop, ID Card, etc.)">
            <input className={inputCls} placeholder="e.g. Laptop returned, ID Card returned" value={form.assetsDetails} onChange={e => set("assetsDetails", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Final Settlement" icon={IndianRupee} color="border-emerald-200">
        <Field label="Pending Salary">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input type="number" className={clsx(inputCls, "pl-8")} placeholder="0" value={form.pendingSalary} onChange={e => set("pendingSalary", e.target.value)} /></div>
        </Field>
        <Field label="Leave Encashment">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input type="number" className={clsx(inputCls, "pl-8")} placeholder="0" value={form.leaveEncashment} onChange={e => set("leaveEncashment", e.target.value)} /></div>
        </Field>
        <Field label="Deductions">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input type="number" className={clsx(inputCls, "pl-8")} placeholder="0" value={form.deductions} onChange={e => set("deductions", e.target.value)} /></div>
        </Field>
        <Field label="Final Payable Amount">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input type="number" className={clsx(inputCls, "pl-8 font-black text-emerald-600")} placeholder="0" value={form.finalAmount} onChange={e => set("finalAmount", e.target.value)} /></div>
        </Field>
      </Section>
    </>
  );
}

// ─── INITIAL FORM STATE ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  // common
  prefix: "Mr.", firstName: "", lastName: "", empId: "",
  department: "", designation: "",
  // offer
  fatherName: "", dob: "", gender: "Male", maritalStatus: "Single",
  mobile: "", email: "", currentAddress: "", permanentAddress: "",
  aadhaar: "", pan: "", passport: "",
  workLocation: "", manager: "", empType: "Full-time",
  ctc: "", basic: "", hra: "", allowances: "", bonus: "",
  pfApplicable: "Yes", esiApplicable: "Yes",
  joiningDate: "", offerDate: "", probationPeriod: "6 months", offerExpiry: "",
  // probation
  probationStart: "", probationEnd: "", performanceRating: "",
  managerFeedback: "", hrRemarks: "", probationStatus: "",
  extendedTill: "", extensionReason: "",
  // increment
  currentCtc: "", revisedCtc: "", incrementAmount: "", incrementPct: "",
  effectiveDate: "", appraisalPeriod: "", managerComments: "",
  approvedBy: "", approvalDate: "",
  // exit
  resignationDate: "", lastWorkingDay: "", noticePeriodServed: "Yes",
  exitType: "", exitReason: "", itClearance: "Yes", hrClearance: "Yes",
  accountsClearance: "Yes", assetsReturned: "Yes – All", assetsDetails: "",
  pendingSalary: "0", leaveEncashment: "0", deductions: "0", finalAmount: "0",
};

const TYPE_CONFIG: Record<LetterType, { title: string; subtitle: string; color: string; icon: any }> = {
  OFFER: { title: "Offer Letter", subtitle: "OFFER DOCUMENT", color: "bg-blue-500", icon: FileText },
  PROBATION: { title: "Probation Letter", subtitle: "PROBATION DOCUMENT", color: "bg-emerald-500", icon: ShieldCheck },
  INCREMENT: { title: "Increment Letter", subtitle: "INCREMENT DOCUMENT", color: "bg-amber-500", icon: TrendingUp },
  EXIT: { title: "Exit Letter", subtitle: "EXIT DOCUMENT", color: "bg-rose-500", icon: LogOut },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LetterWizard({ isOpen, onClose, onSuccess, type, initialData }: LetterWizardProps) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [templateId, setTemplateId] = useState("");
  const [step, setStep] = useState<"FORM" | "REVIEW" | "SUCCESS">("FORM");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  useEffect(() => {
    if (initialData) {
      const names = (initialData.name || "").split(" ");
      setForm(f => ({
        ...f,
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        email: initialData.email || "",
        mobile: initialData.phone || initialData.mobile || "",
        designation: initialData.designation || initialData.position || "",
        department: initialData.department || "",
      }));
    }
  }, [initialData]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleGenerate = async () => {
    if (!templateId) return alert("Please select a template first.");
    setLoading(true);
    try {
      const payload = {
        type,
        templateId,
        candidateId: initialData?.id && !initialData?.employeeId ? initialData.id : null,
        employeeId: initialData?.employeeId || (initialData?.id && initialData?.employeeId ? initialData.id : null),
        data: {
          ...form,
          name: `${form.firstName} ${form.lastName}`.trim(),
        },
      };
      const res = await api.post("/letters/generate-advanced", payload);
      setGenerated(res.data);
      setStep("SUCCESS");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (generated) onSuccess(generated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-[32px] w-full max-w-3xl my-6 shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", config.color)}>
              <Icon size={22} />
            </div>
            <div>
              <h2 className="font-black text-navy text-xl">{config.title}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-navy transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-8 py-6">

          {step === "SUCCESS" ? (
            /* ── Success State ── */
            <div className="text-center py-16 space-y-6">
              <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                <Check size={48} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-navy">Generated!</h3>
                <p className="text-slate-400 text-sm mt-2">Your {config.title} is ready for download.</p>
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <a
                  href={`https://defensebluhrm.info${generated?.pdfUrl}?token=${localStorage.getItem('fg_token')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-8 py-4 bg-navy text-white rounded-2xl font-black text-sm hover:bg-navy/90 transition-all shadow-xl"
                >
                  <Download size={20} /> Download PDF
                </a>
                <button
                  onClick={handleDone}
                  className="px-8 py-4 border-2 border-slate-200 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          ) : step === "REVIEW" ? (
            /* ── Review State ── */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-navy">Review & Confirm</h3>
                  <p className="text-slate-400 text-sm font-medium">Verify all details before generating</p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-900 rounded-[32px] overflow-hidden text-white shadow-2xl shadow-navy/20">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl text-white">
                      {form.firstName.charAt(0)}{form.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-black">{form.prefix} {form.firstName} {form.lastName}</h4>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{form.designation} · {form.department}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{form.empId || "New Hire"} · {form.workLocation || "Tirupati"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={clsx("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg", config.color)}>
                      {type} LETTER
                    </span>
                    <button onClick={() => setStep("FORM")} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                      <FileText size={12} /> Edit Profile
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
                    <div className="text-sm font-bold truncate max-w-[200px]">{form.currentAddress || "—"}</div>
                  </div>
                </div>

                {/* Compensation Box */}
                {(type === "OFFER" || type === "INCREMENT") && (
                  <div className="m-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Compensation</h5>
                      <button onClick={() => setStep("FORM")} className="text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <IndianRupee size={12} /> Edit Salary
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Annual CTC</div>
                        <div className="text-lg font-black text-blue-400">₹{Number(type === "OFFER" ? form.ctc : form.revisedCtc).toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Monthly</div>
                        <div className="text-lg font-black text-white">₹{Math.round(Number(type === "OFFER" ? form.ctc : form.revisedCtc) / 12).toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Structure</div>
                        <div className="text-lg font-black text-emerald-400">40% + 50%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  onClick={() => setStep("FORM")}
                  className="flex-1 h-16 border-2 border-slate-100 rounded-2xl font-black text-slate-400 hover:bg-slate-50 hover:text-navy transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> Back to Edit
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={clsx(
                    "flex-[2] h-16 rounded-2xl font-black text-white text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-navy/20",
                    loading ? "bg-slate-300" : "bg-navy hover:opacity-90"
                  )}
                >
                  {loading ? (
                    <><RefreshCw size={20} className="animate-spin" /> Generating...</>
                  ) : (
                    <><FileText size={20} /> Generate Letter</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Template Selector */}
              <TemplateSelector type={type} value={templateId} onChange={setTemplateId} />

              {/* Form Fields */}
              <div className="space-y-2">
                {type === "OFFER" && <OfferForm form={form} set={set} />}
                {type === "PROBATION" && <ProbationForm form={form} set={set} />}
                {type === "INCREMENT" && <IncrementForm form={form} set={set} />}
                {type === "EXIT" && <ExitForm form={form} set={set} />}
              </div>

              {/* Review Button */}
              <div className="sticky bottom-0 pt-4 pb-2 bg-white border-t border-slate-100 mt-6">
                <button
                  onClick={() => {
                    if (!templateId) return alert("Please select a template first.");
                    setStep("REVIEW");
                  }}
                  className={clsx(
                    "w-full h-16 rounded-2xl font-black text-white text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl",
                    !templateId ? "bg-slate-300 cursor-not-allowed" : clsx(config.color, "hover:opacity-90 shadow-navy/20")
                  )}
                >
                  <TrendingUp size={20} /> Review Details & Confirm
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
