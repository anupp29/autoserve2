import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, AlertTriangle, Truck, DollarSign, MoreVertical, Filter, Download, Settings, Zap, Disc, Wrench, Droplets } from "lucide-react";

const tabs = ["All Inventory", "Low Stock", "Consumables", "Hardware"] as const;

const items = [
  { name: "Brake Pads - Ceramic XL", sku: "SKU-BRK-44901", category: "Braking System", stock: 142, max: 160, status: "Optimal", statusColor: "text-emerald-600 bg-emerald-50", icon: Settings, iconBg: "bg-primary/10", iconColor: "text-primary" },
  { name: "Synthetic Engine Oil 5W-30", sku: "SKU-OIL-11202", category: "Lubricants", stock: 8, max: 65, status: "Critical Stock", statusColor: "text-destructive bg-destructive/10", icon: Droplets, iconBg: "bg-destructive/10", iconColor: "text-destructive", action: "Restock Now" },
  { name: "High Performance Spark Plug", sku: "SKU-ELC-77123", category: "Electrical", stock: 14, max: 50, status: "Low Stock", statusColor: "text-amber-600 bg-amber-50", icon: Zap, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { name: "Michelin Pilot Sport 4S", sku: "SKU-TIR-99044", category: "Tires & Wheels", stock: 12, max: 20, status: "Healthy", statusColor: "text-primary bg-primary/10", icon: Disc, iconBg: "bg-primary/10", iconColor: "text-primary" },
  { name: "Standard Oil Filter (Case)", sku: "SKU-FLT-33410", category: "Filters", stock: 4, max: 12, status: "In Transit", statusColor: "text-primary bg-primary/10", icon: Wrench, iconBg: "bg-primary/10", iconColor: "text-primary" },
];

const ManagerInventory = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Inventory");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Inventory Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time stock management and procurement tracking.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Package, iconBg: "bg-primary/10", iconColor: "text-primary", label: "Total SKU", value: "1,284", sub: "+12 since last week", subColor: "text-emerald-600" },
          { icon: AlertTriangle, iconBg: "bg-destructive/10", iconColor: "text-destructive", label: "Low Stock", value: "28", sub: "● Requires Immediate Action", subColor: "text-destructive", valueColor: "text-destructive" },
          { icon: Truck, iconBg: "bg-primary/10", iconColor: "text-primary", label: "In Transit", value: "15", sub: "Expected delivery by Friday", subColor: "text-emerald-600" },
          { icon: DollarSign, iconBg: "bg-primary/10", iconColor: "text-primary", label: "Valuation", value: "$248.5k", sub: "Inventory Asset Total", subColor: "text-muted-foreground" },
        ].map(k => (
          <div key={k.label} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${k.iconBg}`}><k.icon className={`w-5 h-5 ${k.iconColor}`} /></div>
            </div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{k.label}</p>
            <p className={`text-2xl lg:text-3xl font-black mt-1 ${k.valueColor || "text-on-surface"}`}>{k.value}</p>
            <p className={`text-[10px] ${k.subColor} mt-1`}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 border-b border-border/20 gap-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === t
                    ? t === "Low Stock" ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"
                    : "text-muted-foreground bg-surface-container hover:bg-surface-container-high"
                }`}
              >
                {t === "Low Stock" && "● "}{t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-border/30 rounded-lg text-xs font-medium"><Filter className="w-3.5 h-3.5" /> Filters</button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-border/30 rounded-lg text-xs font-medium"><Download className="w-3.5 h-3.5" /> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                <th className="text-left py-3 px-6 font-bold">Item Name & Reference</th>
                <th className="text-left py-3 px-4 font-bold">Category</th>
                <th className="text-left py-3 px-4 font-bold">Stock Level</th>
                <th className="text-left py-3 px-4 font-bold">Status Badge</th>
                <th className="text-center py-3 px-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {items.map(item => (
                <tr key={item.sku} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.iconBg}`}>
                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{item.category}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.stock / item.max > 0.5 ? "bg-primary" : item.stock / item.max > 0.2 ? "bg-amber-500" : "bg-destructive"}`}
                          style={{ width: `${(item.stock / item.max) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{item.stock} / {item.max} units</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${item.statusColor}`}>{item.status}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {item.action ? (
                      <button className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">{item.action}</button>
                    ) : (
                      <button className="p-1 hover:bg-surface-container rounded"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 lg:p-6 border-t border-border/20">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Showing 1-10 of 1,284 SKU</p>
          <div className="flex gap-1">
            <button className="px-2 py-1 text-xs text-muted-foreground hover:bg-surface-container rounded">‹</button>
            <button className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded">1</button>
            <button className="px-3 py-1 text-xs text-muted-foreground hover:bg-surface-container rounded">2</button>
            <button className="px-3 py-1 text-xs text-muted-foreground hover:bg-surface-container rounded">3</button>
            <button className="px-2 py-1 text-xs text-muted-foreground hover:bg-surface-container rounded">›</button>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">Usage Velocity</h3>
            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> This Month</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-surface-container-high" /> Prev. Month</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {[35,55,40,65,80,70,85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary rounded-t" style={{ height: `${h}%` }} />
                <span className="text-[9px] text-muted-foreground font-mono">Oct {String(i * 7 + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl">
          <h3 className="font-bold mb-2">Automated Ordering</h3>
          <p className="text-sm text-slate-400 mb-4">AI Assistant has identified 4 critical parts that require replenishment based on current work order volume.</p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <span className="text-xs font-bold uppercase tracking-wider">Brake Fluid DOT 4</span>
              <span className="text-xs font-medium">12 Units</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <span className="text-xs font-bold uppercase tracking-wider">Radiator Coolant</span>
              <span className="text-xs font-medium">5 Units</span>
            </div>
          </div>
          <button className="w-full py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors">
            Approve Order $420.50
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerInventory;
