import { Calendar, Download, TrendingUp } from "lucide-react";

const transactions = [
  { id: "#TRX-89021", date: "Jul 12, 2024", customer: "Julianna Dawson", initials: "JD", vehicle: "Audi A4 (2021)", vin: "WAUZZZ8K0FA123...", type: "Major Service", amount: "$1,240.50", status: "In Progress", statusColor: "text-primary bg-primary/10" },
  { id: "#TRX-88945", date: "Jul 12, 2024", customer: "Marcus Knight", initials: "MK", vehicle: "Ford F-150", vin: "1FTFW1R99LFB3...", type: "Brake Systems", amount: "$845.00", status: "Settled", statusColor: "text-emerald-600 bg-emerald-50" },
  { id: "#TRX-88912", date: "Jul 11, 2024", customer: "Sarah Miller", initials: "SM", vehicle: "Tesla Model 3", vin: "5YJ3E1EB3KF456...", type: "Battery Diag", amount: "$320.00", status: "Action Required", statusColor: "text-destructive bg-destructive/10" },
  { id: "#TRX-88890", date: "Jul 11, 2024", customer: "Robert Black", initials: "RB", vehicle: "BMW X5", vin: "5UXWX9C57BL987...", type: "Oil & Filter", amount: "$185.00", status: "Settled", statusColor: "text-emerald-600 bg-emerald-50" },
];

const ManagerReports = () => (
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Performance Audit</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive financial health and service distribution overview.</p>
      </div>
      <div className="flex gap-2 self-start">
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border/30 rounded-lg text-sm font-medium text-on-surface">
          <Calendar className="w-4 h-4" /> This Month
        </button>
        <button className="flex items-center gap-2 bg-on-surface text-card px-5 py-2.5 rounded-lg text-sm font-bold">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      <div className="bg-card p-5 lg:p-6 rounded-xl border border-border/20 shadow-sm">
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Total Revenue</p>
        <p className="text-3xl font-black text-on-surface tracking-tight mt-2 font-mono">$142,580.00</p>
        <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12.4% vs last month</p>
      </div>
      <div className="bg-card p-5 lg:p-6 rounded-xl border border-border/20 shadow-sm">
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Avg. Ticket Value</p>
        <p className="text-3xl font-black text-on-surface tracking-tight mt-2 font-mono">$482.15</p>
        <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +4.2% per service</p>
      </div>
      <div className="bg-card p-5 lg:p-6 rounded-xl border border-border/20 shadow-sm">
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Net Margin</p>
        <p className="text-3xl font-black text-on-surface tracking-tight mt-2 font-mono">24.8%</p>
        <p className="text-[10px] text-muted-foreground mt-2">— Stable on operations</p>
      </div>
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border/20 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Revenue Growth Over Time</h3>
          <div className="flex gap-1 bg-surface-container rounded-lg p-0.5">
            <button className="px-3 py-1 text-xs font-medium bg-card text-on-surface rounded-md shadow-sm">Monthly</button>
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground rounded-md">Weekly</button>
          </div>
        </div>
        <div className="h-48 flex items-end gap-4">
          {[
            { month: "JAN", h: 30 }, { month: "FEB", h: 40 }, { month: "MAR", h: 35 },
            { month: "APR", h: 50 }, { month: "MAY", h: 65 }, { month: "JUN", h: 75 },
            { month: "JUL", h: 85 },
          ].map(bar => (
            <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-primary/20 to-primary/5 rounded-t" style={{ height: `${bar.h}%` }} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
        <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-4">Service Distribution</h3>
        {[
          { name: "Engine Repairs", pct: 42 },
          { name: "Brake Services", pct: 28 },
          { name: "Oil & Filter", pct: 18 },
          { name: "Other", pct: 12 },
        ].map(s => (
          <div key={s.name} className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-on-surface font-medium">{s.name}</span>
              <span className="font-bold text-on-surface">{s.pct}%</span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
        <div className="mt-6 p-3 bg-surface-container rounded-lg">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Top Performer</p>
          <p className="text-sm font-bold text-on-surface mt-1">Engine Systems Diagnostic</p>
        </div>
      </div>
    </div>

    {/* Payments Table */}
    <div className="bg-card rounded-xl border border-border/20 shadow-sm">
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border/20">
        <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Recent Payment Records</h3>
        <button className="text-xs text-primary font-semibold hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
              <th className="text-left py-3 px-6 font-bold">Transaction ID</th>
              <th className="text-left py-3 px-4 font-bold">Date</th>
              <th className="text-left py-3 px-4 font-bold">Customer</th>
              <th className="text-left py-3 px-4 font-bold">Vehicle / VIN</th>
              <th className="text-left py-3 px-4 font-bold">Type</th>
              <th className="text-right py-3 px-4 font-bold">Amount</th>
              <th className="text-right py-3 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6 text-sm font-mono font-semibold text-on-surface">{t.id}</td>
                <td className="py-4 px-4 text-sm text-on-surface">{t.date}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-bold text-muted-foreground">{t.initials}</div>
                    <span className="text-sm text-on-surface">{t.customer}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-on-surface">{t.vehicle}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{t.vin}</p>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{t.type}</td>
                <td className="py-4 px-4 text-sm font-bold text-on-surface text-right font-mono">{t.amount}</td>
                <td className="py-4 px-4 text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.statusColor}`}>{t.status === "In Progress" && "● "}{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-4 lg:p-6 border-t border-border/20">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Showing 4 of 284 Records</p>
        <div className="flex gap-1">
          <button className="px-2 py-1 text-xs text-muted-foreground rounded">‹</button>
          <button className="px-2 py-1 text-xs text-muted-foreground rounded">›</button>
        </div>
      </div>
    </div>
  </div>
);

export default ManagerReports;
