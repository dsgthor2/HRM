"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, ArrowLeft, ShieldCheck, Users, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

type Tab = "login" | "register" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  // Login
  const [portalMode, setPortalMode] = useState<"ADMIN" | "EMPLOYEE">("ADMIN");
  const [loginStep, setLoginStep] = useState<"EMAIL_ENTRY" | "CHOOSER" | "PASSWORD">("EMAIL_ENTRY");
  const [companyEmail, setCompanyEmail] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const ADMIN_EMAILS = [
    "harish.m@defenseblu.com",
    "hr@defenseblu.com",
    "admin@defenseblu.com",
    "dheelepsai.n@defenseblu.com",
  ];

  // Register
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);

  // Forgot password
  const [forgotForm, setForgotForm] = useState({ email: "", newPassword: "", confirm: "" });
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await api.post("/auth/login", loginForm);
      setAuth(res.data.token, res.data.user);
      // Redirect based on role
      if (res.data.user.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (regForm.password !== regForm.confirm) {
      setRegError("Passwords do not match");
      return;
    }
    if (regForm.password.length < 6) {
      setRegError("Password must be at least 6 characters");
      return;
    }
    setRegLoading(true);
    try {
      await api.post("/auth/register", {
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        role: "USER"
      });
      setRegSuccess("Account created! You can now log in.");
      setTimeout(() => { setTab("login"); setRegSuccess(""); }, 2000);
    } catch (err: any) {
      setRegError(err.response?.data?.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    if (forgotForm.newPassword !== forgotForm.confirm) {
      setForgotError("Passwords do not match");
      return;
    }
    if (forgotForm.newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters");
      return;
    }
    setForgotLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        email: forgotForm.email,
        newPassword: forgotForm.newPassword
      });
      setForgotSuccess("Password reset successfully! You can now log in.");
      setTimeout(() => { setTab("login"); setForgotSuccess(""); }, 2000);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || "Reset failed");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 bg-navy flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <span className="text-white text-4xl font-black">F</span>
          </div>
          <h1 className="text-white text-3xl font-black mb-2 tracking-tight">DefenseBlu HRMS</h1>
          <p className="text-white/50 text-sm">Consulting Services Pvt Ltd</p>
          <div className="mt-12 space-y-4 text-left">
            {["Employee lifecycle management", "Auto payslip & letter generation", "Attendance & leave tracking", "Recruitment pipeline"].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Two Access Levels</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-white/70 text-xs"><strong className="text-white">Admin</strong> — Full HR management access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-white/70 text-xs"><strong className="text-white">Employee</strong> — Attendance, leaves & profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm slide-in">
          <div className="mb-8 lg:hidden text-center">
            <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-black">F</span>
            </div>
            <h1 className="text-xl font-black text-navy">DefenseBlu HRMS</h1>
          </div>

          {/* Tab Switcher */}
          {tab !== "forgot" && (
            <div className="flex bg-cream-dark rounded-xl p-1 mb-6">
              <button
                onClick={() => { setTab("login"); setRegError(""); setRegSuccess(""); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === "login" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setTab("register"); setLoginError(""); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === "register" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
              >
                Register
              </button>
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <>
              <h2 className="text-2xl font-black text-navy mb-1 text-center">System Portal</h2>
              <p className="text-slate-400 text-sm mb-8 text-center text-balance">Sign in to your DefenseBlu HRMS dashboard</p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div 
                  onClick={() => { setPortalMode("ADMIN"); setLoginStep("EMAIL_ENTRY"); setLoginForm({email: "", password: ""}); setCompanyEmail(""); }}
                  className={clsx(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center",
                    portalMode === "ADMIN" ? "border-blue-600 bg-blue-50/50 shadow-md" : "border-slate-100 bg-white opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="text-xs font-black text-navy uppercase tracking-tighter">Admin</div>
                  <div className="text-[10px] text-slate-500 font-bold leading-tight mt-1">Full Management</div>
                </div>
                <div 
                  onClick={() => { setPortalMode("EMPLOYEE"); setLoginForm({email: "", password: ""}); }}
                  className={clsx(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center",
                    portalMode === "EMPLOYEE" ? "border-emerald-500 bg-emerald-50/50 shadow-md" : "border-slate-100 bg-white opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-3">
                    <Users size={20} />
                  </div>
                  <div className="text-xs font-black text-navy uppercase tracking-tighter">Employee</div>
                  <div className="text-[10px] text-slate-500 font-bold leading-tight mt-1">Attendance & Profile</div>
                </div>
              </div>

              {portalMode === "ADMIN" && loginStep === "EMAIL_ENTRY" ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-2">
                    <p className="text-sm text-slate-500">Please enter your email ID given for company registration</p>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input 
                      type="email" 
                      className="input py-4 text-base" 
                      placeholder="Email"
                      value={companyEmail}
                      onChange={e => {
                        setCompanyEmail(e.target.value);
                        setLoginError(""); // Clear error on change
                      }}
                      required
                    />
                  </div>
                  {loginError && (
                    <div className="text-red-500 text-[11px] bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                       {loginError}
                    </div>
                  )}
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        const email = companyEmail.toLowerCase().trim();
                        if (ADMIN_EMAILS.includes(email)) {
                          setLoginForm(f => ({ ...f, email }));
                          setLoginStep("PASSWORD");
                          setLoginError("");
                        } else {
                          setLoginError("This email is not registered as an administrator.");
                        }
                      }}
                      disabled={!companyEmail}
                      className="btn-primary w-full py-4 text-lg font-black shadow-xl shadow-blue-600/20"
                    >
                      Next
                    </button>
                    <p className="text-xs text-center mt-4 font-bold text-slate-400">
                      New here? <button onClick={() => setTab("register")} className="text-blue-600 hover:underline">Register</button>
                    </p>
                  </div>
                </div>
              ) : portalMode === "ADMIN" && loginStep === "CHOOSER" ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center mb-6">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Account Discovery</p>
                    <p className="text-sm text-slate-600 px-4">Multiple email IDs are associated with <strong>{companyEmail}</strong>. Select one to proceed.</p>
                  </div>
                  <div className="space-y-3">
                    {ADMIN_EMAILS.map(email => (
                      <button 
                        key={email}
                        onClick={() => {
                          setLoginForm(f => ({ ...f, email }));
                        }}
                        className={clsx(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-slate-50 text-left group",
                          loginForm.email === email ? "border-blue-600 bg-blue-50/50 shadow-sm" : "border-slate-100 bg-white"
                        )}
                      >
                        <div className={clsx(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          loginForm.email === email ? "border-blue-600 bg-blue-600" : "border-slate-300"
                        )}>
                          {loginForm.email === email && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-[13px] font-bold text-slate-700 tracking-tight">{email}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="pt-6">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setLoginStep("EMAIL_ENTRY")}
                        className="btn-ghost flex-1 py-4 text-sm font-bold border border-slate-200"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => loginForm.email && setLoginStep("PASSWORD")}
                        disabled={!loginForm.email}
                        className="btn-primary flex-[2] py-4 shadow-xl shadow-blue-600/20 text-lg font-black"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
                  {portalMode === "ADMIN" && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setLoginStep("EMAIL_ENTRY");
                        setLoginError("");
                      }}
                      className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-blue-600 mb-4 transition-colors uppercase tracking-widest"
                    >
                      <ArrowLeft size={10} /> Back to email entry
                    </button>
                  )}
                  
                  {portalMode === "ADMIN" ? (
                    <div className="p-1.5 bg-blue-50 rounded-2xl border border-blue-100 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <KeyRound size={18} />
                      </div>
                      <div className="flex-1 min-w-0 px-2">
                        <div className="text-[10px] uppercase font-black tracking-widest text-blue-600/50 mb-0.5">Admin Account</div>
                        <div className="text-sm font-bold text-navy truncate">{loginForm.email || "Select account"}</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="label">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        className="input" 
                        placeholder="e.g. employee@defenseblu.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                  )}

                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} className="input pr-10"
                        placeholder="••••••••" value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} required />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <button type="button" onClick={() => setTab("forgot")}
                      className="text-xs text-blue-600 hover:underline font-bold">
                      Forgot password?
                    </button>
                  </div>
                  {loginError && (
                    <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-semibold flex items-center gap-2">
                       <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                       {loginError}
                    </div>
                  )}
                  <button type="submit" className="btn-primary w-full py-3 shadow-lg shadow-blue-600/20" disabled={loginLoading}>
                    <LogIn size={16} />
                    {loginLoading ? "Signing in..." : "Sign In to DefenseBlu"}
                  </button>
                </form>
              )}
              
              <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Copyright © Offrd Inc.</p>
              </div>
            </>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <>
              <h2 className="text-2xl font-black text-navy mb-1">Create Account</h2>
              <p className="text-slate-400 text-sm mb-6">Register to access attendance & leaves</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input" placeholder="Your name"
                    value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input type="email" className="input" placeholder="you@defenseblu.com"
                    value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={showRegPw ? "text" : "password"} className="input pr-10"
                      placeholder="Min 6 characters" value={regForm.password}
                      onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} required />
                    <button type="button" onClick={() => setShowRegPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy">
                      {showRegPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" className="input" placeholder="Repeat password"
                    value={regForm.confirm} onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))} required />
                </div>
                {regError && <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{regError}</div>}
                {regSuccess && <div className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{regSuccess}</div>}
                <button type="submit" className="btn-primary w-full py-2.5" disabled={regLoading}>
                  <UserPlus size={16} />
                  {regLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
              <p className="text-xs text-slate-400 mt-4 text-center">
                Employee accounts get access to Attendance, Leaves & Profile only.
              </p>
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {tab === "forgot" && (
            <>
              <button onClick={() => setTab("login")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy mb-6">
                <ArrowLeft size={14} /> Back to Sign In
              </button>
              <h2 className="text-2xl font-black text-navy mb-1">Reset Password</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your email and set a new password</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input type="email" className="input" placeholder="your@email.com"
                    value={forgotForm.email} onChange={e => setForgotForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" placeholder="Min 6 characters"
                    value={forgotForm.newPassword} onChange={e => setForgotForm(f => ({ ...f, newPassword: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input" placeholder="Repeat password"
                    value={forgotForm.confirm} onChange={e => setForgotForm(f => ({ ...f, confirm: e.target.value }))} required />
                </div>
                {forgotError && <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{forgotError}</div>}
                {forgotSuccess && <div className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{forgotSuccess}</div>}
                <button type="submit" className="btn-primary w-full py-2.5" disabled={forgotLoading}>
                  <KeyRound size={16} />
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
