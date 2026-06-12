"use client";
import React, { useEffect, useState } from "react";
import { Receipt, CheckCircle, XCircle, CreditCard } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`);
      if (res.ok) setExpenses(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approvedBy: "HR Admin" })
      });
      if (res.ok) fetchExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="text-blue-600" />
              Expense Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review and approve employee reimbursement requests.</p>
          </div>
        </div>

        {/* Expense List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <CreditCard className="w-12 h-12 text-slate-300 mb-3" />
              <p>No expense claims found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{exp.employee?.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{exp.employee?.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">{exp.category}</div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{exp.description}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ₹{exp.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${exp.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            exp.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {exp.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatus(exp.id, 'APPROVED')} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-md transition">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleStatus(exp.id, 'REJECTED')} className="text-red-600 hover:bg-red-50 p-1.5 rounded-md transition">
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
