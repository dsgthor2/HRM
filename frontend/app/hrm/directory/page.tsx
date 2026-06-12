"use client";
import React, { useEffect, useState } from "react";
import { Users, Search, Mail, Building, Phone } from "lucide-react";

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`);
        if (res.ok) setEmployees(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.department && e.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-blue-600" />
              Employee Directory
            </h1>
            <p className="text-slate-500 text-sm mt-1">Find and connect with colleagues across the company.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or dept..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{emp.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{emp.designation || "Employee"}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Building className="w-3 h-3" /> {emp.department || "General"}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <a href={`mailto:${emp.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
                    <Mail className="w-4 h-4" /> {emp.email}
                  </a>
                  {emp.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" /> {emp.phoneNumber}
                    </div>
                  )}
                  {emp.reportingTo && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-md">
                      <span className="font-medium">Reports to:</span> {emp.reportingTo}
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
