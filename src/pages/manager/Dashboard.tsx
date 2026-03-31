import { Link } from "react-router-dom";
import { TrendingUp, DollarSign, Calendar, CheckCircle, AlertTriangle, MoreHorizontal } from "lucide-react";

const ManagerDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time operational status for Main Street Service Center.</p>
        </div>
        <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-semibold text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Live Updates
        </span>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard icon={<DollarSign className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" label="Total Revenue" value="$42,890.00" badge="+12.5%" badgeColor="text-emerald-600 bg-emerald-50" />
        <KpiCard icon={<Calendar className="w-5 h-5 text-tertiary" />} iconBg="bg-tertiary/10" label="Total Bookings" value="158" />
        <KpiCard icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" label="Completion Rate" value="94.2%" />
        <KpiCard icon={<AlertTriangle className="w-5 h-5 text-destructive" />} iconBg="bg-destructive/10" label="Stock Alerts" value="8 Items Low" />
      </div>

      {/* Revenue & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-sm border border-border/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-on-surface">Daily Revenue Pulse</h3>
            <div className="flex gap-1 bg-surface-container rounded-lg p-0.5">
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground rounded-md hover:bg-card">Week</button>
              <button className="px-3 py-1 text-xs font-medium bg-card text-on-surface rounded-md shadow-sm">Month</button>
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {[
              { day: "MON", h: 40 }, { day: "TUE", h: 55 }, { day: "WED", h: 45 },
              { day: "THU", h: 50 }, { day: "FRI", h: 75, highlight: true },
              { day: "SAT", h: 90, highlight: true, label: "$8.1k" },
              { day: "SUN", h: 35 },
            ].map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
                {bar.label && (
                  <div className="bg-on-surface text-card text-[10px] font-bold px-2 py-1 rounded">
                    Today: {bar.label}
                  </div>
                )}
                <div
                  className={`w-full rounded-t-md transition-all ${bar.highlight ? "bg-primary" : "bg-primary/15"}`}
                  style={{ height: `${bar.h}%` }}
                />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Inventory */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border/20">
          <h3 className="font-bold text-on-surface mb-4">Critical Inventory</h3>
          <div className="space-y-3">
            {[
              { name: "Brake Pads (Ceramic)", sku: "BP-9902", qty: "2", unit: "LEFT", color: "text-destructive" },
              { name: "HV Cooling Fluid", sku: "CF-H01", qty: "5", unit: "GAL", color: "text-amber-600" },
              { name: "Synthetic Oil 5W-30", sku: "OIL-530", qty: "12", unit: "QT", color: "text-on-surface" },
            ].map((item) => (
              <div key={item.sku} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-border/10">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Stock ID: {item.sku}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black ${item.color}`}>{item.qty}</span>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.unit}</p>
                </div>
              </div>
            ))}
            <Link to="/manager/inventory" className="w-full text-center text-sm text-primary font-semibold py-2 border border-border/30 rounded-lg hover:bg-surface-container transition-colors block">
              Manage Full Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-bold text-on-surface">Recent Service Bookings</h3>
          <div className="flex gap-2">
            <select className="text-xs bg-surface-container border-none rounded-lg px-3 py-2 font-medium text-muted-foreground">
              <option>All Technicians</option>
            </select>
            <button className="flex items-center gap-1.5 text-xs font-semibold bg-on-surface text-card px-3 py-2 rounded-lg">
              <MoreHorizontal className="w-3 h-3" /> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/30">
                <th className="text-left py-3 font-bold">Job ID</th>
                <th className="text-left py-3 font-bold">Client / Vehicle</th>
                <th className="text-left py-3 font-bold">Service Type</th>
                <th className="text-left py-3 font-bold">Technician</th>
                <th className="text-right py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {[
                { id: "#AS-4920", client: "Jonathan Doe", vehicle: "2022 Tesla Model 3", service: "Brake Inspection", tech: "Marcus V.", status: "In Progress", color: "text-primary bg-primary/10" },
                { id: "#AS-4919", client: "Sarah Chen", vehicle: "2019 Audi Q7", service: "HVAC Service", tech: "Elena R.", status: "Completed", color: "text-emerald-600 bg-emerald-50" },
                { id: "#AS-4918", client: "Robert Miller", vehicle: "2023 Ford F-150 Lightning", service: "Software Update", tech: "Thomas K.", status: "Pending", color: "text-amber-600 bg-amber-50" },
              ].map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 text-sm font-mono font-semibold text-on-surface">{row.id}</td>
                  <td className="py-4">
                    <p className="text-sm font-semibold text-on-surface">{row.client}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.vehicle}</p>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-medium bg-surface-container px-2 py-1 rounded">{row.service}</span>
                  </td>
                  <td className="py-4 text-sm text-on-surface">{row.tech}</td>
                  <td className="py-4 text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.color}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, iconBg, label, value, badge, badgeColor }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string;
  badge?: string; badgeColor?: string;
}) => (
  <div className="bg-card p-5 lg:p-6 rounded-xl shadow-sm border border-border/20">
    <div className="flex justify-between items-start mb-3 lg:mb-4">
      <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      {badge && <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>}
    </div>
    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{label}</p>
    <h3 className="text-2xl lg:text-3xl font-black text-on-surface tracking-tight mt-1">{value}</h3>
  </div>
);

export default ManagerDashboard;
