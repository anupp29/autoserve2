const CustomerVehicles = () => (
  <div className="space-y-8">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><span>Customer</span><span>›</span><span className="text-primary font-semibold">Garage</span></div>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-on-surface tracking-tight">My Vehicles</h1><p className="text-sm text-muted-foreground mt-1">Manage your active fleet and real-time health monitoring.</p></div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
        {[
          { name: "Porsche 911 Carrera", year: "2023", plate: "B-911-LUX", badge: "Active", badgeColor: "bg-emerald-50 text-emerald-600" },
          { name: "BMW M4 Competition", year: "2021", plate: "M-PWR-44", badge: "Service Due", badgeColor: "bg-amber-50 text-amber-600" },
        ].map(v => (
          <div key={v.plate} className="bg-card rounded-xl border border-border/20 shadow-sm overflow-hidden">
            <div className="relative h-40 bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center">
              <span className="text-4xl">🚗</span>
              <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded ${v.badgeColor}`}>{v.badge}</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-on-surface">{v.name}</h3>
                <span className="text-lg font-light text-muted-foreground">{v.year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">🔑 {v.plate}</span>
                <button className="text-xs font-bold text-primary hover:underline">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3"><span className="text-primary">✨</span><h4 className="font-bold">AI Maintenance Tips</h4></div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">Updated 5m ago</p>
          <div className="space-y-3">
            {[
              { title: "Brake Wear Detected (BMW M4)", desc: "Front-left pad sensor reports 2mm remaining.", level: "Critical", color: "border-destructive/30 bg-destructive/5" },
              { title: "Tire Pressure Drop (Porsche)", desc: "Ambient temperature drop has reduced PSI in rear tires.", level: "Warning", color: "border-amber-500/30 bg-amber-500/5" },
              { title: "Engine Efficiency (Porsche)", desc: "Operating at 99% efficiency. No action needed for next 5,000 miles.", level: "OK", color: "border-emerald-500/30 bg-emerald-500/5" },
            ].map(t => (
              <div key={t.title} className={`border rounded-lg p-3 ${t.color}`}>
                <h5 className="text-sm font-bold text-white">{t.title}</h5>
                <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
                {t.level === "Critical" && <button className="mt-2 w-full py-1.5 bg-destructive text-white rounded text-xs font-bold">Schedule Now</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Garage Overview</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Fleet Value</span><span className="font-bold text-on-surface font-mono">$245,000</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Annual Maint. Cost</span><span className="font-bold text-on-surface font-mono">$3,200</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-muted-foreground">Health Index</span><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-surface-container-high rounded-full"><div className="h-full w-[92%] bg-primary rounded-full" /></div><span className="text-xs font-bold text-primary">92%</span></div></div>
          </div>
        </div>
      </div>
    </div>

    {/* Service History */}
    <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
      <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-on-surface">Recent Service History</h3><button className="text-xs text-primary font-semibold">See All</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[500px]"><thead><tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20"><th className="text-left py-2 font-bold">Date</th><th className="text-left py-2 font-bold">Vehicle</th><th className="text-left py-2 font-bold">Service Type</th><th className="text-right py-2 font-bold">Cost</th><th className="text-right py-2 font-bold">Status</th></tr></thead>
      <tbody className="divide-y divide-border/10">
        <tr><td className="py-3 text-sm">Oct 12, 2023</td><td className="py-3 text-sm">Porsche 911</td><td className="py-3 text-sm text-primary">Synthetic Oil Change</td><td className="py-3 text-sm font-mono font-bold text-right">$420.00</td><td className="py-3 text-right"><span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completed</span></td></tr>
        <tr><td className="py-3 text-sm">Sep 05, 2023</td><td className="py-3 text-sm">BMW M4</td><td className="py-3 text-sm text-primary">Brake Pad Replacement</td><td className="py-3 text-sm font-mono font-bold text-right">$1,150.00</td><td className="py-3 text-right"><span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completed</span></td></tr>
      </tbody></table></div>
    </div>
  </div>
);

export default CustomerVehicles;
