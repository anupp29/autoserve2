import KpiCard from "@/components/ui/KpiCard";
import { Users, UserCheck, Zap, Clock, MoreVertical, Plus } from "lucide-react";

const employees = [
  { name: "Alex Rivera", email: "alex.r@autoserve.com", role: "Senior Tech", roleColor: "bg-primary-container text-primary", id: "AS-2021-042", joinDate: "Oct 12, 2021", active: true },
  { name: "Sarah Jenkins", email: "s.jenkins@autoserve.com", role: "Admin", roleColor: "bg-surface-container text-on-surface", id: "AS-2022-015", joinDate: "Feb 04, 2022", active: true },
  { name: "Jordan Smith", email: "jordan.s@autoserve.com", role: "Technician", roleColor: "bg-primary-container text-primary", id: "AS-2023-112", joinDate: "Nov 22, 2023", active: true },
  { name: "Liam Foster", email: "l.foster@autoserve.com", role: "Technician", roleColor: "bg-primary-container text-primary", id: "AS-2020-008", joinDate: "Jan 15, 2020", active: false },
];

const avatarColors = ["bg-primary/20 text-primary", "bg-tertiary/20 text-tertiary", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];

const Employees = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="flex text-xs font-medium text-muted-foreground uppercase tracking-[0.15em] mb-2">
            <span>Organization</span>
            <span className="mx-2">›</span>
            <span className="text-primary">Directory</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Employee Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage technical staff, administrative roles, and system permissions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard label="Total Staff" value="42" icon={Users} badgeColor="blue" />
        <KpiCard label="Technicians" value="28" icon={UserCheck} badgeColor="blue" />
        <KpiCard label="Active Now" value="36" icon={Zap} badge="● Online" badgeColor="green" />
        <KpiCard label="Open Shifts" value="04" icon={Clock} badgeColor="orange" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-outline/20 overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Name & Contact</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Role</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Employee ID</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Join Date</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/20">
            {employees.map((e, i) => (
              <tr key={e.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-bold`}>
                      {e.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{e.name}</p>
                      <p className="text-[10px] text-primary">{e.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${e.roleColor}`}>{e.role}</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{e.id}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{e.joinDate}</td>
                <td className="px-6 py-4">
                  <div className={`w-10 h-6 rounded-full ${e.active ? "bg-primary" : "bg-surface-container-high"} relative cursor-pointer transition-colors`}>
                    <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-all ${e.active ? "left-[18px]" : "left-0.5"}`} />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-outline/20 flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold">Showing 1 to 4 of 42 employees</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs text-muted-foreground">Prev</button>
            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg font-bold">1</button>
            <button className="px-3 py-1 text-xs text-on-surface">2</button>
            <button className="px-3 py-1 text-xs text-on-surface">3</button>
            <button className="px-3 py-1 text-xs text-muted-foreground">Next</button>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl p-8 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">Performance Insights</h3>
            <p className="text-sm text-white/70 max-w-md">
              AI detected a 12% increase in service speed since the onboarding of 3 new Senior Techs last month.
            </p>
          </div>
          <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/20 transition-colors whitespace-nowrap">
            View Full Report
          </button>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-outline/20">
          <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground mb-4">Role Distribution</h4>
          <div className="space-y-4">
            {[
              { role: "Technicians", pct: 66 },
              { role: "Senior Techs", pct: 24 },
              { role: "Admin", pct: 10 },
            ].map((r) => (
              <div key={r.role}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-on-surface">{r.role}</span>
                  <span className="font-bold text-on-surface">{r.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
