import { Plus, CheckCircle, Clock, Pause } from "lucide-react";

const EmployeeDashboard = () => (
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-on-surface tracking-tight">Today's Assignments</h2>
        <p className="text-muted-foreground text-sm">Workload summary for Wednesday, Oct 24</p>
      </div>
      <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 self-start">
        <Plus className="w-4 h-4" /> New Service Order
      </button>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Assigned", value: "08" },
        { label: "Pending", value: "05", dot: "bg-amber-400" },
        { label: "In Progress", value: "01", dot: "bg-primary" },
        { label: "Completed", value: "02", dot: "bg-emerald-500" },
      ].map(k => (
        <div key={k.label} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-black">{k.label}</span>
            {k.dot && <div className={`h-2 w-2 rounded-full ${k.dot}`} />}
          </div>
          <span className="text-3xl font-black text-on-surface tracking-tight">{k.value}</span>
        </div>
      ))}
    </div>

    {/* Active Job */}
    <div className="bg-card rounded-xl border-2 border-primary/20 shadow-sm overflow-hidden">
      <div className="bg-primary/5 px-6 py-3 flex items-center justify-between border-b border-primary/10">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded uppercase">Active Job</span>
          <span className="text-xs font-mono text-muted-foreground">ID: #AS-94021</span>
        </div>
        <span className="text-xs text-muted-foreground">Started 09:15 AM</span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-on-surface mb-1">Full Engine Diagnostic</h3>
        <p className="text-sm text-muted-foreground mb-4">Tesla Model S • Performance Dual Motor • Red Multi-Coat</p>
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
          <h4 className="text-sm font-bold text-on-surface mb-2">📋 Technician Notes</h4>
          <div className="bg-surface-container-low border border-border/20 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
            Customer reports intermittent power loss during high-torque acceleration. Thermal management system logs show minor temperature spike on rear motor assembly.
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
);

export default EmployeeDashboard;
