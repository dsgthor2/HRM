import React, { useState } from "react";
import { CreditCard, PlusCircle } from "lucide-react";
import api from "@/lib/api";

export default function MyExpenses({ expenses, employeeId, onRefresh }: { expenses: any[], employeeId: string, onRefresh: () => void }) {
  const [form, setForm] = useState({ category: "TRAVEL", amount: "", date: "", description: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/expenses", { ...form, employeeId });
      setForm({ category: "TRAVEL", amount: "", date: "", description: "" });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to submit expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <PlusCircle className="text-emerald-600" size={18} /> Submit New Expense
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>TRAVEL</option>
                <option>MEALS</option>
                <option>INTERNET</option>
                <option>OTHER</option>
              </select>
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input type="number" required className="input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input type="date" required className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div>
              <label className="label">Description</label>
              <input type="text" required className="input" placeholder="Client lunch, cab fare..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Submitting..." : "Submit Claim"}
          </button>
        </form>
      </div>

      {expenses.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <CreditCard className="text-blue-600" size={18} /> My Claims
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {expenses.map((exp: any) => (
              <div key={exp.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{exp.category}</div>
                  <div className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString()} - {exp.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">₹{exp.amount.toLocaleString()}</div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                    exp.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    exp.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
