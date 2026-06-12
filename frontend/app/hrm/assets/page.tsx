"use client";
import React, { useEffect, useState } from "react";
import { MonitorSmartphone, Search, Plus, Archive, UserCheck, AlertCircle } from "lucide-react";

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", type: "Laptop", serialNumber: "" });

  const fetchAssets = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assets`);
      if (res.ok) setAssets(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAsset, status: "AVAILABLE" })
      });
      if (res.ok) {
        setShowAdd(false);
        setNewAsset({ name: "", type: "Laptop", serialNumber: "" });
        fetchAssets();
      }
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
              <MonitorSmartphone className="text-blue-600" />
              Asset Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage company devices, software licenses, and inventory.</p>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            <Plus size={18} /> Add Asset
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Assets", value: assets.length, color: "bg-slate-100 text-slate-800" },
            { label: "Available", value: assets.filter(a => a.status === 'AVAILABLE').length, color: "bg-emerald-50 text-emerald-700" },
            { label: "Assigned", value: assets.filter(a => a.status === 'ASSIGNED').length, color: "bg-blue-50 text-blue-700" },
            { label: "Maintenance", value: assets.filter(a => a.status === 'MAINTENANCE').length, color: "bg-amber-50 text-amber-700" },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-xl border border-white/50 shadow-sm ${stat.color}`}>
              <div className="text-sm font-medium opacity-80">{stat.label}</div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">New Asset</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
                  <input required type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. MacBook Pro M3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <option>Laptop</option>
                      <option>Monitor</option>
                      <option>Phone</option>
                      <option>Software</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                    <input type="text" value={newAsset.serialNumber} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Optional" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">Save Asset</button>
              </form>
            </div>
          </div>
        )}

        {/* Asset List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading inventory...</div>
          ) : assets.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Archive className="w-12 h-12 text-slate-300 mb-3" />
              <p>No assets found in inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Asset Details</th>
                    <th className="px-6 py-4">Serial No.</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{asset.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{asset.type}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{asset.serialNumber || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${asset.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            asset.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {asset.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                              {asset.assignedTo.name.charAt(0)}
                            </div>
                            <span className="text-slate-700">{asset.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Manage</button>
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
