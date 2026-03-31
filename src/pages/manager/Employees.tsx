import { Plus, MoreVertical } from "lucide-react";

const employees = [
  { name: "Alex Rivera", email: "alex.r@autoserve.com", role: "Senior Tech", roleColor: "text-primary bg-primary/10", id: "AS-2021-042", date: "Oct 12, 2021", active: true, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Sarah Jenkins", email: "s.jenkins@autoserve.com", role: "Admin", roleColor: "text-on-surface bg-surface-container", id: "AS-2022-015", date: "Feb 04, 2022", active: true, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
  { name: "Jordan Smith", email: "jordan.s@autoserve.com", role: "Technician", roleColor: "text-primary bg-primary/10", id: "AS-2023-112", date: "Nov 22, 2023", active: true, img: "" },
  { name: "Liam Foster", email: "l.foster@autoserve.com", role: "Technician", roleColor: "text-primary bg-primary/10", id: "AS-2020-008", date: "Jan 15, 2020", active: false, img: "" },
];

const ManagerEmployees = () => (
  <div className="space-y-8">
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <span>Organization</span><span>›</span><span className="text-primary font-semibold">Directory</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Employee Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage technical staff, administrative roles, and system permissions.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 self-start">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Staff", value: "42" },
        { label: "Technicians", value: "28" },
        { label: "Active Now", value: "36", dot: true },
        { label: "Open Shifts", value: "04" },
      ].map(k => (
        <div key={k.label} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{k.label}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl lg:text-3xl font-black text-on-surface">{k.value}</p>
            {k.dot && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
          </div>
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="bg-card rounded-xl border border-border/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
              <th className="text-left py-3 px-6 font-bold">Name & Contact</th>
              <th className="text-left py-3 px-4 font-bold">Role</th>
              <th className="text-left py-3 px-4 font-bold">Employee ID</th>
              <th className="text-left py-3 px-4 font-bold">Join Date</th>
              <th className="text-center py-3 px-4 font-bold">Status</th>
              <th className="text-center py-3 px-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {employees.map(e => (
              <tr key={e.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {e.img ? (
                      <img src={e.img} alt={e.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {e.name.split(" ").map(n => n[0]).join("")}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{e.name}</p>
                      <p className="text-xs text-primary">{e.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4"><span className={`text-xs font-bold px-2 py-1 rounded ${e.roleColor}`}>{e.role}</span></td>
                <td className="py-4 px-4 text-sm font-mono text-muted-foreground">{e.id}</td>
                <td className="py-4 px-4 text-sm text-on-surface">{e.date}</td>
                <td className="py-4 px-4 text-center">
                  <div className={`w-10 h-5 rounded-full flex items-center p-0.5 mx-auto cursor-pointer ${e.active ? "bg-primary justify-end" : "bg-surface-container-high justify-start"}`}>
                    <div className="w-4 h-4 bg-card rounded-full shadow-sm" />
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <button className="p-1 hover:bg-surface-container rounded"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-4 lg:p-6 border-t border-border/20">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Showing 1 to 4 of 42 Employees</p>
        <div className="flex gap-1">
          <button className="px-3 py-1 text-xs text-muted-foreground rounded">Prev</button>
          <button className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded">1</button>
          <button className="px-3 py-1 text-xs text-muted-foreground rounded">2</button>
          <button className="px-3 py-1 text-xs text-muted-foreground rounded">3</button>
          <button className="px-3 py-1 text-xs text-muted-foreground rounded">Next</button>
        </div>
      </div>
    </div>

    {/* Bottom */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-2">Performance Insights</h3>
        <p className="text-sm text-slate-400 mb-4">AI detected a 12% increase in service speed since the onboarding of 3 new Senior Techs last month.</p>
        <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors uppercase tracking-wider">View Full Report</button>
      </div>
      <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-4">Role Distribution</h4>
        {[
          { role: "Technicians", pct: 66 },
          { role: "Senior Techs", pct: 24 },
          { role: "Admin", pct: 10 },
        ].map(r => (
          <div key={r.role} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-on-surface font-medium">{r.role}</span>
              <span className="font-bold text-on-surface">{r.pct}%</span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ManagerEmployees;
