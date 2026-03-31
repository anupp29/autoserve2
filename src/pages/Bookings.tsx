import KpiCard from "@/components/ui/KpiCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { ClipboardList, UserCheck, CheckCircle2, Gauge, MoreVertical } from "lucide-react";
import { useState } from "react";

const tabs = ["All Bookings", "Pending", "Approved", "Cancelled"];

const bookings = [
  { id: "#SP-9421", est: "2.5 Hours", customer: "Marcus Thorne", vin: "1HGCM82633A...", date: "Oct 24, 2023", time: "09:00 AM", status: "pending" as const, assignee: null },
  { id: "#SP-9388", est: "1.0 Hours", customer: "Elena Rodriguez", vin: "5FNRL6H24EB...", date: "Oct 24, 2023", time: "11:30 AM", status: "approved" as const, assignee: "Sarah Parker" },
  { id: "#SP-9344", est: "4.0 Hours", customer: "Vector Logistics Inc", vin: "1GCWKREEXKZ...", date: "Oct 25, 2023", time: "08:00 AM", status: "cancelled" as const, assignee: null },
  { id: "#SP-9310", est: "0.5 Hours", customer: "Liam O'Neill", vin: "JTMBU4EE0K...", date: "Oct 25, 2023", time: "02:15 PM", status: "pending" as const, assignee: null },
];

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("All Bookings");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="flex text-xs font-medium text-muted-foreground uppercase tracking-[0.15em] mb-2">
            <span>Operations</span>
            <span className="mx-2">/</span>
            <span className="text-primary">Booking Management</span>
          </nav>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Service Queues</h2>
        </div>
        <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
          <button className="flex items-center gap-2 px-4 py-2 bg-card shadow-sm rounded-lg text-sm font-semibold text-on-surface">
            Table View
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-card/50 rounded-lg transition-all">
            14-Day Calendar
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard label="Total Pending" value="42 Jobs" icon={ClipboardList} badge="+12%" badgeColor="red" />
        <KpiCard label="Assigned Today" value="18/24" icon={UserCheck} badge="Active" badgeColor="blue" />
        <KpiCard label="Completion Rate" value="342 Units" icon={CheckCircle2} badge="Avg 98%" badgeColor="blue" />
        <KpiCard label="Efficiency Index" value="8.4 / 10" icon={Gauge} badge="High Load" variant="gradient" />
      </div>

      {/* Main Table */}
      <div className="bg-card rounded-xl shadow-sm border border-outline/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-on-surface bg-surface-container rounded-lg border border-outline/50">
              Advanced Filters
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-on-surface bg-surface-container rounded-lg border border-outline/50">
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Service Order</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Customer & Vehicle</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Schedule Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Assignee</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/20">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-on-surface">{b.id}</span>
                    <div className="text-[10px] text-muted-foreground mt-0.5">EST: {b.est}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-on-surface">{b.customer}</div>
                    <div className="text-xs text-muted-foreground font-mono tracking-tighter">VIN: {b.vin}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-on-surface">{b.date}</div>
                    <div className="text-xs text-muted-foreground">{b.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4">
                    {b.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center">
                          <span className="text-[10px] font-bold text-muted-foreground">{b.assignee[0]}</span>
                        </div>
                        <span className="text-xs font-semibold text-on-surface">{b.assignee}</span>
                      </div>
                    ) : (
                      <select className="bg-surface-container-low border border-outline rounded-lg text-xs font-medium py-2 px-3 focus:ring-2 focus:ring-primary/20">
                        <option>Unassigned</option>
                        <option>James Wilson</option>
                        <option>Sarah Parker</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-outline/20 flex justify-between items-center">
          <span className="text-xs text-primary font-semibold">Showing 1 - 4 of 42 results</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs text-muted-foreground">Previous</button>
            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg font-bold">1</button>
            <button className="px-3 py-1 text-xs text-on-surface">2</button>
            <button className="px-3 py-1 text-xs text-on-surface">3</button>
            <button className="px-3 py-1 text-xs text-muted-foreground">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
