import KpiCard from "@/components/ui/KpiCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { DollarSign, Receipt, TrendingUp, Calendar, Download } from "lucide-react";

const payments = [
  { id: "#TRX-89021", date: "Jul 12, 2024", customer: "Julianna Dawson", initials: "JD", vehicle: "Audi A4 (2021)", vin: "WAUZZZ8K0FA123...", type: "Major Service", amount: "$1,240.50", status: "in-progress" as const },
  { id: "#TRX-88945", date: "Jul 12, 2024", customer: "Marcus Knight", initials: "MK", vehicle: "Ford F-150", vin: "1FTFW1R69LFB3...", type: "Brake Systems", amount: "$845.00", status: "completed" as const },
  { id: "#TRX-88912", date: "Jul 11, 2024", customer: "Sarah Miller", initials: "SM", vehicle: "Tesla Model 3", vin: "5YJ3E1EB3KF456...", type: "Battery Diag", amount: "$320.00", status: "cancelled" as const },
  { id: "#TRX-88890", date: "Jul 11, 2024", customer: "Robert Black", initials: "RB", vehicle: "BMW X5", vin: "5UXWX9C57BL987...", type: "Oil & Filter", amount: "$185.00", status: "completed" as const },
];

const serviceDistribution = [
  { name: "Engine Repairs", pct: 42, color: "bg-on-surface" },
  { name: "Brake Services", pct: 28, color: "bg-primary" },
  { name: "Oil & Filter", pct: 18, color: "bg-primary/40" },
  { name: "Other", pct: 12, color: "bg-surface-container-high" },
];

const revenueData = [20, 35, 45, 55, 70, 65, 80];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const Reports = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Performance Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive financial health and service distribution overview.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-outline rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low">
            <Calendar className="w-4 h-4" />
            This Month
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-on-surface text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard label="Total Revenue" value="$142,580.00" icon={DollarSign} badge="+12.4%" badgeColor="green" subtitle="vs last month" />
        <KpiCard label="Avg. Ticket Value" value="$482.15" icon={Receipt} badge="+4.2%" badgeColor="green" subtitle="per service" />
        <KpiCard label="Net Margin" value="24.8%" icon={TrendingUp} badgeColor="blue" subtitle="Stable on operations" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card p-8 rounded-xl shadow-sm border border-outline/20">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface">Revenue Growth Over Time</h4>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-semibold bg-surface-container rounded-lg text-on-surface">Monthly</button>
              <button className="px-3 py-1 text-xs font-semibold text-muted-foreground">Weekly</button>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-3 mb-4">
            {revenueData.map((h, i) => (
              <div key={i} className="w-full relative group">
                <div
                  className="w-full bg-primary/15 rounded-t-lg transition-all hover:bg-primary/25"
                  style={{ height: `${h}%` }}
                >
                  <div className="w-full h-full relative">
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-lg" style={{ height: `${Math.min(h * 0.7, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground">
            {months.map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-card p-8 rounded-xl shadow-sm border border-outline/20">
          <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface mb-6">Service Distribution</h4>
          <div className="space-y-5">
            {serviceDistribution.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-on-surface">{s.name}</span>
                  <span className="font-bold text-on-surface">{s.pct}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-surface-container rounded-xl">
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground mb-1">Top Performer</p>
            <p className="text-sm font-bold text-on-surface">Engine Systems Diagnostic</p>
          </div>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-card rounded-xl shadow-sm border border-outline/20 overflow-hidden">
        <div className="px-8 py-6 border-b border-outline flex justify-between items-center">
          <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface">Recent Payment Records</h4>
          <button className="text-xs font-bold text-primary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Vehicle / VIN</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/20">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-on-surface">{p.id}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-bold text-muted-foreground">{p.initials}</div>
                      <span className="text-sm font-semibold text-on-surface">{p.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-on-surface">{p.vehicle}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{p.vin}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.type}</td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">{p.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-outline/20 flex justify-between items-center">
          <span className="text-[10px] text-primary uppercase tracking-[0.15em] font-bold">Showing 4 of 284 records</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs text-muted-foreground">‹</button>
            <button className="px-3 py-1 text-xs text-muted-foreground">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
