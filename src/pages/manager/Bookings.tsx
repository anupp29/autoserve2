import { useState } from "react";
import { ClipboardList, Users, CheckCircle, Zap, MoreVertical, Filter, Download } from "lucide-react";

const statuses = ["All Bookings", "Pending", "Approved", "Cancelled"] as const;

const bookings = [
  { id: "#SP-9421", est: "2.5 Hours", client: "Marcus Thorne", vin: "1HGCM82633A...", date: "Oct 24, 2023", time: "09:00 AM", status: "Pending" as const, assignee: null },
  { id: "#SP-9388", est: "1.0 Hours", client: "Elena Rodriguez", vin: "5FNRL6H24EB...", date: "Oct 24, 2023", time: "11:30 AM", status: "Approved" as const, assignee: "Sarah Parker" },
  { id: "#SP-9344", est: "4.0 Hours", client: "Vector Logistics Inc", vin: "1GCWREEKXKZ...", date: "Oct 25, 2023", time: "08:00 AM", status: "Cancelled" as const, assignee: null },
  { id: "#SP-9310", est: "0.5 Hours", client: "Liam O'Neill", vin: "JTMBU4EE0K...", date: "Oct 25, 2023", time: "02:15 PM", status: "Pending" as const, assignee: null },
];

const statusColors = {
  Pending: "text-primary bg-primary/10",
  Approved: "text-on-surface bg-surface-container",
  Cancelled: "text-destructive bg-destructive/10",
};

const ManagerBookings = () => {
  const [activeTab, setActiveTab] = useState<typeof statuses[number]>("All Bookings");

  const filtered = activeTab === "All Bookings" ? bookings : bookings.filter(b => b.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>Operations</span>
          <span>/</span>
          <span className="text-primary font-semibold">Booking Management</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Service Queues</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-lg text-sm font-medium border border-border/30">
              <ClipboardList className="w-4 h-4" /> Table View
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-muted-foreground rounded-lg text-sm font-medium hover:bg-surface-container">
              14-Day Calendar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 rounded-lg"><ClipboardList className="w-5 h-5 text-primary" /></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Total Pending</p>
          <p className="text-2xl lg:text-3xl font-black text-on-surface mt-1">42 Jobs</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Assigned Today</p>
          <p className="text-2xl lg:text-3xl font-black text-on-surface mt-1">18/24</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
            <span className="text-[10px] font-bold text-muted-foreground">Avg 98%</span>
          </div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Completion Rate</p>
          <p className="text-2xl lg:text-3xl font-black text-on-surface mt-1">342 Units</p>
        </div>
        <div className="bg-primary p-5 rounded-xl shadow-sm text-primary-foreground">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-white/20 rounded-lg"><Zap className="w-5 h-5" /></div>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">High Load</span>
          </div>
          <p className="text-primary-foreground/70 text-[10px] uppercase tracking-[0.15em] font-bold">Efficiency Index</p>
          <p className="text-2xl lg:text-3xl font-black mt-1">8.4 / 10</p>
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 border-b border-border/20 gap-4">
          <div className="flex gap-1 overflow-x-auto">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setActiveTab(s)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === s ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-on-surface"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-border/30 rounded-lg text-xs font-medium text-on-surface">
              <Filter className="w-3.5 h-3.5" /> Advanced Filters
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-border/30 rounded-lg text-xs font-medium text-on-surface">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                <th className="text-left py-3 px-6 font-bold">Service Order</th>
                <th className="text-left py-3 px-4 font-bold">Customer & Vehicle</th>
                <th className="text-left py-3 px-4 font-bold">Schedule Date</th>
                <th className="text-left py-3 px-4 font-bold">Status</th>
                <th className="text-left py-3 px-4 font-bold">Assignee</th>
                <th className="text-center py-3 px-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold font-mono text-on-surface">{b.id}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Est: {b.est}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-semibold text-on-surface">{b.client}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">VIN: {b.vin}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-on-surface">{b.date}</p>
                    <p className="text-[10px] text-muted-foreground">{b.time}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[b.status]}`}>
                      {b.status === "Pending" && "● "}{b.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {b.assignee ? (
                      <span className="text-sm text-on-surface">{b.assignee}</span>
                    ) : (
                      <select className="text-xs bg-surface-container border border-border/30 rounded-lg px-2 py-1.5">
                        <option>Unassigned</option>
                      </select>
                    )}
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
          <p className="text-xs text-primary font-medium">Showing 1 - {filtered.length} of 42 results</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded">Previous</button>
            <button className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded">1</button>
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded">2</button>
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded">3</button>
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerBookings;
