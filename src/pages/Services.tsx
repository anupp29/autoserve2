import { useState } from "react";
import { MoreVertical, Plus, Download } from "lucide-react";

const tabs = ["All Services", "Maintenance", "Diagnostics", "Bodywork", "Electrical"];

const services = [
  { id: "SRV-0081", name: "Precision Alignment & Calibration", desc: "Laser Guided / 4-Wheel", category: "Maintenance", price: "$189.00", duration: "90 min", status: "Active" },
  { id: "SRV-0094", name: "ECU Full System Diagnostic", desc: "Deep Scan / Error Logging", category: "Diagnostics", price: "$120.00", duration: "45 min", status: "Active" },
  { id: "SRV-0102", name: "Synthetic Oil Flush & Filter", desc: "Premium Grade / Environmental", category: "Maintenance", price: "$95.00", duration: "30 min", status: "Inactive" },
  { id: "SRV-0115", name: "Quarter-Panel Respray", desc: "Color Matching / UV Protect", category: "Bodywork", price: "$450.00", duration: "240 min", status: "Active" },
  { id: "SRV-0221", name: "HV Battery Health Check", desc: "EV/Hybrid Specialist", category: "Electrical", price: "$210.00", duration: "120 min", status: "Active" },
];

const categoryColors: Record<string, string> = {
  Maintenance: "bg-primary-container text-primary-container-foreground",
  Diagnostics: "bg-tertiary-container text-tertiary-container-foreground",
  Bodywork: "bg-amber-100 text-amber-700",
  Electrical: "bg-emerald-100 text-emerald-700",
};

const Services = () => {
  const [activeTab, setActiveTab] = useState("All Services");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Service Catalogue</h1>
          <p className="text-sm text-muted-foreground mt-1">Managing 42 total operational services across 4 categories</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-outline rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low">
            <Download className="w-4 h-4" />
            Export Manifest
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            Register Service
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-surface-container rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-on-surface text-white shadow-sm"
                : "text-muted-foreground hover:bg-surface-container-high"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-outline/20 overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Service ID</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Service Name</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Category</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Base Price</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Duration</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/20">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-5 font-mono text-sm font-bold text-on-surface">{s.id}</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-on-surface">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">{s.desc}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${categoryColors[s.category] || "bg-surface-container text-muted-foreground"}`}>
                    {s.category}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-on-surface">{s.price}</td>
                <td className="px-6 py-5 text-sm text-muted-foreground">{s.duration}</td>
                <td className="px-6 py-5">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${s.status === "Active" ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-outline/20 flex justify-between items-center">
          <span className="text-xs text-primary font-semibold">Showing 5 of 42 catalogued services</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs text-muted-foreground">‹</button>
            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg font-bold">1</button>
            <button className="px-3 py-1 text-xs text-on-surface">2</button>
            <button className="px-3 py-1 text-xs text-on-surface">3</button>
            <button className="px-3 py-1 text-xs text-muted-foreground">›</button>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-outline/20">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground mb-2">High Demand</p>
          <p className="text-2xl font-bold tracking-tight text-on-surface">Alignment <span className="text-xs text-emerald-600 font-bold">+12%</span></p>
          <p className="text-xs text-muted-foreground mt-1">32 appointments today</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-outline/20">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground mb-2">Avg. Ticket</p>
          <p className="text-2xl font-bold tracking-tight text-on-surface">$142.50</p>
          <div className="w-full h-1 bg-surface-container rounded-full mt-3">
            <div className="h-full bg-primary rounded-full w-3/4" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-outline/20">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground mb-2">Capacity Load</p>
          <p className="text-2xl font-bold tracking-tight text-on-surface">88%</p>
          <p className="text-xs text-amber-600 mt-1">Critical bottleneck (P2)</p>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-6 rounded-xl text-white">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-2">System Health</p>
          <p className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px]">✓</span>
            Fully Sync'd
          </p>
          <p className="text-[10px] font-mono text-white/50 mt-1">Last update: 2m ago</p>
        </div>
      </div>
    </div>
  );
};

export default Services;
