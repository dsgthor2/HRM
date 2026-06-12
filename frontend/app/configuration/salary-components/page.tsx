"use client";
import AppShell from "@/components/layout/AppShell";
import { useState, useEffect } from "react";
import api from "@/lib/api";

type Tab = "customize" | "basic" | "epf-esi" | "hra" | "gratuity";
type View = "configure" | "summary";

interface SalaryComp  { id: string; name: string; sub: string; checked: boolean; custom?: boolean; amount?: number; includeInLetter?: boolean }
interface Benefit     { id: string; name: string; sub: string; checked: boolean; custom?: boolean; amount?: number; includeInLetter?: boolean }
interface Deduction   { id: string; name: string; sub: string; checked: boolean; custom?: boolean; amount?: number; includeInLetter?: boolean }
interface BasicRow    { sl: number; value: number }
interface EpfRow      { sl: number; welfare: string; employee: number; employer: number }
interface HraRow      { sl: number; hra: number; state: string; city: string }
interface GratuityRow { sl: number; value: number }

const INIT_SALARY: SalaryComp[] = [
  { id:"basic",     name:"Basic",            sub:"% of CTC",          checked:true,  amount:0, includeInLetter:true },
  { id:"perfBonus", name:"Performance Bonus",sub:"% of CTC",          checked:false, amount:0, includeInLetter:false },
  { id:"da",        name:"DA",               sub:"INR",               checked:false, amount:0, includeInLetter:false },
  { id:"varPay",    name:"Variable Pay",     sub:"% of CTC",          checked:false, amount:0, includeInLetter:false },
  { id:"gratuity",  name:"Gratuity",         sub:"% of Basic-Retiral",checked:true,  amount:0, includeInLetter:true },
  { id:"hra",       name:"HRA",              sub:"% of Basic",        checked:true,  amount:0, includeInLetter:true },
];
const INIT_BENEFITS: Benefit[] = [
  { id:"medIns",    name:"Medical Insurance",   sub:"Yearly",  checked:false, amount:0, includeInLetter:false },
  { id:"broadband", name:"Broadband Allowance", sub:"Monthly", checked:false, amount:0, includeInLetter:false },
  { id:"transport", name:"Transport Allowance", sub:"Monthly", checked:false, amount:1600, includeInLetter:true },
  { id:"sodexo",    name:"Sodexo",              sub:"Monthly", checked:false, amount:0, includeInLetter:false },
];
const INIT_DEDUCTIONS: Deduction[] = [
  { id:"epfesi",  name:"EPF & ESI",          sub:"Regulatory check Std Rate", checked:true,  amount:0, includeInLetter:true },
  { id:"medIns2", name:"Medical Insurance",  sub:"Yearly",                    checked:false, amount:0, includeInLetter:false },
];

const INIT_BASIC: BasicRow[]       = [{ sl:1, value:40.0 }];
const INIT_EPF: EpfRow[]           = [
  { sl:1, welfare:"EPF", employee:12.0, employer:12.0 },
  { sl:2, welfare:"ESI", employee:0.75, employer:3.25 },
];
const INIT_HRA: HraRow[] = [
  { sl:1, hra:40.0, state:"Andhra Pradesh", city:"Tirupati" },
  { sl:2, hra:40.0, state:"Tamil Nadu",     city:"Chennai"  },
  { sl:3, hra:40.0, state:"Karnataka",      city:"Bengaluru"},
];
const INIT_GRATUITY: GratuityRow[] = [{ sl:1, value:4.8 }];

const INDIA_STATES: Record<string, string[]> = {
  "Andhra Pradesh":     ["Visakhapatnam","Vijayawada","Tirupati","Guntur","Nellore"],
  "Karnataka":          ["Bengaluru","Mysuru","Hubli","Mangaluru","Belagavi"],
  "Tamil Nadu":         ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem"],
  "Maharashtra":        ["Mumbai","Pune","Nagpur","Nashik","Aurangabad"],
  "Telangana":          ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam"],
  "Delhi":              ["New Delhi","Dwarka","Rohini","Pitampura","Laxmi Nagar"],
  "West Bengal":        ["Kolkata","Siliguri","Durgapur","Asansol","Howrah"],
  "Gujarat":            ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar"],
  "Rajasthan":          ["Jaipur","Jodhpur","Udaipur","Kota","Ajmer"],
  "Uttar Pradesh":      ["Lucknow","Kanpur","Varanasi","Agra","Allahabad"],
  "Kerala":             ["Kochi","Thiruvananthapuram","Kozhikode","Thrissur","Kollam"],
  "Punjab":             ["Chandigarh","Ludhiana","Amritsar","Jalandhar","Patiala"],
  "Madhya Pradesh":     ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain"],
};

const ITEMS_PER_PAGE = 5;

const LS = {
  salary:     "sc_salary",
  benefits:   "sc_benefits",
  deductions: "sc_deductions",
  basic:      "sc_basic",
  epf:        "sc_epf",
  hra:        "sc_hra",
  gratuity:   "sc_gratuity",
};

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
  </svg>
);
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
);
const XIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

