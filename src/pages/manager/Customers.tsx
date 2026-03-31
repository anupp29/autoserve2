import { useState } from "react";
import { Plus, Download, ArrowRight, Filter, Zap } from "lucide-react";

const tabs = ["All", "Premium", "Inactive"] as const;

const customers = [
  { name: "Johnathan Doe", email: "j.doe@example.com", initials: "JD", vehicle: "Tesla Model 3 (2023)", plate: "EV-782-XQ", date: "Oct 12, 2022", status: "Premium", statusColor: "text-emerald-600 bg-emerald-50" },
  { name: "Sarah Koven", email: "skoven@webmail.com", initials: "SK", vehicle: "Rivian R1S (2024)", plate: "CAL-A901", date: "Jan 04, 2023", status: "Active", statusColor: "text-on-surface bg-surface-container" },
  { name: "Marcus Rodriguez", email: "m.rodriguez@domain.org", initials: "MR", vehicle: "Ford F-150 Lightning", plate: "TX-492L", date: "Mar 22, 2023", status: "Premium", statusColor: "text-emerald-600 bg-emerald-50" },
  { name: "Elena Langston", email: "elena.l@cloud.com", initials: "EL", vehicle: "Porsche Taycan 4S", plate: "NY-GR88", date: "May 15, 2023", status: "Flagged", statusColor: "text-destructive bg-destructive/10" },
];

const ManagerCustomers = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Customer Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor customer service history and vehicle details.</p>
        </div>
        <div className="flex gap-2 self-start">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border/30 rounded-lg text-sm font-medium text-on-surface">
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> New Customer
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: "2,842", sub: "↗ +12.5% vs last month", subColor: "text-emerald-600" },
          { label: "Premium Members", value: "412", sub: "★ High Loyalty Tier", subColor: "text-amber-600" },
          { label: "Active Services", value: "18", sub: "● Live Operations", subColor: "text-emerald-600" },
          { label: "Avg. LTV", value: "$1,450", sub: "Per verified account", subColor: "text-muted-foreground" },
        ].map(k => (
          <div key={k.label} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{k.label}</p>
            <p className="text-2xl lg:text-3xl font-black text-on-surface mt-2">{k.value}</p>
            <p className={`text-[10px] ${k.subColor} mt-1`}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 border-b border-border/20 gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Verified Accounts</h3>
            <div className="flex gap-1 bg-surface-container rounded-lg p-0.5">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1 text-xs font-bold rounded-md ${activeTab === t ? "bg-on-surface text-card" : "text-muted-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button className="p-1 hover:bg-surface-container rounded"><Filter className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                <th className="text-left py-3 px-6 font-bold">Customer Name</th>
                <th className="text-left py-3 px-4 font-bold">Primary Vehicle</th>
                <th className="text-left py-3 px-4 font-bold">License Plate</th>
                <th className="text-left py-3 px-4 font-bold">Join Date</th>
                <th className="text-left py-3 px-4 font-bold">Status</th>
                <th className="text-center py-3 px-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {customers.map(c => (
                <tr key={c.email} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{c.initials}</div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{c.name}</p>
                        <p className="text-xs text-primary">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-on-surface">{c.vehicle}</td>
                  <td className="py-4 px-4"><span className="text-xs font-mono bg-surface-container px-2 py-1 rounded">{c.plate}</span></td>
                  <td className="py-4 px-4 text-sm text-on-surface">{c.date}</td>
                  <td className="py-4 px-4"><span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${c.statusColor}`}>{c.status === "Premium" && "● "}{c.status}</span></td>
                  <td className="py-4 px-4 text-center">
                    <button className="p-1 text-primary hover:bg-primary/10 rounded"><ArrowRight className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 lg:p-6 border-t border-border/20">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Showing 1 to 4 of 2,842 Customers</p>
          <div className="flex gap-1">
            <button className="px-2 py-1 text-xs text-muted-foreground rounded">‹</button>
            <button className="px-2 py-1 text-xs text-muted-foreground rounded">›</button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-primary flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> AI Performance Insight</span>
          </div>
          <h3 className="text-lg font-bold mb-2">Service demand is expected to peak in 48h.</h3>
          <p className="text-sm text-slate-400 mb-4">Predictive modeling suggests a 22% increase in electric drivetrain diagnostics based on recent customer vehicle updates.</p>
          <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors">View Full Analytics</button>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Recent Activity</h4>
          </div>
          <div className="space-y-4">
            {[
              { action: "New Account Created", user: "Sarah Koven", time: "2h ago", color: "bg-primary" },
              { action: "Service Completed", user: "Marcus Rodriguez", time: "4h ago", color: "bg-emerald-500" },
              { action: "Profile Updated", user: "Johnathan Doe", time: "1d ago", color: "bg-surface-container-high" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color}`} />
                <div>
                  <p className="text-sm font-semibold text-on-surface">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.user} • {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCustomers;
