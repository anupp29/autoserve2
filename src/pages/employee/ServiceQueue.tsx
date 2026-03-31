import { Link } from "react-router-dom";
import { Clock, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

const jobs = [
  { id: "AS-94021", vehicle: "Tesla Model S", service: "Full Engine Diagnostic", priority: "High", status: "In Progress", statusColor: "text-primary bg-primary/10", time: "09:15 AM", customer: "Marcus Thorne" },
  { id: "AS-94022", vehicle: "BMW X5 2021", service: "Brake Pad Replacement", priority: "Medium", status: "Queued", statusColor: "text-amber-600 bg-amber-50", time: "11:00 AM", customer: "Sarah Chen" },
  { id: "AS-94023", vehicle: "Audi Q7 2019", service: "HVAC Recharge", priority: "Low", status: "Queued", statusColor: "text-muted-foreground bg-surface-container", time: "01:30 PM", customer: "Robert Miller" },
  { id: "AS-94024", vehicle: "Ford F-150 Lightning", service: "Software Update", priority: "Medium", status: "Queued", statusColor: "text-amber-600 bg-amber-50", time: "03:00 PM", customer: "Liam Foster" },
  { id: "AS-94019", vehicle: "Porsche Taycan 4S", service: "Tire Rotation & Balance", priority: "Low", status: "Completed", statusColor: "text-emerald-600 bg-emerald-50", time: "08:00 AM", customer: "Elena Langston" },
];

const EmployeeServiceQueue = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-on-surface tracking-tight">Service Queue</h1>
      <p className="text-sm text-muted-foreground mt-1">Your assigned work orders for today, prioritized by urgency.</p>
    </div>

    {/* Queue Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "In Queue", value: "04", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
        { label: "In Progress", value: "01", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Completed Today", value: "01", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Avg. Turnaround", value: "2.4h", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
      ].map(k => (
        <div key={k.label} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-lg ${k.bg}`}><k.icon className={`w-5 h-5 ${k.color}`} /></div>
          </div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{k.label}</p>
          <p className="text-2xl lg:text-3xl font-black text-on-surface mt-1">{k.value}</p>
        </div>
      ))}
    </div>

    {/* Queue Table */}
    <div className="bg-card rounded-xl border border-border/20 shadow-sm">
      <div className="p-4 lg:p-6 border-b border-border/20">
        <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Today's Work Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
              <th className="text-left py-3 px-6 font-bold">Job ID</th>
              <th className="text-left py-3 px-4 font-bold">Vehicle / Customer</th>
              <th className="text-left py-3 px-4 font-bold">Service Type</th>
              <th className="text-left py-3 px-4 font-bold">Priority</th>
              <th className="text-left py-3 px-4 font-bold">Scheduled</th>
              <th className="text-left py-3 px-4 font-bold">Status</th>
              <th className="text-center py-3 px-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {jobs.map(j => (
              <tr key={j.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6 text-sm font-mono font-bold text-on-surface">#{j.id}</td>
                <td className="py-4 px-4">
                  <p className="text-sm font-semibold text-on-surface">{j.vehicle}</p>
                  <p className="text-xs text-muted-foreground">{j.customer}</p>
                </td>
                <td className="py-4 px-4 text-sm text-on-surface">{j.service}</td>
                <td className="py-4 px-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    j.priority === "High" ? "text-destructive bg-destructive/10" : j.priority === "Medium" ? "text-amber-600 bg-amber-50" : "text-muted-foreground bg-surface-container"
                  }`}>{j.priority}</span>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{j.time}</td>
                <td className="py-4 px-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${j.statusColor}`}>
                    {j.status === "In Progress" && "● "}{j.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <Link to={`/employee/job/${j.id}`} className="p-1.5 text-primary hover:bg-primary/10 rounded inline-flex">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default EmployeeServiceQueue;
