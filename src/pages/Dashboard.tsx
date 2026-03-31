import KpiCard from "@/components/ui/KpiCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const revenueData = [
  { day: "Mon", height: 60 },
  { day: "Tue", height: 45 },
  { day: "Wed", height: 75 },
  { day: "Thu", height: 65 },
  { day: "Fri", height: 90 },
  { day: "Sat", height: 100, active: true },
  { day: "Sun", height: 20 },
];

const criticalItems = [
  { name: "Brake Pads (Ceramic)", id: "BP-9902", qty: 2, unit: "Left", variant: "critical" as const },
  { name: "HV Cooling Fluid", id: "CF-H01", qty: 5, unit: "Gal", variant: "warning" as const },
  { name: "Synthetic Oil 5W-30", id: "OIL-530", qty: 12, unit: "Qt", variant: "neutral" as const },
];

const recentBookings = [
  { id: "#AS-4920", client: "Jonathan Doe", vehicle: "2022 Tesla Model 3", service: "Brake Inspection", tech: "Marcus V.", status: "in-progress" as const },
  { id: "#AS-4919", client: "Sarah Chen", vehicle: "2019 Audi Q7", service: "HVAC Service", tech: "Elena R.", status: "completed" as const },
  { id: "#AS-4918", client: "Robert Miller", vehicle: "2023 Ford F-150 Lightning", service: "Software Update", tech: "Thomas K.", status: "pending" as const },
];

const itemVariantClasses = {
  critical: "bg-error-container/30 border-destructive/10",
  warning: "bg-amber-50 border-amber-200",
  neutral: "bg-surface-container border-transparent",
};

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time operational status for Main Street Service Center.
          </p>
        </div>
        <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Live Updates
        </span>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard label="Total Revenue" value="$42,890.00" icon={DollarSign} badge="+12.5%" badgeColor="green" />
        <KpiCard label="Total Bookings" value="158" icon={Calendar} badgeColor="blue" />
        <KpiCard label="Completion Rate" value="94.2%" icon={CheckCircle2} badgeColor="blue" />
        <KpiCard label="Stock Alerts" value="8 Items Low" icon={AlertTriangle} badgeColor="red" />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card p-8 rounded-xl shadow-sm border border-outline/20">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-lg font-bold tracking-tight text-on-surface">Daily Revenue Pulse</h4>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-semibold bg-surface-container rounded-lg text-on-surface">Week</button>
              <button className="px-3 py-1 text-xs font-semibold text-muted-foreground">Month</button>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {revenueData.map((bar) => (
              <div key={bar.day} className="w-full relative group">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    bar.active ? "bg-primary" : "bg-primary-container"
                  }`}
                  style={{ height: `${bar.height}%` }}
                />
                {bar.active && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                    Today: $8.1k
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground">
            {revenueData.map((bar) => (
              <span key={bar.day}>{bar.day}</span>
            ))}
          </div>
        </div>

        {/* Critical Inventory */}
        <div className="bg-card p-8 rounded-xl shadow-sm border border-outline/20">
          <h4 className="text-lg font-bold tracking-tight text-on-surface mb-6">Critical Inventory</h4>
          <div className="space-y-4">
            {criticalItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${itemVariantClasses[item.variant]}`}
              >
                <div>
                  <p className="text-sm font-bold text-on-surface">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                    Stock ID: {item.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${item.variant === "critical" ? "text-destructive" : item.variant === "warning" ? "text-amber-600" : "text-muted-foreground"}`}>
                    {item.qty}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-xs font-bold text-primary hover:bg-primary-container rounded-lg transition-colors border border-primary/20">
            Manage Full Inventory
          </button>
        </div>
      </div>

      {/* Recent Service Bookings */}
      <div className="bg-card rounded-xl shadow-sm border border-outline/20 overflow-hidden">
        <div className="px-8 py-6 border-b border-outline flex justify-between items-center">
          <h4 className="text-lg font-bold tracking-tight text-on-surface">Recent Service Bookings</h4>
          <div className="flex gap-4">
            <select className="text-xs font-bold border-none bg-surface-container rounded-lg focus:ring-2 focus:ring-primary/20 px-3 py-1.5">
              <option>All Technicians</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-on-surface text-white rounded-lg">
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground">
                <th className="px-8 py-4">Job ID</th>
                <th className="px-8 py-4">Client / Vehicle</th>
                <th className="px-8 py-4">Service Type</th>
                <th className="px-8 py-4">Technician</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-4 font-mono text-xs font-bold">{booking.id}</td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-bold text-on-surface">{booking.client}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">{booking.vehicle}</p>
                  </td>
                  <td className="px-8 py-4">
                    <span className="px-2 py-1 bg-surface-container text-muted-foreground rounded-full text-[10px] font-bold">
                      {booking.service}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground">{booking.tech[0]}</span>
                      </div>
                      <span className="text-xs font-medium">{booking.tech}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <StatusBadge status={booking.status} />
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

export default Dashboard;
