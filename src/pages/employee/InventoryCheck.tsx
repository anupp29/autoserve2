import { Package, AlertTriangle } from "lucide-react";

const parts = [
  { name: "Brake Pads - Ceramic XL", sku: "SKU-BRK-44901", stock: 142, max: 160, status: "Optimal", statusColor: "text-emerald-600 bg-emerald-50" },
  { name: "Synthetic Engine Oil 5W-30", sku: "SKU-OIL-11202", stock: 8, max: 65, status: "Critical", statusColor: "text-destructive bg-destructive/10" },
  { name: "High Performance Spark Plug", sku: "SKU-ELC-77123", stock: 14, max: 50, status: "Low Stock", statusColor: "text-amber-600 bg-amber-50" },
  { name: "Standard Oil Filter (Case)", sku: "SKU-FLT-33410", stock: 4, max: 12, status: "In Transit", statusColor: "text-primary bg-primary/10" },
  { name: "Michelin Pilot Sport 4S", sku: "SKU-TIR-99044", stock: 12, max: 20, status: "Healthy", statusColor: "text-primary bg-primary/10" },
  { name: "Radiator Coolant G12", sku: "SKU-COL-55012", stock: 22, max: 30, status: "Optimal", statusColor: "text-emerald-600 bg-emerald-50" },
];

const EmployeeInventoryCheck = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-on-surface tracking-tight">Parts & Inventory</h1>
      <p className="text-sm text-muted-foreground mt-1">Quick reference for available parts. Contact Manager for restocking.</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
        <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3"><Package className="w-5 h-5 text-primary" /></div>
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Available SKUs</p>
        <p className="text-2xl lg:text-3xl font-black text-on-surface mt-1">1,284</p>
      </div>
      <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
        <div className="p-2 bg-destructive/10 rounded-lg w-fit mb-3"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Low Stock Alerts</p>
        <p className="text-2xl lg:text-3xl font-black text-destructive mt-1">28</p>
      </div>
      <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
        <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3"><Package className="w-5 h-5 text-primary" /></div>
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">In Transit</p>
        <p className="text-2xl lg:text-3xl font-black text-on-surface mt-1">15</p>
      </div>
    </div>

    <div className="bg-card rounded-xl border border-border/20 shadow-sm">
      <div className="p-4 lg:p-6 border-b border-border/20">
        <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Frequently Used Parts</h3>
      </div>
      <div className="divide-y divide-border/10">
        {parts.map(p => (
          <div key={p.sku} className="flex items-center justify-between p-4 lg:px-6 hover:bg-surface-container-low/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{p.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.stock / p.max > 0.5 ? "bg-primary" : p.stock / p.max > 0.2 ? "bg-amber-500" : "bg-destructive"}`}
                    style={{ width: `${(p.stock / p.max) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{p.stock}/{p.max}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${p.statusColor} whitespace-nowrap`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default EmployeeInventoryCheck;
