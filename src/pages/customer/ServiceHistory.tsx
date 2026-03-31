import { Link } from "react-router-dom";
import { Filter, Download, Settings, Wrench, Zap, Calendar, CheckCircle } from "lucide-react";

const records = [
  { service: "Major Interval Service", date: "Jan 14, 2024", km: "42,500", cost: "₹12,450", verified: true, diagnosis: "Standard 40k inspection revealed minor wear on rear brake pads and coolant acidity. Engine health stable.", work: ["Synthetic Oil & Filter Exchange", "Rear Brake Pad Replacement", "Coolant System Flush"], parts: ["P/N: 06L-115-562-B", "P/N: 8W0-698-451-R", "G12-EV0-C00L"], icon: Settings },
  { service: "Tyre Rotation & Balancing", date: "Oct 02, 2023", km: "38,120", cost: "₹1,850", verified: true, diagnosis: "Customer reported vibration at 80 kmph. Found right front tyre out of balance by 20g.", work: ["High-speed dynamic balancing", "4-wheel rotation"], parts: ["SERVICE-TRB-01"], icon: Wrench },
  { service: "Electrical Diagnostic & Repair", date: "Jul 12, 2023", km: "35,400", cost: "₹8,420", verified: true, diagnosis: "Engine fault code P0301. Found frayed wiring harness connecting to cylinder 1 ignition coil.", work: ["Harness pin extraction and rebuild", "Ignition coil replacement"], parts: ["P/N: 06E-905-115-G", "P/N: 4H0-973-702"], icon: Zap },
];

const CustomerServiceHistory = () => (
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Service Timeline</h1>
        <p className="text-sm text-muted-foreground mt-1">Historical records for VIN: <span className="text-primary font-semibold">MA3FJEB1...</span></p>
      </div>
      <div className="flex gap-2 self-start">
        <button className="flex items-center gap-1.5 px-3 py-2 border border-border/30 rounded-lg text-xs font-medium hover:bg-surface-container active:scale-[0.98] transition-all"><Filter className="w-3.5 h-3.5" /> Filter</button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-border/30 rounded-lg text-xs font-medium hover:bg-surface-container active:scale-[0.98] transition-all"><Download className="w-3.5 h-3.5" /> Export PDF</button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {records.map((r, i) => (
          <div key={i} className="bg-card p-6 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{r.service}</h3>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Completed {r.date} • {r.km} km</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-on-surface font-mono">{r.cost}</p>
                {r.verified && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 justify-end"><CheckCircle className="w-3 h-3" /> Verified</span>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Diagnosis</h4>
                <p className="text-sm text-muted-foreground italic leading-relaxed">"{r.diagnosis}"</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Work Performed</h4>
                <ul className="space-y-1">
                  {r.work.map((w, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {r.parts.map(p => <span key={p} className="text-[10px] font-mono bg-surface-container px-2 py-1 rounded text-muted-foreground">{p}</span>)}
              <button className="ml-auto text-xs text-primary font-semibold flex items-center gap-1 hover:underline">View Full Report →</button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm">AI Precision Insight</h4>
          </div>
          <p className="text-xs text-slate-400 mb-4">Based on your driving patterns and local climate, we recommend the following maintenance targets.</p>
          {[
            { name: "Spark Plug Replacement", badge: "High Priority", pct: 85 },
            { name: "Transmission Fluid Check", badge: "Projected", pct: 40 },
          ].map(tip => (
            <div key={tip.name} className="bg-white/5 border border-white/10 rounded-lg p-3 mb-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">{tip.name}</span>
                <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded">{tip.badge}</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full"><div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${tip.pct}%` }} /></div>
              <p className="text-right text-[10px] text-slate-500 mt-1">{tip.pct}%</p>
            </div>
          ))}
          <Link to="/customer/book" className="w-full mt-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold block text-center hover:bg-primary/90 active:scale-[0.98] transition-all">
            <Calendar className="w-4 h-4 inline mr-1" /> Schedule Selected
          </Link>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Vehicle Health Score</h4>
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--surface-container-high))" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray={`${94 * 2.64} ${264 - 94 * 2.64}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-on-surface">94</span>
              </div>
            </div>
            <p className="text-sm text-emerald-600 font-semibold flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Excellent</p>
            <p className="text-xs text-muted-foreground mt-2">Last scanned 2 days ago</p>
            <button className="mt-3 text-xs text-primary font-bold uppercase tracking-wider hover:underline">Run Scan</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CustomerServiceHistory;
