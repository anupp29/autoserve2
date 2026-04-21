import { useMemo, useState } from "react";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { useProfilesByRole } from "@/hooks/useStaff";
import { formatINR, formatDate } from "@/lib/format";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

interface History { id: string; cost: number; service_date: string; service_id: string; customer_id: string; vehicle_id: string; }
interface Service { id: string; name: string; category: string; }
interface Vehicle { id: string; make: string; model: string; year: number; registration: string; }

const PERIODS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: 0 },
] as const;

const ManagerReports = () => {
  const { data: history } = useLiveTable<History>("service_history", (q) => q.order("service_date", { ascending: false }));
  const { data: services } = useLiveTable<Service>("services", (q) => q);
  const { data: vehicles } = useLiveTable<Vehicle>("vehicles", (q) => q);
  const { byId } = useProfilesByRole();
  const [periodDays, setPeriodDays] = useState(30);

  const periodMs = periodDays > 0 ? periodDays * 24 * 3600 * 1000 : Infinity;
  const since = periodDays > 0 ? Date.now() - periodMs : 0;
  const periodHistory = history.filter((h) => new Date(h.service_date).getTime() >= since);

  const totalRevenue = periodHistory.reduce((s, h) => s + Number(h.cost || 0), 0);
  const avgTicket = periodHistory.length ? totalRevenue / periodHistory.length : 0;

  // monthly bars (last 6 months)
  const months = useMemo(() => {
    const arr: { month: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setMonth(next.getMonth() + 1);
      arr.push({
        month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
        total: history.filter((h) => {
          const t = new Date(h.service_date).getTime();
          return t >= d.getTime() && t < next.getTime();
        }).reduce((s, h) => s + Number(h.cost || 0), 0),
      });
    }
    return arr;
  }, [history]);
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  // service distribution
  const distribution = useMemo(() => {
    const totals: Record<string, number> = {};
    periodHistory.forEach((h) => {
      const cat = services.find((s) => s.id === h.service_id)?.category || "Other";
      totals[cat] = (totals[cat] || 0) + Number(h.cost || 0);
    });
    const grand = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(totals)
      .map(([name, amt]) => ({ name, pct: Math.round((amt / grand) * 100), amt }))
      .sort((a, b) => b.amt - a.amt)
      .slice(0, 5);
  }, [periodHistory, services]);

  const exportCsv = () => {
    const rows = [
      ["Date", "Customer", "Vehicle", "Service", "Cost"],
      ...history.map((h) => {
        const v = vehicles.find((x) => x.id === h.vehicle_id);
        const s = services.find((x) => x.id === h.service_id);
        const c = byId[h.customer_id];
        return [formatDate(h.service_date), c?.full_name ?? "—", v ? `${v.year} ${v.make} ${v.model} (${v.registration})` : "—", s?.name ?? "—", String(h.cost)];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `autoserve-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Performance Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Live financial overview and service distribution.</p>
        </div>
        <div className="flex gap-2 self-start flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setPeriodDays(p.days)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                periodDays === p.days
                  ? "bg-on-surface text-card border-on-surface"
                  : "border-border/30 text-on-surface hover:bg-surface-container"
              }`}
            >
              <Calendar className="w-4 h-4" /> {p.label}
            </button>
          ))}
          <button onClick={exportCsv} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <Kpi label={`Revenue (${periodDays > 0 ? `${periodDays}d` : "All time"})`} value={formatINR(totalRevenue)} sub={`${periodHistory.length} services`} subColor="text-emerald-600" />
        <Kpi label="Avg. Ticket" value={formatINR(avgTicket)} sub="per completed service" subColor="text-emerald-600" />
        <Kpi label="Lifetime Records" value={String(history.length)} sub="all-time history" subColor="text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Revenue — Last 6 Months</h3>
            <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Live</span>
          </div>
          <div className="h-48 flex items-end gap-4">
            {months.map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-on-surface font-mono">{bar.total > 0 ? formatINR(bar.total) : ""}</span>
                <div className="w-full bg-gradient-to-t from-primary to-primary/40 rounded-t" style={{ height: `${Math.max((bar.total / maxMonth) * 100, 4)}%` }} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-4">Service Distribution</h3>
          {distribution.length === 0 && <p className="text-xs text-muted-foreground">No data yet.</p>}
          {distribution.map((d) => (
            <div key={d.name} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-on-surface font-medium">{d.name}</span>
                <span className="font-bold text-on-surface">{d.pct}%</span>
              </div>
              <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border/20">
          <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                <th className="text-left py-3 px-6 font-bold">Date</th>
                <th className="text-left py-3 px-4 font-bold">Customer</th>
                <th className="text-left py-3 px-4 font-bold">Vehicle</th>
                <th className="text-left py-3 px-4 font-bold">Service</th>
                <th className="text-right py-3 px-4 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {history.slice(0, 10).map((h) => {
                const v = vehicles.find((x) => x.id === h.vehicle_id);
                const s = services.find((x) => x.id === h.service_id);
                const c = byId[h.customer_id];
                return (
                  <tr key={h.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-on-surface">{formatDate(h.service_date)}</td>
                    <td className="py-4 px-4 text-sm text-on-surface">{c?.full_name || "—"}</td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">{v ? `${v.make} ${v.model}` : "—"}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{s?.name || "—"}</td>
                    <td className="py-4 px-4 text-sm font-bold text-on-surface text-right font-mono">{formatINR(h.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Kpi = ({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor: string }) => (
  <div className="bg-card p-5 lg:p-6 rounded-xl border border-border/20 shadow-sm">
    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{label}</p>
    <p className="text-3xl font-black text-on-surface tracking-tight mt-2 font-mono">{value}</p>
    <p className={`text-[10px] ${subColor} mt-2`}>{sub}</p>
  </div>
);

export default ManagerReports;