function Pagination({ page, total, perPage, onChange }: { page:number; total:number; perPage:number; onChange:(p:number)=>void }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-1 mt-5">
      <button disabled={page===1} onClick={()=>onChange(page-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold">‹</button>
      {Array.from({length:pages},(_,i)=>i+1).map(p=>(
        <button key={p} onClick={()=>onChange(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${p===page?"bg-blue-600 text-white shadow-sm":"text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}>{p}</button>
      ))}
      <button disabled={page===pages} onClick={()=>onChange(page+1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold">›</button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(15,23,42,0.5)",backdropFilter:"blur(6px)"}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4">
          <h3 className="text-white font-bold text-lg">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, readOnly, type="text" }: { label:string; value:string|number; onChange?:(v:string)=>void; readOnly?:boolean; type?:string }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input type={type} readOnly={readOnly} value={value} onChange={e=>onChange?.(e.target.value)}
      className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly?"bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200":"border-slate-300 bg-white text-slate-800 hover:border-blue-300"}`}/>
  </div>
);

const SelectField = ({ label, value, options, onChange, placeholder }: { label:string; value:string; options:string[]; onChange:(v:string)=>void; placeholder?:string }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 appearance-none hover:border-blue-300 transition-all pr-9">
        <option value="">{placeholder || `— Select ${label} —`}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </div>
    </div>
  </div>
);

const ModalActions = ({ onSave, onClose, saveLabel="Update" }: { onSave:()=>void; onClose:()=>void; saveLabel?:string }) => (
  <div className="flex gap-3 mt-6">
    <button onClick={onSave} className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-wide transition-all shadow-sm">{saveLabel}</button>
    <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold py-2.5 rounded-xl text-sm uppercase tracking-wide transition-all">Cancel</button>
  </div>
);

const NoteBox = ({ children }: { children:React.ReactNode }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-5">
    <strong className="block mb-1">Note:</strong>{children}
  </div>
);

const Card = ({ children, className="" }: { children:React.ReactNode; className?:string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const AddRowBtn = ({ onClick, label="Add Row" }: { onClick:()=>void; label?:string }) => (
  <button onClick={onClick} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
    {label}
  </button>
);

const TableHead = ({ cols }: { cols: { label:string; span:number; right?:boolean }[] }) => (
  <div className="grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-widest pb-2.5 border-b-2 border-slate-100 mb-1">
    {cols.map(c=><span key={c.label} className={`col-span-${c.span} ${c.right?"text-right":""}`}>{c.label}</span>)}
  </div>
);

function SaveBtn({ onSave }: { onSave: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const handle = async () => {
    setSaving(true);
    try { await onSave(); setSaved(true); setTimeout(()=>setSaved(false), 3000); }
    finally { setSaving(false); }
  };
  return (
    <button onClick={handle} disabled={saving}
      className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60
        ${saved ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
      {saving ? (
        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
      ) : saved ? (
        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Saved!</>
      ) : (
        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>Save</>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   SALARY SUMMARY VIEW — syncs with Basic & Gratuity tabs
═══════════════════════════════════════════════════ */
function SalarySummaryView({ salary, basicRows, setBasicRows, gratuityRows, setGratuityRows, onBack }: {
  salary: SalaryComp[];
  basicRows: BasicRow[];
  setBasicRows: React.Dispatch<React.SetStateAction<BasicRow[]>>;
  gratuityRows: GratuityRow[];
  setGratuityRows: React.Dispatch<React.SetStateAction<GratuityRow[]>>;
  onBack: () => void;
}) {
  const checkedSalary = salary.filter(s => s.checked);

  const [basicVal,    setBasicVal]    = useState(String(basicRows[0]?.value    ?? 40));
  const [gratuityVal, setGratuityVal] = useState(String(gratuityRows[0]?.value ?? 4.8));

  // Keep local inputs in sync if parent rows change externally
  useEffect(() => { setBasicVal(String(basicRows[0]?.value ?? 40)); },    [basicRows]);
  useEffect(() => { setGratuityVal(String(gratuityRows[0]?.value ?? 4.8)); }, [gratuityRows]);

  const handleBasicChange = (v: string) => {
    setBasicVal(v);
    const num = parseFloat(v);
    if (!isNaN(num)) {
      // ✅ Update basicRows[0] value — keeps Basic tab in sync
      setBasicRows(prev => {
        const updated = prev.length > 0
          ? prev.map((r, i) => i === 0 ? { ...r, value: num } : r)
          : [{ sl: 1, value: num }];
        lsSet(LS.basic, updated);
        return updated;
      });
    }
  };

  const handleGratuityChange = (v: string) => {
    setGratuityVal(v);
    const num = parseFloat(v);
    if (!isNaN(num)) {
      // ✅ Update gratuityRows[0] value — keeps Gratuity tab in sync
      setGratuityRows(prev => {
        const updated = prev.length > 0
          ? prev.map((r, i) => i === 0 ? { ...r, value: num } : r)
          : [{ sl: 1, value: num }];
        lsSet(LS.gratuity, updated);
        return updated;
      });
    }
  };

  const handleSave = async () => {
    const basicNum    = parseFloat(basicVal)    || 40;
    const gratuityNum = parseFloat(gratuityVal) || 4.8;

    // Ensure rows are persisted
    setBasicRows(prev => {
      const updated = prev.length > 0
        ? prev.map((r, i) => i === 0 ? { ...r, value: basicNum } : r)
        : [{ sl: 1, value: basicNum }];
      lsSet(LS.basic, updated);
      return updated;
    });
    setGratuityRows(prev => {
      const updated = prev.length > 0
        ? prev.map((r, i) => i === 0 ? { ...r, value: gratuityNum } : r)
        : [{ sl: 1, value: gratuityNum }];
      lsSet(LS.gratuity, updated);
      return updated;
    });

    try {
      await api.post("/company/salary-components", {
        salaryComponents: salary,
        basicValue:    basicNum,
        gratuityValue: gratuityNum,
      });
    } catch {}
  };

  return (
    <div className="space-y-5">
      <NoteBox>
        <ol className="list-decimal list-inside space-y-1">
          <li>HRA will auto-calculate based on the candidate&apos;s work location and can be reviewed on the offer letter edit page.</li>
          <li>EPF and ESI values in Offrd are regulatory compliant, so we don&apos;t recommend editing them. However, you can adjust EPF in the salary components section in the left menu.</li>
          <li>Special Allowance is calculated as the difference between CTC and the total salary components and benefits. It will be automatically added to the salary structure.</li>
        </ol>
      </NoteBox>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">
            Salary Components <span className="text-slate-400 font-normal text-sm">(Calculated Monthly - CTC/12)</span>
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Applicable Value</span>
        </div>

        {checkedSalary.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">No data available</div>
        ) : checkedSalary.map((s, i) => (
          <div key={s.id} className={`grid grid-cols-2 items-center px-6 py-4 ${i < checkedSalary.length - 1 ? "border-b border-slate-100" : ""}`}>
            <span className="text-sm text-slate-700">
              {s.name} <span className="text-blue-500 text-xs">({s.sub})</span>
            </span>

            {s.id === "basic" ? (
              <div className="flex justify-end">
                <div className="relative w-44">
                  <input
                    type="number"
                    value={basicVal}
                    onChange={e => handleBasicChange(e.target.value)}
                    className="w-full border border-blue-300 rounded-xl px-4 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 transition-all"
                    placeholder="40"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">%</span>
                </div>
              </div>
            ) : s.id === "gratuity" ? (
              <div className="flex justify-end">
                <div className="relative w-44">
                  <input
                    type="number"
                    value={gratuityVal}
                    onChange={e => handleGratuityChange(e.target.value)}
                    className="w-full border border-blue-300 rounded-xl px-4 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 transition-all"
                    placeholder="4.8"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">%</span>
                </div>
              </div>
            ) : (
              <div className="text-right text-xs text-slate-300 italic">auto-calculated</div>
            )}
          </div>
        ))}
      </Card>

      <div className="flex items-center justify-between pt-1">
        <button onClick={onBack}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>
        <SaveBtn onSave={handleSave}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CUSTOMIZE TAB
═══════════════════════════════════════════════════ */
function AddCompModal({ title, onAdd, onClose }: { title:string; onAdd:(n:string,s:string,a:number,inc:boolean)=>void; onClose:()=>void }) {
  const [name, setName] = useState("");
  const [sub,  setSub]  = useState("");
  const [amt,  setAmt]  = useState("0");
  const [inc,  setInc]  = useState(true);
  return (
    <Modal title={`Add ${title}`} onClose={onClose}>
      <Field label="Component Name" value={name} onChange={setName}/>
      <Field label="Calculation Basis (e.g. % of CTC, INR)" value={sub} onChange={setSub}/>
      <Field label="Default Monthly Amount (INR)" value={amt} onChange={setAmt} type="number"/>
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={inc} onChange={e=>setInc(e.target.checked)} id="inc-off"/>
        <label htmlFor="inc-off" className="text-sm text-slate-600 font-bold">Include in Offer Letter Table</label>
      </div>
      <ModalActions onSave={()=>{ if(name.trim()){ onAdd(name.trim(), sub.trim()||"Custom", Number(amt)||0, inc); onClose(); }}} onClose={onClose} saveLabel="Add"/>
    </Modal>
  );
}

function EditCompModal({ item, onSave, onClose }: {
  item: SalaryComp | Benefit | Deduction;
  onSave: (name: string, sub: string, amount: number, includeInLetter: boolean) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [sub,  setSub]  = useState(item.sub);
  const [amt,  setAmt]  = useState(String(item.amount || 0));
  const [inc,  setInc]  = useState(item.includeInLetter ?? true);
  return (
    <Modal title="Edit Component" onClose={onClose}>
      <Field label="Component Name" value={name} onChange={setName}/>
      <Field label="Calculation Basis" value={sub} onChange={setSub}/>
      <Field label="Default Monthly Amount (INR)" value={amt} onChange={setAmt} type="number"/>
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={inc} onChange={e=>setInc(e.target.checked)} id="edit-inc"/>
        <label htmlFor="edit-inc" className="text-sm text-slate-600 font-bold">Include in Offer Letter Table</label>
      </div>
      <ModalActions onSave={()=>{ if(name.trim()){ onSave(name.trim(), sub.trim()||item.sub, Number(amt)||0, inc); onClose(); }}} onClose={onClose} saveLabel="Update"/>
    </Modal>
  );
}

function CustomizeTab({ salary, setSalary, benefits, setBenefits, deductions, setDeductions, onNext }: {
  salary: SalaryComp[]; setSalary: React.Dispatch<React.SetStateAction<SalaryComp[]>>;
  benefits: Benefit[]; setBenefits: React.Dispatch<React.SetStateAction<Benefit[]>>;
  deductions: Deduction[]; setDeductions: React.Dispatch<React.SetStateAction<Deduction[]>>;
  onNext: () => void;
}) {
  const [addModal,  setAddModal]  = useState<"salary"|"benefit"|"deduction"|null>(null);
  const [editModal, setEditModal] = useState<{ type:"salary"|"benefit"|"deduction"; item: SalaryComp|Benefit|Deduction }|null>(null);

  const persistSave = async () => {
    lsSet(LS.salary,     salary);
    lsSet(LS.benefits,   benefits);
    lsSet(LS.deductions, deductions);
    try { await api.post("/company/salary-components/customize", { salary, benefits, deductions }); } catch {}
  };

  const CheckItem = ({
    item, onToggle, onDelete, onEdit,
  }: {
    item: { name:string; sub:string; checked:boolean; custom?:boolean };
    onToggle: () => void; onDelete?: () => void; onEdit?: () => void;
  }) => (
    <div className="relative flex items-start gap-3 group select-none">
      <div className="flex items-start gap-3 cursor-pointer flex-1" onClick={onToggle}>
        <div className={`mt-0.5 w-5 h-5 rounded-md flex-shrink-0 border-2 flex items-center justify-center transition-all duration-150 ${item.checked?"bg-blue-600 border-blue-600":"border-slate-300 group-hover:border-blue-400"}`}>
          {item.checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{item.name}</div>
          <div className="text-xs text-blue-500 mt-0.5">({item.sub})</div>
        </div>
      </div>
      {onEdit && (
        <button onClick={e=>{ e.stopPropagation(); onEdit(); }}
          className="absolute -top-1 right-4 w-4 h-4 rounded-full bg-amber-400 hover:bg-amber-500 text-white flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100 z-10" title="Edit">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
        </button>
      )}
      {item.custom && onDelete && (
        <button onClick={e=>{ e.stopPropagation(); onDelete(); }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100 z-10" title="Remove">
          <XIcon/>
        </button>
      )}
    </div>
  );

  const PlusBtn = ({ onClick }: { onClick:()=>void }) => (
    <button onClick={onClick}
      className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md transition-all self-start mt-0.5">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
    </button>
  );

  return (
    <div className="space-y-4">
      <NoteBox>
        Please include all salary components and benefits offered by your company in this section.{" "}
        <span className="font-semibold text-amber-900">Click &quot;Save&quot; to preserve your changes — including any custom components you add — so they don&apos;t disappear on refresh.</span>
      </NoteBox>

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-800">Salary Components <span className="text-slate-400 font-normal">(Calculated Monthly - CTC/12)</span></h3>
          <p className="text-xs text-slate-400 mt-0.5">Hint: You can add up to four new custom components</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 items-start">
          {salary.map(c=>(
            <CheckItem key={c.id} item={c}
              onToggle={()=>setSalary(s=>s.map(x=>x.id===c.id?{...x,checked:!x.checked}:x))}
              onEdit={()=>setEditModal({ type:"salary", item: c })}
              onDelete={c.custom ? ()=>setSalary(s=>s.filter(x=>x.id!==c.id)) : undefined}/>
          ))}
          <PlusBtn onClick={()=>setAddModal("salary")}/>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-800">Benefits and Allowance</h3>
          <p className="text-xs text-slate-400 mt-0.5">Hint: You can add a total of six custom components, for both Benefits and Deductions.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 items-start">
          {benefits.map(b=>(
            <CheckItem key={b.id} item={b}
              onToggle={()=>setBenefits(s=>s.map(x=>x.id===b.id?{...x,checked:!x.checked}:x))}
              onEdit={()=>setEditModal({ type:"benefit", item: b })}
              onDelete={b.custom ? ()=>setBenefits(s=>s.filter(x=>x.id!==b.id)) : undefined}/>
          ))}
          <PlusBtn onClick={()=>setAddModal("benefit")}/>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-800">Deductions <span className="text-slate-400 font-normal">(Monthly)</span></h3>
          <p className="text-xs text-slate-400 mt-0.5">Hint: You can add a total of six custom components, for both Benefits and Deductions.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 items-start">
          {deductions.map(d=>(
            <CheckItem key={d.id} item={d}
              onToggle={()=>setDeductions(s=>s.map(x=>x.id===d.id?{...x,checked:!x.checked}:x))}
              onEdit={()=>setEditModal({ type:"deduction", item: d })}
              onDelete={d.custom ? ()=>setDeductions(s=>s.filter(x=>x.id!==d.id)) : undefined}/>
          ))}
          <PlusBtn onClick={()=>setAddModal("deduction")}/>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-1">
        <SaveBtn onSave={persistSave}/>
        <button onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      {addModal==="salary"    && <AddCompModal title="Salary Component"    onAdd={(n,s,a,inc)=>setSalary(cs=>[...cs,{id:Date.now()+"",name:n,sub:s,checked:true,custom:true,amount:a,includeInLetter:inc}])}     onClose={()=>setAddModal(null)}/>}
      {addModal==="benefit"   && <AddCompModal title="Benefit / Allowance" onAdd={(n,s,a,inc)=>setBenefits(cs=>[...cs,{id:Date.now()+"",name:n,sub:s,checked:true,custom:true,amount:a,includeInLetter:inc}])}   onClose={()=>setAddModal(null)}/>}
      {addModal==="deduction" && <AddCompModal title="Deduction"           onAdd={(n,s,a,inc)=>setDeductions(cs=>[...cs,{id:Date.now()+"",name:n,sub:s,checked:true,custom:true,amount:a,includeInLetter:inc}])} onClose={()=>setAddModal(null)}/>}

      {editModal?.type==="salary" && (
        <EditCompModal item={editModal.item} onClose={()=>setEditModal(null)}
          onSave={(name,sub,amount,includeInLetter)=>setSalary(s=>s.map(x=>x.id===editModal.item.id?{...x,name,sub,amount,includeInLetter}:x))}/>
      )}
      {editModal?.type==="benefit" && (
        <EditCompModal item={editModal.item} onClose={()=>setEditModal(null)}
          onSave={(name,sub,amount,includeInLetter)=>setBenefits(s=>s.map(x=>x.id===editModal.item.id?{...x,name,sub,amount,includeInLetter}:x))}/>
      )}
      {editModal?.type==="deduction" && (
        <EditCompModal item={editModal.item} onClose={()=>setEditModal(null)}
          onSave={(name,sub,amount,includeInLetter)=>setDeductions(s=>s.map(x=>x.id===editModal.item.id?{...x,name,sub,amount,includeInLetter}:x))}/>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BASIC TAB
═══════════════════════════════════════════════════ */
function BasicTab({ rows, setRows }: { rows: BasicRow[]; setRows: React.Dispatch<React.SetStateAction<BasicRow[]>> }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<BasicRow|null>(null);
  const [adding,  setAdding]  = useState(false);
  const [editVal, setEditVal] = useState("");
  const [newVal,  setNewVal]  = useState("");
  const paged = rows.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const openEdit = (r:BasicRow) => { setEditing(r); setEditVal(String(r.value)); };
  const saveEdit = () => {
    if(!editing) return;
    const updated = rows.map(r=>r.sl===editing.sl?{...r,value:parseFloat(editVal)||r.value}:r);
    setRows(updated);
    lsSet(LS.basic, updated);
    setEditing(null);
  };
  const deleteRow = (sl:number) => {
    const updated = rows.filter(r=>r.sl!==sl).map((r,i)=>({...r,sl:i+1}));
    setRows(updated); lsSet(LS.basic, updated); setPage(1);
  };
  const addRow = () => {
    const v=parseFloat(newVal);
    if(isNaN(v)) return;
    const updated = [...rows,{sl:rows.length+1,value:v}];
    setRows(updated); lsSet(LS.basic, updated); setNewVal(""); setAdding(false);
  };
  const persistSave = async () => { lsSet(LS.basic, rows); };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black text-blue-600">Basic <span className="text-slate-400 font-normal text-lg">(% of CTC-Monthly)</span></h2>
        <div className="flex items-center gap-2">
          <SaveBtn onSave={persistSave}/>
          <AddRowBtn onClick={()=>setAdding(true)}/>
        </div>
      </div>
      <TableHead cols={[{label:"SL NO",span:2},{label:"BASIC",span:8},{label:"ACTIONS",span:2,right:true}]}/>
      {paged.map(r=>(
        <div key={r.sl} className="grid grid-cols-12 items-center py-3.5 border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50 rounded-xl transition-colors px-1">
          <span className="col-span-2 text-slate-400 font-medium">{r.sl}</span>
          <span className="col-span-8 font-bold text-slate-800">{r.value.toFixed(1)} %</span>
          <div className="col-span-2 flex justify-end gap-1.5">
            <button onClick={()=>openEdit(r)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"><PencilIcon/></button>
            <button onClick={()=>deleteRow(r.sl)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><TrashIcon/></button>
          </div>
        </div>
      ))}
      <Pagination page={page} total={rows.length} perPage={ITEMS_PER_PAGE} onChange={setPage}/>
      {editing && <Modal title="Edit Basic %" onClose={()=>setEditing(null)}><Field label="Basic Percentage (%)" value={editVal} onChange={setEditVal} type="number"/><ModalActions onSave={saveEdit} onClose={()=>setEditing(null)}/></Modal>}
      {adding  && <Modal title="Add Basic Row" onClose={()=>setAdding(false)}><Field label="Basic Percentage (%)" value={newVal} onChange={setNewVal} type="number"/><ModalActions onSave={addRow} onClose={()=>setAdding(false)} saveLabel="Add"/></Modal>}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   EPF & ESI TAB
═══════════════════════════════════════════════════ */
function EpfEsiTab({ rows, setRows }: { rows: EpfRow[]; setRows: React.Dispatch<React.SetStateAction<EpfRow[]>> }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<EpfRow|null>(null);
  const [adding,  setAdding]  = useState(false);
  const [addForm, setAddForm] = useState({ welfare:"", employee:"", employer:"" });
  const paged = rows.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const saveEdit = () => {
    if(!editing) return;
    const updated = rows.map(r=>r.sl===editing.sl?{...editing,employee:Number(editing.employee),employer:Number(editing.employer)}:r);
    setRows(updated); lsSet(LS.epf, updated); setEditing(null);
  };
  const deleteRow = (sl:number) => {
    const updated = rows.filter(r=>r.sl!==sl).map((r,i)=>({...r,sl:i+1}));
    setRows(updated); lsSet(LS.epf, updated); setPage(1);
  };
  const addRow = () => {
    if(!addForm.welfare.trim()) return;
    const updated = [...rows,{sl:rows.length+1,welfare:addForm.welfare,employee:parseFloat(addForm.employee)||0,employer:parseFloat(addForm.employer)||0}];
    setRows(updated); lsSet(LS.epf, updated); setAddForm({welfare:"",employee:"",employer:""}); setAdding(false);
  };
  const persistSave = async () => { lsSet(LS.epf, rows); };

  return (
    <Card className="p-6">
      <NoteBox><ol className="list-decimal list-inside space-y-1"><li>Employee Provident Fund (% of CTC, excluding Gratuity, MedIns, HRA)</li><li>Employee State Insurance (% of CTC, excluding Gratuity, MedIns, EPF)</li></ol></NoteBox>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black text-blue-600">EPF &amp; ESI</h2>
        <div className="flex items-center gap-2">
          <SaveBtn onSave={persistSave}/>
          <AddRowBtn onClick={()=>setAdding(true)}/>
        </div>
      </div>
      <TableHead cols={[{label:"SL NO",span:1},{label:"WELFARE",span:3},{label:"EMPLOYEE",span:3},{label:"EMPLOYER",span:3},{label:"ACTIONS",span:2,right:true}]}/>
      {paged.map(r=>(
        <div key={r.sl} className="grid grid-cols-12 items-center py-3.5 border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50 rounded-xl transition-colors px-1">
          <span className="col-span-1 text-slate-400">{r.sl}</span>
          <span className="col-span-3 font-semibold text-slate-800">{r.welfare}</span>
          <span className="col-span-3 text-slate-700">{r.employee.toFixed(2)} %</span>
          <span className="col-span-3 text-slate-700">{r.employer.toFixed(2)} %</span>
          <div className="col-span-2 flex justify-end gap-1.5">
            <button onClick={()=>setEditing({...r})} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"><PencilIcon/></button>
            <button onClick={()=>deleteRow(r.sl)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><TrashIcon/></button>
          </div>
        </div>
      ))}
      <Pagination page={page} total={rows.length} perPage={ITEMS_PER_PAGE} onChange={setPage}/>
      {editing && <Modal title="Edit Welfare" onClose={()=>setEditing(null)}>
        <Field label="Welfare" value={editing.welfare} readOnly/>
        <Field label="Employee (%)" value={editing.employee} onChange={v=>setEditing({...editing,employee:v as any})} type="number"/>
        <Field label="Employer (%)" value={editing.employer} onChange={v=>setEditing({...editing,employer:v as any})} type="number"/>
        <ModalActions onSave={saveEdit} onClose={()=>setEditing(null)}/>
      </Modal>}
      {adding && <Modal title="Add Welfare Row" onClose={()=>setAdding(false)}>
        <Field label="Welfare Name" value={addForm.welfare} onChange={v=>setAddForm({...addForm,welfare:v})}/>
        <Field label="Employee (%)" value={addForm.employee} onChange={v=>setAddForm({...addForm,employee:v})} type="number"/>
        <Field label="Employer (%)" value={addForm.employer} onChange={v=>setAddForm({...addForm,employer:v})} type="number"/>
        <ModalActions onSave={addRow} onClose={()=>setAdding(false)} saveLabel="Add"/>
      </Modal>}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   HRA TAB
═══════════════════════════════════════════════════ */
function HraTab({ rows, setRows }: { rows: HraRow[]; setRows: React.Dispatch<React.SetStateAction<HraRow[]>> }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<HraRow|null>(null);
  const [adding,  setAdding]  = useState(false);
  const [addForm, setAddForm] = useState({ hra:"", state:"", city:"" });
  const paged = rows.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);
  const stateList = Object.keys(INDIA_STATES).sort();
  const citiesFor = (s:string) => INDIA_STATES[s] ?? [];

  const saveEdit = () => {
    if(!editing) return;
    const updated = rows.map(r=>r.sl===editing.sl?{...editing,hra:Number(editing.hra)}:r);
    setRows(updated); lsSet(LS.hra, updated); setEditing(null);
  };
  const deleteRow = (sl:number) => {
    const updated = rows.filter(r=>r.sl!==sl).map((r,i)=>({...r,sl:i+1}));
    setRows(updated); lsSet(LS.hra, updated); setPage(1);
  };
  const addRow = () => {
    if(!addForm.state||!addForm.city) return;
    const updated = [...rows,{sl:rows.length+1,hra:parseFloat(addForm.hra)||0,state:addForm.state,city:addForm.city}];
    setRows(updated); lsSet(LS.hra, updated); setAddForm({hra:"",state:"",city:""}); setAdding(false);
  };
  const persistSave = async () => { 
    lsSet(LS.hra, rows); 
    try { await api.post("/company/hra-rules/bulk", { rules: rows }); } catch {}
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black text-blue-600">HRA <span className="text-slate-400 font-normal text-lg">(% of Basic-Monthly)</span></h2>
        <div className="flex items-center gap-2">
          <SaveBtn onSave={persistSave}/>
          <AddRowBtn onClick={()=>setAdding(true)} label="Add Location"/>
        </div>
      </div>
      <TableHead cols={[{label:"SL NO",span:1},{label:"HRA",span:2},{label:"STATE",span:3},{label:"CITY",span:4},{label:"ACTIONS",span:2,right:true}]}/>
      {paged.map(r=>(
        <div key={r.sl} className="grid grid-cols-12 items-center py-3.5 border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50 rounded-xl transition-colors px-1">
          <span className="col-span-1 text-slate-400">{r.sl}</span>
          <span className="col-span-2 font-bold text-slate-800">{r.hra.toFixed(1)} %</span>
          <span className="col-span-3 text-slate-600">{r.state}</span>
          <span className="col-span-4 text-slate-600">{r.city}</span>
          <div className="col-span-2 flex justify-end gap-1.5">
            <button onClick={()=>setEditing({...r})} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"><PencilIcon/></button>
            <button onClick={()=>deleteRow(r.sl)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><TrashIcon/></button>
          </div>
        </div>
      ))}
      <Pagination page={page} total={rows.length} perPage={ITEMS_PER_PAGE} onChange={setPage}/>
      {editing && <Modal title="Edit HRA Location" onClose={()=>setEditing(null)}>
        <SelectField label="State" value={editing.state} options={stateList} onChange={v=>setEditing({...editing,state:v,city:""})} placeholder="— Select State —"/>
        <SelectField label="City" value={editing.city} options={citiesFor(editing.state)} onChange={v=>setEditing({...editing,city:v})} placeholder="— Select City —"/>
        <Field label="HRA Percentage (%)" value={editing.hra} onChange={v=>setEditing({...editing,hra:v as any})} type="number"/>
        <ModalActions onSave={saveEdit} onClose={()=>setEditing(null)}/>
      </Modal>}
      {adding && <Modal title="Add HRA Location" onClose={()=>setAdding(false)}>
        <SelectField label="State" value={addForm.state} options={stateList} onChange={v=>setAddForm({...addForm,state:v,city:""})} placeholder="— Select State —"/>
        <SelectField label="City" value={addForm.city} options={citiesFor(addForm.state)} onChange={v=>setAddForm({...addForm,city:v})} placeholder="— Select City —"/>
        <Field label="HRA Percentage (%)" value={addForm.hra} onChange={v=>setAddForm({...addForm,hra:v})} type="number"/>
        <ModalActions onSave={addRow} onClose={()=>setAdding(false)} saveLabel="Add"/>
      </Modal>}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   GRATUITY TAB
═══════════════════════════════════════════════════ */
function GratuityTab({ rows, setRows }: { rows: GratuityRow[]; setRows: React.Dispatch<React.SetStateAction<GratuityRow[]>> }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<GratuityRow|null>(null);
  const [adding,  setAdding]  = useState(false);
  const [editVal, setEditVal] = useState("");
  const [newVal,  setNewVal]  = useState("");
  const paged = rows.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const openEdit = (r:GratuityRow) => { setEditing(r); setEditVal(String(r.value)); };
  const saveEdit = () => {
    if(!editing) return;
    const updated = rows.map(r=>r.sl===editing.sl?{...r,value:parseFloat(editVal)||r.value}:r);
    setRows(updated); lsSet(LS.gratuity, updated); setEditing(null);
  };
  const deleteRow = (sl:number) => {
    const updated = rows.filter(r=>r.sl!==sl).map((r,i)=>({...r,sl:i+1}));
    setRows(updated); lsSet(LS.gratuity, updated); setPage(1);
  };
  const addRow = () => {
    const v=parseFloat(newVal);
    if(isNaN(v)) return;
    const updated = [...rows,{sl:rows.length+1,value:v}];
    setRows(updated); lsSet(LS.gratuity, updated); setNewVal(""); setAdding(false);
  };
  const persistSave = async () => { lsSet(LS.gratuity, rows); };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black text-blue-600">Gratuity <span className="text-slate-400 font-normal text-lg">(% of Basic-Retiral)</span></h2>
        <div className="flex items-center gap-2">
          <SaveBtn onSave={persistSave}/>
          <AddRowBtn onClick={()=>setAdding(true)}/>
        </div>
      </div>
      <TableHead cols={[{label:"SL NO",span:2},{label:"GRATUITY",span:8},{label:"ACTIONS",span:2,right:true}]}/>
      {paged.map(r=>(
        <div key={r.sl} className="grid grid-cols-12 items-center py-3.5 border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50 rounded-xl transition-colors px-1">
          <span className="col-span-2 text-slate-400">{r.sl}</span>
          <span className="col-span-8 font-bold text-slate-800">{r.value.toFixed(1)} %</span>
          <div className="col-span-2 flex justify-end gap-1.5">
            <button onClick={()=>openEdit(r)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"><PencilIcon/></button>
            <button onClick={()=>deleteRow(r.sl)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><TrashIcon/></button>
          </div>
        </div>
      ))}
      <Pagination page={page} total={rows.length} perPage={ITEMS_PER_PAGE} onChange={setPage}/>
      {editing && <Modal title="Edit Gratuity %" onClose={()=>setEditing(null)}><Field label="Gratuity Percentage (%)" value={editVal} onChange={setEditVal} type="number"/><ModalActions onSave={saveEdit} onClose={()=>setEditing(null)}/></Modal>}
      {adding  && <Modal title="Add Gratuity Row" onClose={()=>setAdding(false)}><Field label="Gratuity Percentage (%)" value={newVal} onChange={setNewVal} type="number"/><ModalActions onSave={addRow} onClose={()=>setAdding(false)} saveLabel="Add"/></Modal>}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
const TABS: { id:Tab; label:string }[] = [
  { id:"customize", label:"Customize" },
  { id:"basic",     label:"Basic"     },
  { id:"epf-esi",   label:"EPF & ESI" },
  { id:"hra",       label:"HRA"       },
  { id:"gratuity",  label:"Gratuity"  },
];

export default function SalaryComponentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("customize");
  const [view,      setView]      = useState<View>("configure");

  const [salary,       setSalary]       = useState<SalaryComp[]>(INIT_SALARY);
  const [benefits,     setBenefits]     = useState<Benefit[]>(INIT_BENEFITS);
  const [deductions,   setDeductions]   = useState<Deduction[]>(INIT_DEDUCTIONS);
  const [basicRows,    setBasicRows]    = useState<BasicRow[]>(INIT_BASIC);
  const [epfRows,      setEpfRows]      = useState<EpfRow[]>(INIT_EPF);
  const [hraRows,      setHraRows]      = useState<HraRow[]>(INIT_HRA);
  const [gratuityRows, setGratuityRows] = useState<GratuityRow[]>(INIT_GRATUITY);

  useEffect(() => {
    setSalary(     lsGet(LS.salary,     INIT_SALARY));
    setBenefits(   lsGet(LS.benefits,   INIT_BENEFITS));
    setDeductions( lsGet(LS.deductions, INIT_DEDUCTIONS));
    setBasicRows(  lsGet(LS.basic,      INIT_BASIC));
    setEpfRows(    lsGet(LS.epf,        INIT_EPF));
    setHraRows(    lsGet(LS.hra,        INIT_HRA));
    setGratuityRows(lsGet(LS.gratuity,  INIT_GRATUITY));
  }, []);

  if (view === "summary") {
    return (
      <AppShell title="Salary Components">
        <div className="mb-5">
          <h2 className="page-title">Salary Components</h2>
          <p className="page-sub">Configure earnings and deductions structure</p>
        </div>
        {/* ✅ Pass setBasicRows & setGratuityRows so summary edits sync to tabs */}
        <SalarySummaryView
          salary={salary}
          basicRows={basicRows}
          setBasicRows={setBasicRows}
          gratuityRows={gratuityRows}
          setGratuityRows={setGratuityRows}
          onBack={()=>setView("configure")}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Salary Components">
      <div className="mb-5">
        <h2 className="page-title">Salary Components</h2>
        <p className="page-sub">Configure earnings and deductions structure</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            className={`px-5 py-2 rounded-2xl text-sm font-semibold border transition-all duration-150 ${activeTab===t.id?"bg-blue-600 text-white border-blue-600 shadow-md":"bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {activeTab==="customize" && <CustomizeTab salary={salary} setSalary={setSalary} benefits={benefits} setBenefits={setBenefits} deductions={deductions} setDeductions={setDeductions} onNext={()=>setView("summary")}/>}
      {activeTab==="basic"    && <BasicTab    rows={basicRows}    setRows={setBasicRows}/>}
      {activeTab==="epf-esi"  && <EpfEsiTab   rows={epfRows}      setRows={setEpfRows}/>}
      {activeTab==="hra"      && <HraTab       rows={hraRows}      setRows={setHraRows}/>}
      {activeTab==="gratuity" && <GratuityTab  rows={gratuityRows} setRows={setGratuityRows}/>}
    </AppShell>
  );
}