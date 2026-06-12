"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { KeyRound, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-8">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-cream-dark">
        <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-6">
          <KeyRound className="text-white" size={24} />
        </div>
        
        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
            <h2 className="text-2xl font-black text-navy">Password Reset!</h2>
            <p className="text-sm text-slate-500">Your password has been successfully updated.</p>
            <p className="text-xs text-slate-400">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black text-navy mb-2 text-center">Set New Password</h2>
            <p className="text-slate-400 text-sm mb-6 text-center">Please enter your new password below.</p>
            
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <input 
                  type="password" 
                  className="input" 
                  placeholder="Min 6 characters"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  disabled={!token}
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="input" 
                  placeholder="Repeat password"
                  value={confirm} 
                  onChange={e => setConfirm(e.target.value)} 
                  required 
                  disabled={!token}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary w-full py-3 mt-4" 
                disabled={loading || !token}
              >
                {loading ? "Resetting..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
