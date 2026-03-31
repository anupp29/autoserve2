import { Link } from "react-router-dom";
import { CheckCircle, Printer, Download, Plus, MoreVertical, Cpu, Thermometer, MessageSquare } from "lucide-react";

const EmployeeJobDetail = () => (
  <div className="space-y-8">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      <Link to="/employee/queue" className="hover:text-primary">Service Queue</Link>
      <span>›</span>
      <span className="text-primary font-semibold">Job #7742-XP</span>
    </div>
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">2023 Tesla Model S Plaid</h1>
        <div className="flex flex-wrap gap-6 text-sm mt-2">
          <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">VIN</span><span className="font-mono font-bold">5YJSA1E4XPFXXXXXX</span></div>
          <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Motor Type</span><span className="font-bold">Tri-Motor AWD Carbon-Sleeved</span></div>
          <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Odometer</span><span className="font-mono font-bold">12,482 MI</span></div>
        </div>
      </div>
      <div className="flex gap-2 self-start">
        <button className="flex items-center gap-2 px-4 py-2 border border-border/30 rounded-lg text-sm font-medium text-on-surface">
          <Printer className="w-4 h-4" /> Print Report
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-on-surface text-card rounded-lg text-sm font-bold">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* AI Insight */}
        <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg"><Cpu className="w-4 h-4 text-primary" /></div>
              <h3 className="font-bold text-on-surface">Vehicle Insight Summary</h3>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-wider">AI Generated</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Analysis of real-time telemetry and historical service logs suggests a potential deviation in thermal management efficiency.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border-l-2 border-tertiary pl-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-1">Battery Thermal Updates</h4>
              <p className="text-xs text-muted-foreground">Thermal loop throughput decreased by 4% over last 300 cycles. Suggests minor particle accumulation in coolant manifold. Recommend flush during brake service.</p>
            </div>
            <div className="border-l-2 border-tertiary pl-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-1">Tire Pressure Patterns</h4>
              <p className="text-xs text-muted-foreground">Left-rear PSI consistently 2.1 units below average. Telemetry indicates slow-leak profile correlated with high-speed cornering events. Inspect for micro-puncture.</p>
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
              { name: "Diagnostic Scan", status: "Complete", color: "text-emerald-600", bg: "bg-emerald-50", done: true },
              { name: "Brake Pad Replacement", status: "In Progress", color: "text-amber-600", bg: "bg-amber-50" },
              { name: "Coolant Loop Test", status: "Scheduled", color: "text-muted-foreground", bg: "bg-surface-container" },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-border/10">
                {s.done ? (
                  <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded border-2 border-border/40" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">{s.name}</p>
                  <p className={`text-[10px] font-bold uppercase ${s.color} ${s.bg} w-fit px-1.5 py-0.5 rounded mt-0.5`}>{s.status}</p>
                </div>
                {!s.done && <MoreVertical className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border/40 rounded-lg text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Service Item
            </button>
          </div>
        </div>

        {/* Battery & Drivetrain */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white p-4 rounded-xl">
            <h5 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Battery Health</h5>
            <p className="text-2xl font-black">98.2 <span className="text-xs font-normal text-slate-400">%</span></p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full"><div className="h-full w-[98%] bg-primary rounded-full" /></div>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border/20">
            <h5 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Drivetrain Temp</h5>
            <p className="text-2xl font-black text-on-surface">42 <span className="text-xs font-normal text-muted-foreground">°C</span></p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Optimal</p>
          </div>
        </div>

        {/* Chassis Mapping */}
        <div className="rounded-xl overflow-hidden border border-border/20">
          <div className="relative h-44 bg-gradient-to-br from-slate-200 to-slate-100 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop"
              alt="Vehicle chassis view"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-900/90 to-transparent">
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary">Chassis Mapping</p>
              <p className="text-sm font-bold text-white">High Fidelity Sensor Feed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default EmployeeJobDetail;
