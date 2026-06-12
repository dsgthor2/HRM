import React, { useState } from "react";
import { Target, TrendingUp } from "lucide-react";
import api from "@/lib/api";

export default function MyGoals({ goals, onRefresh }: { goals: any[], onRefresh: () => void }) {
  const handleProgress = async (id: string, progress: number) => {
    try {
      const status = progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";
      await api.put(`/performance/goals/${id}/progress`, { progress, status });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update progress");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
          <Target className="text-blue-600" size={18} /> My OKRs & Goals
        </h3>

        {goals.length === 0 ? (
          <div className="py-8 text-center text-slate-500 flex flex-col items-center">
            <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
            <p>You have no active goals assigned.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal: any) => (
              <div key={goal.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800">{goal.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                    goal.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    goal.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {goal.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                    <span>Progress Tracker</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={goal.progress}
                    onChange={(e) => handleProgress(goal.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  {goal.dueDate && (
                    <div className="text-[10px] text-slate-400 mt-2 text-right">
                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
