import React from "react";
import { MonitorSmartphone, Archive } from "lucide-react";

export default function MyAssets({ assets }: { assets: any[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
          <MonitorSmartphone className="text-blue-600" size={18} /> My Assigned Assets
        </h3>
        
        {assets.length === 0 ? (
          <div className="py-8 text-center text-slate-500 flex flex-col items-center">
            <Archive className="w-10 h-10 text-slate-300 mb-2" />
            <p>You have no assigned assets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div className="font-bold text-slate-800">{asset.name}</div>
                <div className="text-xs text-slate-500 font-medium mb-2">{asset.type}</div>
                {asset.serialNumber && (
                  <div className="text-xs text-slate-400 font-mono">SN: {asset.serialNumber}</div>
                )}
                <div className="mt-3 flex justify-between items-center border-t border-slate-100 pt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned</span>
                  <span className="text-xs font-medium text-slate-700">
                    {new Date(asset.assignedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
