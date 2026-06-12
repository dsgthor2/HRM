"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Shield, ShieldAlert, UserX, UserCheck, Key, Search } from "lucide-react";

export default function SuperAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/superadmin/users");
      setUsers(data);
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await api.put(`/superadmin/users/${id}`, { role });
      alert("Role updated");
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to update role");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user?`)) return;
    try {
      await api.put(`/superadmin/users/${id}`, { isActive: !currentStatus });
      alert(`User account ${!currentStatus ? 'activated' : 'suspended'}`);
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("WARNING: This will permanently delete this user account. Are you sure?")) return;
    try {
      await api.delete(`/superadmin/users/${id}`);
      alert("User deleted");
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete user");
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt("Enter new password for this user (min 6 chars):");
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await api.put(`/superadmin/users/${id}/password`, { newPassword });
      alert("Password reset successfully");
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to reset password");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} />
            Super Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-2">Manage all system users, access roles, and account security.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-cream-dark overflow-hidden">
        <div className="p-4 border-b border-cream-dark bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role Access</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Security Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-semibold text-navy">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-slate-100 border-none rounded text-sm font-medium focus:ring-2 focus:ring-indigo-500 p-1.5"
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="HR">HR</option>
                        <option value="RECRUITER">Recruiter</option>
                        <option value="USER">User</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button 
                        onClick={() => handleResetPassword(user.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Force Password Reset"
                      >
                        <Key size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                        title={user.isActive ? "Suspend Account" : "Activate Account"}
                      >
                        {user.isActive ? <ShieldAlert size={18} /> : <UserCheck size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <UserX size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
