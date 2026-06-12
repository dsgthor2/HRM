"use client";
import AppShell from "@/components/layout/AppShell";

const TEMPLATES = [
  { type: "OFFER", name: "Offer Letter", vars: ["candidateName","designation","department","ctc","joiningDate"] },
  { type: "APPOINTMENT", name: "Appointment Letter", vars: ["employeeName","designation","department","salary","joiningDate"] },
  { type: "INCREMENT", name: "Increment Letter", vars: ["employeeName","designation","oldSalary","newSalary","effectiveDate"] },
  { type: "EXPERIENCE", name: "Experience Letter", vars: ["employeeName","designation","department","joinDate","lastWorkingDay"] },
];

export default function LetterTemplatesPage() {
  return (
    <AppShell title="Letter Templates">
      <div className="mb-5">
        <h2 className="page-title">Letter Templates</h2>
        <p className="page-sub">View available variables for each letter type</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map(t => (
          <div key={t.type} className="card">
            <h3 className="font-bold text-navy mb-1">{t.name}</h3>
            <p className="text-xs text-slate-400 mb-3">Auto-generated as PDF with company branding</p>
            <div className="flex flex-wrap gap-1.5">
              {t.vars.map(v => (
                <span key={v} className="font-mono text-xs bg-navy/10 text-navy px-2 py-0.5 rounded">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
            <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg text-xs text-emerald-700 font-semibold">
              ✅ PDF auto-generated — go to <strong>HRM → Letters</strong> to generate
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
