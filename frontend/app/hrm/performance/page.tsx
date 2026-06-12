"use client";
import React, { useEffect, useState } from "react";
import { Target, Trophy, TrendingUp } from "lucide-react";

export default function PerformancePage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/performance/goals`);
      if (res.ok) setGoals(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-blue-600" />
              Performance & OKRs
            </h1>
            <p className="text-slate-500 text-sm mt-1">Track company-wide goals and performance reviews.</p>
          </div>
        </div>

        {/* Goals List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-500" /> Company OKRs
          </h2>
          
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading OKRs...</div>
          ) : goals.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <TrendingUp className="w-12 h-12 text-slate-300 mb-3" />
              <p>No goals have been set yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="border border-slate-100 p-4 rounded-lg hover:border-slate-200 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-slate-900">{goal.title}</h3>
                      <p className="text-sm text-slate-500">{goal.employee?.name} ({goal.employee?.department})</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md border ${
                      goal.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
