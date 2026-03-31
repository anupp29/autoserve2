import { useState } from "react";
import { Plus, Calendar, MapPin, User } from "lucide-react";

const tabs = ["All Bookings", "Upcoming", "Past Services", "Cancelled"] as const;

const CustomerBookings = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Bookings");

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold text-on-surface tracking-tight">My Bookings</h1><p className="text-sm text-muted-foreground mt-1">Manage your upcoming and past service appointments.</p></div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors ${activeTab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-on-surface"}`}>{t}</button>
        ))}
      </div>

      {/* Upcoming */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Upcoming & In Progress</h3>
          <span className="text-xs font-bold text-primary">2 Active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card p-5 rounded-xl border-2 border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 mb-3"><span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">● In Progress</span></div>
            <h4 className="font-bold text-on-surface mb-1">Full Transmission Flush</h4>
            <p className="text-xs font-mono text-muted-foreground mb-3">VIN: 1HGCM8263...902</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Oct 24, 2023 • 09:00 AM</div>
              <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> North Wing HQ - Bay 04</div>
            </div>
            <button className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold">Track Status</button>
          </div>

          <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
            <div className="flex items-center gap-2 mb-3"><span className="text-[10px] font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded">Confirmed</span></div>
            <h4 className="font-bold text-on-surface mb-1">Brake Pad Replacement</h4>
            <p className="text-xs font-mono text-muted-foreground mb-3">VIN: 3VWCP7A...412</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Oct 28, 2023 • 02:30 PM</div>
              <div className="flex items-center gap-2"><User className="w-3 h-3" /> Technician: Sarah Miller</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 border border-border/30 rounded-lg text-xs font-bold text-on-surface">Reschedule</button>
              <button className="px-4 py-2 text-xs font-bold text-destructive border border-destructive/30 rounded-lg">Cancel</button>
            </div>
          </div>

          <div className="border-2 border-dashed border-border/30 rounded-xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
            <Plus className="w-8 h-8 mb-2" />
            <h4 className="font-bold text-sm">Book New Service</h4>
            <p className="text-xs mt-1">Need maintenance? Schedule it now.</p>
          </div>
        </div>
      </div>

      {/* Past History */}
      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="p-4 lg:p-6 border-b border-border/20">
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Past Service History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
              <th className="text-left py-3 px-6 font-bold">Service Type</th><th className="text-left py-3 px-4 font-bold">Vehicle</th><th className="text-left py-3 px-4 font-bold">Date Completed</th><th className="text-left py-3 px-4 font-bold">Status</th><th className="text-right py-3 px-4 font-bold">Total</th><th className="text-right py-3 px-4 font-bold"></th>
            </tr></thead>
            <tbody className="divide-y divide-border/10">
              {[
                { service: "Synthetic Oil Change", vehicle: "2021 Toyota Corolla", date: "Sep 12, 2023", status: "Completed", total: "$89.00" },
                { service: "Tire Rotation & Balance", vehicle: "2019 Honda Civic", date: "Aug 05, 2023", status: "Completed", total: "$45.00" },
                { service: "Engine Diagnostics", vehicle: "2021 Toyota Corolla", date: "Jul 20, 2023", status: "Cancelled", total: "$0.00" },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-surface-container-low/50">
                  <td className="py-4 px-6"><div className="flex items-center gap-2"><span className="text-sm">🔧</span><span className="text-sm font-semibold text-on-surface">{r.service}</span></div></td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{r.vehicle}</td>
                  <td className="py-4 px-4 text-sm text-on-surface">{r.date}</td>
                  <td className="py-4 px-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "Completed" ? "text-emerald-600 bg-emerald-50" : "text-muted-foreground bg-surface-container"}`}>{r.status === "Completed" && "✓ "}{r.status}</span></td>
                  <td className="py-4 px-4 text-sm font-bold text-on-surface text-right font-mono">{r.total}</td>
                  <td className="py-4 px-4 text-right"><button className="text-xs text-primary font-semibold">Invoice</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookings;
