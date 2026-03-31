import KpiCard from "@/components/ui/KpiCard";
import { Package, AlertTriangle, Truck, DollarSign, MoreVertical } from "lucide-react";

const inventoryItems = [
  { name: "Brake Pads - Ceramic XL", sku: "SKU-BRK-44901", category: "Braking System", stock: 142, max: 160, status: "optimal" as const },
  { name: "Synthetic Engine Oil 5W-30", sku: "SKU-OIL-11202", category: "Lubricants", stock: 8, max: 65, status: "critical" as const },
  { name: "High Performance Spark Plug", sku: "SKU-ELC-77123", category: "Electrical", stock: 14, max: 50, status: "low-stock" as const },
  { name: "Michelin Pilot Sport 4S", sku: "SKU-TIR-99044", category: "Tires & Wheels", stock: 12, max: 20, status: "optimal" as const },
  { name: "Standard Oil Filter (Case)", sku: "SKU-FLT-33410", category: "Filters", stock: 4, max: 12, status: "in-progress" as const },
];

const stockBarColor = (pct: number) => {
  if (pct < 20) return "bg-destructive";
  if (pct < 40) return "bg-amber-500";
  return "bg-primary";
};

const usageData = [30, 50, 45, 65, 80, 70, 90];

const Inventory = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface">Inventory Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time stock management and procurement tracking.</p>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard label="Total SKU" value="1,284" icon={Package} badge="+12" badgeColor="green" subtitle="+12 since last week" />
        <KpiCard label="Low Stock" value="28" icon={AlertTriangle} badgeColor="red" subtitle="Requires Immediate Action" />
        <KpiCard label="In Transit" value="15" icon={Truck} badgeColor="blue" subtitle="Expected delivery by Friday" />
        <KpiCard label="Valuation" value="$248.5k" icon={DollarSign} badgeColor="blue" subtitle="Inventory Asset Total" />
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl shadow-sm border border-outline/20 overflow-hidden mb-8">
        <div className="p-6 border-b border-outline flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button className="px-4 py-1.5 bg-primary-container text-primary-container-foreground rounded-full text-xs font-bold">All Inventory</button>
            <button className="px-4 py-1.5 bg-error-container/50 text-destructive rounded-full text-xs font-bold border border-destructive/20 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-destructive rounded-full" />
              Low Stock
            </button>
            <button className="px-4 py-1.5 bg-surface-container text-muted-foreground rounded-full text-xs font-bold">Consumables</button>
            <button className="px-4 py-1.5 bg-surface-container text-muted-foreground rounded-full text-xs font-bold">Hardware</button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-sm font-medium text-muted-foreground hover:bg-surface-container-low">
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-sm font-medium text-muted-foreground hover:bg-surface-container-low">
              Export
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-variant/50 text-muted-foreground uppercase text-[10px] font-bold tracking-[0.15em]">
              <th className="px-6 py-4">Item Name & Reference</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Stock Level</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {inventoryItems.map((item) => {
              const pct = Math.round((item.stock / item.max) * 100);
              return (
                <tr
                  key={item.sku}
                  className={`hover:bg-surface-container-low/50 transition-colors ${
                    item.status === "critical" ? "bg-error-container/10" : ""
                  }`}
                >
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-on-surface">{item.name}</p>
                    <code className="text-[10px] font-mono text-muted-foreground uppercase">{item.sku}</code>
                  </td>
                  <td className="px-6 py-5 text-xs text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-32 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${stockBarColor(pct)} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[11px] font-bold ${item.status === "critical" ? "text-destructive" : "text-on-surface"}`}>
                        {item.stock} / {item.max} units
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {item.status === "optimal" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Optimal</span>
                    )}
                    {item.status === "critical" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-destructive text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">Critical Stock</span>
                    )}
                    {item.status === "low-stock" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
                    )}
                    {item.status === "in-progress" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-container text-primary text-[10px] font-bold uppercase tracking-wider">In Transit</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {item.status === "critical" ? (
                      <button className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg hover:scale-[1.05] transition-transform">
                        Restock Now
                      </button>
                    ) : (
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-outline/20 flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold">Showing 1-5 of 1,284 SKU</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs text-muted-foreground">‹</button>
            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg font-bold">1</button>
            <button className="px-3 py-1 text-xs text-on-surface">2</button>
            <button className="px-3 py-1 text-xs text-on-surface">3</button>
            <button className="px-3 py-1 text-xs text-muted-foreground">›</button>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-8 rounded-xl shadow-sm border border-outline/20">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold tracking-tight text-on-surface">Usage Velocity</h4>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em] font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-primary rounded-full" /> This Month</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-surface-container-high rounded-full" /> Prev. Month</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-40 gap-3">
            {usageData.map((h, i) => (
              <div key={i} className="w-full flex gap-1">
                <div className="w-1/2 bg-surface-container-high rounded-t-lg" style={{ height: `${h * 0.6}%` }} />
                <div className="w-1/2 bg-primary rounded-t-lg" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl p-8 text-white">
          <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-4">Automated Ordering</h4>
          <p className="text-sm text-white/80 mb-6">
            AI Assistant has identified 4 critical parts that require replenishment based on current work order volume.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-[0.1em]">Brake Fluid DOT 4</span>
              <span className="text-xs font-bold">12 Units</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-[0.1em]">Radiator Coolant</span>
              <span className="text-xs font-bold">5 Units</span>
            </div>
          </div>
          <button className="w-full bg-card text-on-surface font-bold py-3 rounded-lg text-sm hover:scale-[1.02] active:scale-95 transition-transform">
            Approve Order $420.50
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
