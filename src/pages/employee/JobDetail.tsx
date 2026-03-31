const EmployeeJobDetail = () => (
  <div className="space-y-8">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      <span>Service Queue</span><span>›</span><span className="text-primary font-semibold">Job #7742-XP</span>
    </div>
    <h1 className="text-2xl font-bold text-on-surface tracking-tight">2023 Tesla Model S Plaid</h1>
    <div className="flex flex-wrap gap-6 text-sm">
      <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">VIN</span><span className="font-mono font-bold">5YJSA1E4XPFXXXXXX</span></div>
      <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Motor Type</span><span className="font-bold">Tri-Motor AWD Carbon-Sleeved</span></div>
      <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Odometer</span><span className="font-mono font-bold">12,482 MI</span></div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* AI Insight */}
        <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><span className="text-lg">🔮</span><h3 className="font-bold text-on-surface">Vehicle Insight Summary</h3></div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">AI Generated</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Analysis of real-time telemetry and historical service logs suggests a potential deviation in thermal management efficiency.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border-l-2 border-tertiary pl-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-1">Battery Thermal Updates</h4>
              <p className="text-xs text-muted-foreground">Thermal loop throughput decreased by 4% over last 300 cycles. Suggests minor particle accumulation in coolant manifold.</p>
            </div>
            <div className="border-l-2 border-tertiary pl-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-1">Tire Pressure Patterns</h4>
              <p className="text-xs text-muted-foreground">Left-rear PSI consistently 2.1 units below average. Telemetry indicates slow-leak profile correlated with high-speed cornering.</p>
            </div>
          </div>
        </div>

        {/* Service Log */}
        <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <h3 className="font-bold text-on-surface mb-4">Live Service Log</h3>
          <div className="space-y-4 border-l-2 border-border/30 pl-4">
            {[
              { time: "08:45 AM", label: "Initialized", event: "Vehicle intake complete", detail: "Service Advisor: Sarah J." },
              { time: "09:12 AM", label: "Active", event: "Full System Diagnostic Scan", detail: "ECU Handshake confirmed. 124 modules reporting nominal.", active: true },
              { time: "10:30 AM", label: "Queue", event: "Staging for Brake Pad Replacement", detail: "Bay 4 allocation pending technician assignment." },
            ].map((log, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${log.active ? "bg-primary" : "bg-surface-container-high"}`} />
                <p className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${log.active ? "text-primary" : "text-muted-foreground"}`}>{log.time} - {log.label}</p>
                <p className="text-sm font-semibold text-on-surface">{log.event}</p>
                <p className="text-xs text-muted-foreground">{log.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-on-surface">Service Items</h4>
            <span className="text-xs text-muted-foreground">1 / 3 Complete</span>
          </div>
          <div className="space-y-2">
            {[
              { name: "Diagnostic Scan", status: "Complete", color: "text-emerald-600 bg-emerald-50", done: true },
              { name: "Brake Pad Replacement", status: "In Progress", color: "text-amber-600 bg-amber-50" },
              { name: "Coolant Loop Test", status: "Scheduled", color: "text-muted-foreground bg-surface-container" },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-border/10">
                {s.done ? <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs">✓</div> : <div className="w-5 h-5 rounded border-2 border-border/40" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">{s.name}</p>
                  <p className={`text-[10px] font-bold uppercase ${s.color} w-fit px-1.5 py-0.5 rounded mt-0.5`}>{s.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
          <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-3">Shift Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-slate-300">Target Efficiency</span><span className="text-sm font-bold text-emerald-400">92%</span></div>
            <div className="h-1.5 bg-white/10 rounded-full"><div className="h-full w-[92%] bg-emerald-400 rounded-full" /></div>
            <div className="flex justify-between"><span className="text-sm text-slate-300">Jobs Completed</span><span className="text-sm font-bold">2 / 8</span></div>
            <div className="h-1.5 bg-white/10 rounded-full"><div className="h-full w-[25%] bg-primary rounded-full" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <p className="text-lg font-black">5.2h</p><p className="text-[10px] uppercase tracking-wider text-slate-400">Billable</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <p className="text-lg font-black">2h 15m</p><p className="text-[10px] uppercase tracking-wider text-slate-400">Remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default EmployeeJobDetail;
