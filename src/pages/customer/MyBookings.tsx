import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, MapPin, User, CheckCircle } from "lucide-react";

const tabs = ["All Bookings", "Upcoming", "Past Services", "Cancelled"] as const;

const CustomerBookings = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Bookings");

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold text-on-surface tracking-tight">My Bookings</h1><p className="text-sm text-muted-foreground mt-1">Manage your upcoming and past service appointments.</p></div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${activeTab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-on-surface"}`}>{t}</button>
        ))}
      </div>

      {/* Upcoming */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Upcoming & In Progress</h3>
          <span className="text-xs font-bold text-primary">2 Active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* In Progress Card with Track Status */}
          <div className="bg-card p-5 rounded-xl border-2 border-primary/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3"><span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> In Progress</span></div>
            <h4 className="font-bold text-on-surface mb-1">Full Transmission Flush</h4>
            <p className="text-xs font-mono text-muted-foreground mb-3">Hyundai Creta • HR-26-DK-5678</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Oct 24, 2024 • 09:00 AM</div>
              <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> AutoServe Gurugram - Bay 04</div>
            </div>
            {/* Track Status */}
            <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-border/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Live Progress</span>
                <span className="text-[10px] font-bold text-primary">65%</span>
              </div>
              <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-3">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: "65%" }} />
              </div>
              <div className="space-y-2">
                {[
                  { step: "Vehicle Check-in", done: true, time: "09:05 AM" },
                  { step: "Fluid Drain & Inspection", done: true, time: "09:42 AM" },
                  { step: "New Fluid Fill & Testing", done: false, active: true },
                  { step: "Quality Verification", done: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {s.done ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : s.active ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-border/40 shrink-0" />
                    )}
                    <span className={`text-xs ${s.done ? "text-muted-foreground line-through" : s.active ? "text-on-surface font-medium" : "text-muted-foreground"}`}>{s.step}</span>
                    {s.time && <span className="text-[10px] text-muted-foreground font-mono ml-auto">{s.time}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3"><span className="text-[10px] font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded">Confirmed</span></div>
            <h4 className="font-bold text-on-surface mb-1">Brake Pad Replacement</h4>
            <p className="text-xs font-mono text-muted-foreground mb-3">Maruti Swift • DL-4C-AB-1234</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Oct 28, 2024 • 02:30 PM</div>
              <div className="flex items-center gap-2"><User className="w-3 h-3" /> Technician: Rajesh Kumar</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 border border-border/30 rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container active:scale-[0.98] transition-all">Reschedule</button>
              <button className="px-4 py-2 text-xs font-bold text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5 active:scale-[0.98] transition-all">Cancel</button>
            </div>
          </div>

          <Link to="/customer/book" className="border-2 border-dashed border-border/30 rounded-xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all cursor-pointer group">
            <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-sm">Book New Service</h4>
            <p className="text-xs mt-1">Need maintenance? Schedule it now.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookings;
