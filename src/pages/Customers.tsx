import KpiCard from "@/components/ui/KpiCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Users, Star, Zap, DollarSign, ArrowRight, Download, Plus } from "lucide-react";
import { useState } from "react";

const tabs = ["All", "Premium", "Inactive"];

const customers = [
  { name: "Johnathan Doe", email: "j.doe@example.com", initials: "JD", vehicle: "Tesla Model 3 (2023)", plate: "EV-782-XQ", joinDate: "Oct 12, 2022", status: "premium" as const },
  { name: "Sarah Koven", email: "skoven@webmail.com", initials: "SK", vehicle: "Rivian R1S (2024)", plate: "CAL-A901", joinDate: "Jan 04, 2023", status: "active" as const },
  { name: "Marcus Rodriguez", email: "m.rodriguez@domain.org", initials: "MR", vehicle: "Ford F-150 Lightning", plate: "TX-492L", joinDate: "Mar 22, 2023", status: "premium" as const },
  { name: "Elena Langston", email: "elena.l@cloud.com", initials: "EL", vehicle: "Porsche Taycan 4S", plate: "NY-GR88", joinDate: "May 15, 2023", status: "flagged" as const },
];

const initialsColors = ["bg-primary-container text-primary", "bg-tertiary-container text-tertiary", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];

const Customers = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Customer Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor customer service history and vehicle details.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-outline rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            New Customer
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard label="Total Customers" value="2,842" icon={Users} badge="+12.5% vs last month" badgeColor="green" />
        <KpiCard label="Premium Members" value="412" icon={Star} badge="High Loyalty Tier" badgeColor="blue" />
        <KpiCard label="Active Services" value="18" icon={Zap} badge="Live Operations" badgeColor="green" />
        <KpiCard label="Avg. LTV" value="$1,450" icon={DollarSign} badgeColor="blue" subtitle="Per verified account" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-outline/20 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-outline/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface">Verified Accounts</span>
            <div className="flex gap-1 p-1 bg-surface-container rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    activeTab === tab
                      ? "bg-on-surface text-white"
                      : "text-muted-foreground hover:bg-surface-container-high"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Customer Name</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Primary Vehicle</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">License Plate</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Join Date</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/20">
            {customers.map((c, i) => (
              <tr key={c.email} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${initialsColors[i % initialsColors.length]} flex items-center justify-center text-xs font-bold`}>
                      {c.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{c.name}</p>
                      <p className="text-[10px] text-primary">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface">{c.vehicle}</td>
                <td className="px-6 py-4">
                  <code className="text-xs font-mono bg-surface-container px-2 py-1 rounded border border-outline/30">{c.plate}</code>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{c.joinDate}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-outline/20 flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold">Showing 1 to 4 of 2,842 customers</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs text-muted-foreground">‹</button>
            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg font-bold">1</button>
            <button className="px-3 py-1 text-xs text-on-surface">2</button>
            <button className="px-3 py-1 text-xs text-muted-foreground">›</button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl p-8 text-white">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-4 flex items-center gap-2">
            <Zap className="w-3 h-3" />
            AI Performance Insight
          </p>
          <h3 className="text-xl font-bold mb-2">Service demand is expected to peak in 48h.</h3>
          <p className="text-sm text-white/70 mb-6">
            Predictive modeling suggests a 22% increase in electric drivetrain diagnostics based on recent customer vehicle updates.
          </p>
          <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/20 transition-colors">
            View Full Analytics
          </button>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-outline/20">
          <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground mb-4">Recent Activity</h4>
          <div className="space-y-4">
            {[
              { label: "New Account Created", name: "Sarah Koven", time: "2h ago", color: "bg-primary" },
              { label: "Service Completed", name: "Marcus Rodriguez", time: "4h ago", color: "bg-emerald-500" },
              { label: "Profile Updated", name: "Johnathan Doe", time: "1d ago", color: "bg-muted-foreground" },
            ].map((a) => (
              <div key={a.label} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${a.color} mt-1.5`} />
                <div>
                  <p className="text-sm font-semibold text-on-surface">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.name} • {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
