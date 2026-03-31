import { useState } from "react";
import { Plus, MoreHorizontal, Settings, Wrench, Zap, Snowflake, CircleDot, Disc } from "lucide-react";

const categories = ["All Services", "Engine", "Brakes", "Electrical", "Transmission", "Tires & Suspension", "HVAC"] as const;

const services = [
  { name: "Synthetic Oil Change", sku: "OIL-SYN-01", price: "$89.99", duration: "0.75", category: "Engine", active: true, icon: Settings, iconBg: "bg-primary/10", iconColor: "text-primary" },
  { name: "Brake Pad Replacement", sku: "BRK-PAD-04", price: "$159.50", duration: "1.50", category: "Brakes", active: true, icon: Wrench, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
  { name: "EV Battery Diagnostics", sku: "ELE-EV-99", price: "$210.00", duration: "2.00", category: "Electrical", active: false, icon: Zap, iconBg: "bg-surface-container", iconColor: "text-muted-foreground" },
  { name: "A/C Recharge & Leak Test", sku: "HVAC-REC-02", price: "$129.00", duration: "1.25", category: "HVAC", active: true, icon: Snowflake, iconBg: "bg-primary/10", iconColor: "text-primary" },
  { name: "Tire Rotation & Balance", sku: "TIR-ROT-05", price: "$45.00", duration: "0.50", category: "Tires & Suspension", active: true, icon: Disc, iconBg: "bg-primary/10", iconColor: "text-primary" },
];

const ManagerServices = () => {
  const [active, setActive] = useState<typeof categories[number]>("All Services");
  const filtered = active === "All Services" ? services : services.filter(s => s.category === active);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Service Catalogue</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage automotive service operations, pricing, and labor times.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all self-start">
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              active === c
                ? "bg-on-surface text-card"
                : "bg-surface-container text-muted-foreground hover:bg-surface-container-high"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filtered.map(s => (
          <div key={s.sku} className={`bg-card p-5 lg:p-6 rounded-xl border border-border/20 shadow-sm ${!s.active ? "opacity-60" : ""}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${s.active ? "bg-primary justify-end" : "bg-surface-container-high justify-start"}`}>
                <div className="w-4 h-4 bg-card rounded-full shadow-sm" />
              </div>
            </div>
            <h3 className="font-bold text-on-surface mb-1">{s.name}</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">SKU: {s.sku}</p>
            <div className="flex gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Standard Price</p>
                <p className="text-lg font-black text-on-surface">{s.price}</p>
              </div>
              <div className="border-l border-border/30 pl-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Duration (Hrs)</p>
                <div className="flex items-center gap-1">
                  <CircleDot className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-lg font-black text-on-surface">{s.duration}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                s.active ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
              }`}>
                {s.active ? s.category : "Deactivated"}
              </span>
              <button className="p-1 hover:bg-surface-container rounded"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </div>
        ))}

        {/* Add New */}
        <div className="border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-pointer min-h-[200px]">
          <Plus className="w-8 h-8 mb-2" />
          <span className="text-[10px] uppercase tracking-wider font-bold">Create Custom Service</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary p-4 rounded-xl text-primary-foreground">
          <p className="text-[10px] uppercase tracking-wider font-bold text-primary-foreground/70">Active Services</p>
          <p className="text-2xl font-black mt-1">42</p>
          <p className="text-[10px] text-primary-foreground/60 mt-1">↗ +3 this month</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/20">
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Average Labor Time</p>
          <p className="text-2xl font-black text-on-surface mt-1">1.2h</p>
          <p className="text-[10px] text-muted-foreground mt-1">Optimized for throughput</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/20">
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Top Category</p>
          <p className="text-lg font-black text-on-surface mt-1">Engine Maintenance</p>
          <p className="text-[10px] text-muted-foreground mt-1">35% of total revenue</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/20">
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Pending Updates</p>
          <p className="text-2xl font-black text-on-surface mt-1">0</p>
          <p className="text-[10px] text-muted-foreground mt-1">Catalog is up to date</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerServices;
