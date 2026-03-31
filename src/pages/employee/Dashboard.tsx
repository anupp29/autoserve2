import { Link } from "react-router-dom";
import { Plus, CheckCircle, Clock, Pause, ArrowRight, Wrench, AlertTriangle, MoreHorizontal } from "lucide-react";

const EmployeeDashboard = () => (
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-on-surface tracking-tight">Today's Assignments</h2>
        <p className="text-muted-foreground text-sm">Workload summary for Wednesday, Oct 24</p>
      </div>
      <Link to="/employee/queue" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 self-start">
        <Plus className="w-4 h-4" /> New Service Order
      </Link>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Assigned", value: "08" },
        { label: "Pending", value: "05", dotColor: "bg-amber-400" },
        { label: "In Progress", value: "01", dotColor: "bg-primary" },
        { label: "Completed", value: "02", dotColor: "bg-emerald-500" },
      ].map(k => (
        <div key={k.label} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{k.label}</span>
            {k.dotColor && <div className={`h-2 w-2 rounded-full ${k.dotColor}`} />}
          </div>
          <span className="text-3xl font-black text-on-surface tracking-tight">{k.value}</span>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Active Job */}
        <div className="bg-card rounded-xl border-2 border-primary/20 shadow-sm overflow-hidden">
          <div className="bg-primary/5 px-6 py-3 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Active Job</span>
              <span className="text-xs font-mono text-muted-foreground">ID: #AS-94021</span>
            </div>
            <span className="text-xs text-muted-foreground">Started 09:15 AM</span>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-on-surface mb-1">Full Engine Diagnostic</h3>
                <p className="text-sm text-muted-foreground">Tesla Model S • Performance Dual Motor • Red Multi-Coat</p>
              </div>
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&h=200&fit=crop"
                  alt="Tesla Model S"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">VIN Number</p>
                <p className="text-sm font-mono font-bold text-on-surface">5YJSA1E2XLF49XXXX</p>
              </div>
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Mileage</p>
                <p className="text-sm font-mono font-bold text-on-surface">32,410 mi</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-on-surface">Technician Notes</h4>
                </div>
                <button className="text-xs text-primary font-semibold">Edit Notes</button>
              </div>
              <div className="bg-surface-container-low border border-border/20 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
                Customer reports intermittent power loss during high-torque acceleration. Thermal management system logs show minor temperature spike on rear motor assembly. Performing cooling loop pressure test and checking inverter firmware version...
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Update Status
              </button>
              <button className="px-6 py-3 border border-border/30 rounded-lg font-bold text-on-surface flex items-center justify-center gap-2">
                <Pause className="w-4 h-4" /> Hold
              </button>
            </div>
          </div>
        </div>

        {/* Task Checklist */}
        <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <h3 className="font-bold text-on-surface mb-4">Task Checklist</h3>
          <div className="space-y-3">
            {[
              { task: "Connect OBD-II and run system scan", done: true, time: "09:20 AM" },
              { task: "Verify cooling system fluid levels", done: true, time: "09:45 AM" },
              { task: "Stress test rear motor inverter", done: false, inProgress: true },
              { task: "Final calibration and test drive", done: false },
            ].map((t, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${t.done ? "bg-emerald-50/50" : "bg-surface-container-low"} border border-border/10`}>
                <div className="flex items-center gap-3">
                  {t.done ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <div className="w-5 h-5 rounded-full border-2 border-border/40" />}
                  <span className={`text-sm ${t.done ? "text-muted-foreground line-through" : "text-on-surface font-medium"}`}>{t.task}</span>
                </div>
                {t.time && <span className="text-[10px] text-muted-foreground font-mono">{t.time}</span>}
                {t.inProgress && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">In Progress</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Queue & Performance */}
      <div className="space-y-6">
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Queue (Priority Sorted)</h4>
            <span className="text-xs font-bold text-on-surface bg-surface-container px-2 py-1 rounded">5 Upcoming</span>
          </div>
          <div className="space-y-4">
            {[
              { priority: "High Priority", color: "text-destructive", service: "Brake Pad Replacement", vehicle: "2021 BMW M3 • Blue Metallic", tag: "Parts Ready", tagIcon: Wrench },
              { priority: "Standard", color: "text-muted-foreground", service: "Full Synthetic Oil Change", vehicle: "2023 Ford F-150 Lightning", tag: "Waiting Room", tagIcon: Clock },
              { priority: "Standard", color: "text-muted-foreground", service: "Tire Rotation & Alignment", vehicle: "2020 Honda Civic Type-R", tag: "Pending Alignment Rack", tagIcon: AlertTriangle, tagColor: "text-amber-600" },
            ].map((q, i) => (
              <Link to="/employee/queue" key={i} className="block p-3 rounded-lg border border-border/10 hover:bg-surface-container-low transition-colors group">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${q.color} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${q.color === "text-destructive" ? "bg-destructive" : "bg-muted-foreground"}`} />
                    {q.priority}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">EST: {i === 0 ? "45m" : i === 1 ? "30m" : "1h 20m"}</span>
                </div>
                <h5 className="text-sm font-bold text-on-surface">{q.service}</h5>
                <p className="text-xs text-muted-foreground">{q.vehicle}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${q.tagColor || "text-muted-foreground"}`}>
                    <q.tagIcon className="w-3 h-3" /> {q.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          <Link to="/employee/queue" className="block text-center mt-4 text-[10px] uppercase tracking-wider font-bold text-on-surface hover:text-primary transition-colors">
            View Full Queue
          </Link>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Shift Performance</h4>
            <MoreHorizontal className="w-4 h-4 text-slate-500" />
          </div>
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

export default EmployeeDashboard;
