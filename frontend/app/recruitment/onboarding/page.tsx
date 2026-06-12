"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CheckCircle2, Circle, Zap, Plus, X, Trash2 } from "lucide-react";

export default function OnboardingPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    api.get("/employees").then(r => setEmployees(r.data)).catch(() => {});
  }, []);

  const loadTasks = (id: string) => {
    setSelectedEmp(id);
    if (id) api.get(`/onboarding/${id}`).then(r => setTasks(r.data)).catch(() => {});
    else setTasks([]);
  };

  const initTasks = async () => {
    if (!selectedEmp) return;
    await api.post(`/onboarding/init/${selectedEmp}`);
    loadTasks(selectedEmp);
  };

  const toggleTask = async (task: any) => {
    await api.put(`/onboarding/${task.id}`, { completed: !task.completed });
    loadTasks(selectedEmp);
  };

  const addCustomTask = async () => {
    if (!newTask.trim() || !selectedEmp) return;
    await api.post("/onboarding", {
      employeeId: selectedEmp,
      taskName: newTask,
      dueDate: new Date(Date.now() + 7 * 86400000)
    });
    setNewTask("");
    loadTasks(selectedEmp);
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/onboarding/${id}`);
    loadTasks(selectedEmp);
  };

  const completed = tasks.filter(t => t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const emp = employees.find(e => e.id === selectedEmp);

  return (
    <AppShell title="Onboarding">
      <div className="mb-5">
        <h2 className="page-title">Employee Onboarding</h2>
        <p className="page-sub">Track new hire onboarding checklist</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="space-y-4">
          <div className="card">
            <label className="label">Select Employee</label>
            <select className="select" value={selectedEmp} onChange={e => loadTasks(e.target.value)}>
              <option value="">Choose employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>

            {emp && (
              <div className="mt-4 p-3 bg-cream rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold">
                    {emp.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-navy text-sm">{emp.name}</div>
                    <div className="text-xs text-slate-400">{emp.designation}</div>
                    <div className="text-xs text-slate-400">
                      Joined: {new Date(emp.joinDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedEmp && (
            <div className="card">
              {tasks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400 mb-3">No tasks yet</p>
                  <button onClick={initTasks} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Zap size={15} /> Initialize Default Tasks
                  </button>
                </div>
              ) : (
                <>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500">Overall Progress</span>
                      <span className="text-xs font-bold text-navy">{completed}/{tasks.length}</span>
                    </div>
                    <div className="h-2.5 bg-cream-dark rounded-full overflow-hidden">
                      <div className="h-full bg-navy rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-center mt-1.5">
                      <span className={`text-sm font-black ${progress === 100 ? "text-emerald-600" : "text-navy"}`}>
                        {progress}% {progress === 100 ? "✅ Complete!" : "complete"}
                      </span>
                    </div>
                  </div>
                  <button onClick={initTasks} className="btn-ghost w-full btn-sm">
                    <Zap size={13} /> Reset to Defaults
                  </button>
                </>
              )}
            </div>
          )}

          {selectedEmp && (
            <div className="card">
              <label className="label">Add Custom Task</label>
              <div className="flex gap-2">
                <input className="input" placeholder="Task name..." value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCustomTask()} />
                <button className="btn-primary px-3" onClick={addCustomTask}><Plus size={15} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Right – Checklist */}
        <div className="col-span-2">
          {!selectedEmp ? (
            <div className="card flex flex-col items-center justify-center h-64 text-slate-400">
              <CheckCircle2 size={48} className="mb-3 opacity-20" />
              <p className="text-sm">Select an employee to manage onboarding</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="card flex flex-col items-center justify-center h-64 text-slate-400">
              <p className="text-sm">Click "Initialize Default Tasks" to get started</p>
            </div>
          ) : (
            <div className="card">
              <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
                Onboarding Checklist
                <span className="badge badge-navy text-xs">{tasks.length} tasks</span>
              </h3>
              <div className="space-y-2">
                {tasks.map(t => (
                  <div key={t.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer group
                      ${t.completed ? "bg-emerald-50 border-emerald-200" : "bg-cream border-transparent hover:border-cream-border"}`}
                    onClick={() => toggleTask(t)}>
                    <div className="flex-shrink-0">
                      {t.completed
                        ? <CheckCircle2 size={20} className="text-emerald-600" />
                        : <Circle size={20} className="text-slate-300 group-hover:text-slate-400" />}
                    </div>
                    <span className={`flex-1 text-sm font-medium ${t.completed ? "line-through text-slate-400" : "text-navy"}`}>
                      {t.taskName}
                    </span>
                    {t.completedAt && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex-shrink-0">
                        ✓ {new Date(t.completedAt).toLocaleDateString("en-IN")}
                      </span>
                    )}
                    {t.dueDate && !t.completed && (
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        Due: {new Date(t.dueDate).toLocaleDateString("en-IN")}
                      </span>
                    )}
                    <button onClick={e => { e.stopPropagation(); deleteTask(t.id); }}
                      className="opacity-0 group-hover:opacity-100 btn-icon text-red-400 hover:bg-red-50 ml-1 flex-shrink-0"
                      title="Remove task">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
