import { Link } from "react-router-dom";
import { Car, Zap, Calendar, Star, CheckCircle, MapPin } from "lucide-react";

const CustomerDashboard = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-on-surface tracking-tight">Welcome back, Alex.</h1>
      <p className="text-sm text-muted-foreground mt-1">Your fleet health is <span className="text-emerald-600 font-semibold">94%</span> today. 2 actions recommended.</p>
    </div>

    {/* Vehicles */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
        {[
          { name: "2023 Tesla Model 3", color: "Deep Blue Metallic • Long Range", vin: "4K32...981", odo: "12,482", unit: "mi" },
          { name: "2021 Rivian R1T", color: "Forest Green • Adventure Pack", vin: "1N4B...204", charge: "82", nextService: "1,200 mi to go" },
        ].map(v => (
          <Link to="/customer/vehicles" key={v.vin} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors"><Car className="w-5 h-5 text-primary" /></div>
              <span className="text-[10px] font-mono text-muted-foreground">VIN: {v.vin}</span>
            </div>
            <h3 className="font-bold text-on-surface">{v.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">{v.color}</p>
            <div className="flex gap-4">
              {v.odo && <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Odometer</p><p className="text-xl font-black text-on-surface font-mono">{v.odo} <span className="text-xs font-normal">{v.unit}</span></p></div>}
              {v.charge && <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Charge Level</p><p className="text-xl font-black text-on-surface font-mono">{v.charge} <span className="text-xs font-normal">%</span></p></div>}
              {v.nextService && <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Next Service</p><p className="text-sm font-semibold text-primary">{v.nextService}</p></div>}
            </div>
          </Link>
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-primary">AI Maintenance Insights</span>
        </div>
        <h3 className="text-lg font-bold mb-2">Optimize Brake Life</h3>
        <p className="text-sm text-slate-400 mb-4">Based on your recent driving patterns in hill terrain, we recommend recalibrating your regenerative braking sensitivity to extend pad life by an estimated 15%.</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" /> Dynamic route optimization enabled</div>
          <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" /> Battery thermal management: Active</div>
        </div>
        <Link to="/customer/diagnostics" className="w-full py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm font-bold hover:bg-white/20 active:scale-[0.98] transition-all block text-center">View Full Analysis</Link>
      </div>
    </div>

    {/* Work History & Appointment */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border/20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-on-surface">Recent Work History</h3>
          <Link to="/customer/history" className="text-xs text-primary font-semibold hover:underline">Download All Logs</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead><tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
              <th className="text-left py-2 font-bold">Date</th><th className="text-left py-2 font-bold">Service Item</th><th className="text-left py-2 font-bold">Vehicle</th><th className="text-left py-2 font-bold">Status</th><th className="text-right py-2 font-bold">Cost</th>
            </tr></thead>
            <tbody className="divide-y divide-border/10">
              {[
                { date: "Oct 24, 2024", service: "Full System Diagnostic", sub: "Firmware Update v2.4.1", vehicle: "Tesla Model 3", cost: "$185.00" },
                { date: "Oct 12, 2024", service: "HVAC Filter Swap", sub: "HEPA Purification Install", vehicle: "Rivian R1T", cost: "$112.50" },
                { date: "Sep 30, 2024", service: "Front Rotors & Pads", sub: "", vehicle: "Rivian R1T", cost: "$940.00" },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-surface-container-low/50 transition-colors"><td className="py-3 text-xs text-muted-foreground">{r.date}</td><td className="py-3"><p className="text-sm font-semibold text-on-surface">{r.service}</p>{r.sub && <p className="text-[10px] text-muted-foreground">{r.sub}</p>}</td><td className="py-3 text-sm text-muted-foreground">{r.vehicle}</td><td className="py-3"><span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />Completed</span></td><td className="py-3 text-sm font-bold text-on-surface text-right font-mono">{r.cost}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-on-surface">Upcoming Appointment</h4>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 rounded-lg p-3 text-center"><p className="text-[10px] uppercase text-primary font-bold">Nov</p><p className="text-xl font-black text-primary">08</p></div>
            <div><p className="text-sm font-bold text-on-surface">Winter Readiness Inspection</p><p className="text-xs text-muted-foreground">09:30 AM • North Wing HQ</p><span className="text-[10px] text-primary font-bold flex items-center gap-1"><MapPin className="w-3 h-3" /> Main Station</span></div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 border border-border/30 rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container active:scale-[0.98] transition-all">Reschedule</button>
            <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all">Confirm Arrival</button>
          </div>
        </div>

        <div className="bg-primary p-5 rounded-xl text-primary-foreground">
          <div className="flex items-center justify-between mb-2"><h4 className="font-bold">Membership Perks</h4><Star className="w-4 h-4" /></div>
          <p className="text-xs text-primary-foreground/70 mb-3">Elite Tier Status</p>
          <p className="text-sm font-semibold">Next Reward: Free Detailing</p>
          <div className="mt-2 h-1.5 bg-white/20 rounded-full"><div className="h-full w-[85%] bg-white rounded-full transition-all duration-700" /></div>
          <p className="text-[10px] text-primary-foreground/60 mt-1 text-right">850 / 1000</p>
        </div>
      </div>
    </div>
  </div>
);

export default CustomerDashboard;
