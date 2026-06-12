"use client";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import LetterWizard from "@/components/letters/LetterWizard";
import Link from "next/link";
import {
  FileText, TrendingUp, LogOut,
  ArrowRight, ShieldCheck, Clock, Settings, ChevronDown
} from "lucide-react";
import clsx from "clsx";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type LetterType = "OFFER" | "INTERNSHIP" | "CONTRACT" | "PROBATION" | "INCREMENT" | "EXIT";

interface CardType {
  title: string;
  desc: string;
  type: LetterType;
  icon: React.ElementType;
  color: string;
  lightColor: string;
  textColor: string;
  borderColor: string;
  tags: string[];
  templateLabel: string;
  link: string;
}

// ─── CARD CONFIG ──────────────────────────────────────────────────────────────
const CARD_TYPES: CardType[] = [
  {
    title: "Hiring Documents",
    desc: "Offer, Internship, and Contract letters for new candidates.",
    type: "OFFER",
    icon: FileText,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    tags: ["Offer", "Intern", "Contract"],
    templateLabel: "Offer Letter Template",
    link: "/hrm/emp-documents/offer-letter",
  },
  {
    title: "Probation Letters",
    desc: "Extension and confirmation letters for employees on review.",
    type: "PROBATION",
    icon: ShieldCheck,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    tags: ["Extension", "Confirmation"],
    templateLabel: "Probation Letter Template",
    link: "/hrm/emp-documents/probation-letter",
  },
  {
    title: "Salary Increments",
    desc: "Performance appraisals and annual hike letters.",
    type: "INCREMENT",
    icon: TrendingUp,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    tags: ["Appraisal", "Revision"],
    templateLabel: "Increment Letter Template",
    link: "/hrm/emp-documents/increment-letter",
  },
  {
    title: "Exit & Relieving",
    desc: "Resignation acceptance, relieving letters, and FnF status.",
    type: "EXIT",
    icon: LogOut,
    color: "bg-rose-500",
    lightColor: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    tags: ["Relieving", "FnF"],
    templateLabel: "Exit Letter Template",
    link: "/hrm/emp-documents/exit-letter",
  },
];

// ─── CORRECT TEMPLATE PATH based on your folder structure ─────────────────────
const TEMPLATE_BASE = "/configuration/letter-templates";

// ─── CARD COMPONENT ───────────────────────────────────────────────────────────
function DocumentCard({
  card,
  onGenerate,
}: {
  card: CardType;
  onGenerate: (type: LetterType) => void;
}) {
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <div className="group relative bg-white rounded-[40px] border border-cream-dark hover:shadow-2xl hover:shadow-navy/5 transition-all duration-500 overflow-hidden flex flex-col justify-between">

      {/* Decorative background circle */}
      <div
        className={clsx(
          "absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 opacity-10 transition-transform group-hover:scale-110",
          card.color
        )}
      />

      {/* Main clickable area */}
      <Link
        href={card.link}
        className="text-left p-8 flex-1 w-full"
      >
        {/* Icon + Tags */}
        <div className="flex items-start justify-between mb-8">
          <div
            className={clsx(
              "w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6",
              card.color
            )}
          >
            <card.icon size={30} />
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end max-w-[150px]">
            {card.tags.map((t) => (
              <span
                key={t}
                className={clsx(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  card.lightColor,
                  card.textColor,
                  "border-transparent group-hover:border-current/10 transition-all"
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
      </Link>

      {/* Footer: Generate button + Template dropdown */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-between pt-6 border-t border-cream-dark/50">

          {/* Generate */}
          <Link
            href={card.link}
            className={clsx(
              "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2",
              card.textColor
            )}
          >
            Generate Document
            <div
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1",
                card.lightColor,
                card.textColor
              )}
            >
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Template dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDropOpen((o) => !o);
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                card.lightColor,
                card.textColor,
                card.borderColor
              )}
            >
              <Settings size={11} />
              Template
              <ChevronDown
                size={11}
                className={clsx("transition-transform", dropOpen && "rotate-180")}
              />
            </button>

            {/* Dropdown menu */}
            {dropOpen && (
              <div
                className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-2xl border border-cream-dark shadow-xl z-20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={clsx("px-4 py-2.5 border-b border-cream-dark/50", card.lightColor)}>
                  <p className={clsx("text-[9px] font-black uppercase tracking-widest", card.textColor)}>
                    Template Options
                  </p>
                </div>

                {/* View / Edit Template → goes to /configuration/letter-templates */}
                <Link
                  href={TEMPLATE_BASE}
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-cream/30 transition-all"
                >
                  <div
                    className={clsx(
                      "w-7 h-7 rounded-lg flex items-center justify-center",
                      card.lightColor,
                      card.textColor
                    )}
                  >
                    <FileText size={13} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-navy">{card.templateLabel}</p>
                    <p className="text-[9px] text-slate-400 font-bold">View &amp; edit in settings</p>
                  </div>
                </Link>

                {/* Generate Document shortcut */}
                <Link
                  href={card.link}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream/30 transition-all border-t border-cream-dark/50"
                >
                  <div
                    className={clsx(
                      "w-7 h-7 rounded-lg flex items-center justify-center",
                      card.lightColor,
                      card.textColor
                    )}
                  >
                    <ArrowRight size={13} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-navy">Generate Now</p>
                    <p className="text-[9px] text-slate-400 font-bold">Open document wizard</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setDropOpen(false)}
        />
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function EmpDocumentsHub() {
  const [activeType, setActiveType] = useState<LetterType | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSuccess = (result: any) => {
    setLastResult(result);
    setActiveType(null);
  };

  return (
    <AppShell title="Document Center">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── Header ── */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-navy tracking-tight">
            System Document Center
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm font-medium">
            Select a document category to generate professional, ready-to-sign HR
            documents. Use the Template option on each card to edit the letter format.
          </p>
        </div>

        {/* ── Success Banner ── */}
        {lastResult && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-[24px] px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <div className="font-black text-emerald-800 text-sm uppercase tracking-widest">
                  Document Generated Successfully
                </div>
                <div className="text-emerald-600 text-xs font-bold">
                  Ready for download and distribution
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`https://fingrowhrm.info${lastResult.pdfUrl}?token=${localStorage.getItem('token')}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
              >
                Download PDF
              </a>
              <button
                onClick={() => setLastResult(null)}
                className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Categories Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARD_TYPES.map((card) => (
            <DocumentCard
              key={card.type}
              card={card}
              onGenerate={setActiveType}
            />
          ))}
        </div>

        {/* ── History & Repository Banner ── */}
        <div className="bg-navy rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-navy/20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <Clock className="text-accent" size={28} />
            </div>
            <div>
              <div className="text-xl font-black">History &amp; Repository</div>
              <div className="text-white/40 text-sm">
                Access previously generated documents and track F&amp;F progress.
              </div>
            </div>
          </div>
          <Link
            href="/hrm/emp-documents/history"
            className="btn-accent px-10 py-4 h-auto text-xs font-black uppercase tracking-widest shadow-xl shadow-accent/20 flex items-center justify-center"
          >
            View All Records
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
