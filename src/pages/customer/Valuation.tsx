import { useState } from "react";
import { Download, RefreshCw, CheckCircle, AlertTriangle, History, TrendingUp, Car, Shield } from "lucide-react";

const conditions = ["Fair", "Good", "Excellent", "Showroom"] as const;
const mods = [
  { name: "Premium Audio Package", checked: true },
  { name: "Aftermarket Exhaust", checked: false },
  { name: "Ceramic Coating", checked: true },
];

const valuationHistory = [
  { date: "24 May 2024", vehicle: "2021 Model X", vin: "1HGB...XMN0", condition: "Excellent", valuation: "$34,850", trend: "2.4%", trendUp: true, status: "Active" },
  { date: "12 May 2024", vehicle: "2019 SUV Pro", vin: "5J6Y...S721", condition: "Good", valuation: "$21,200", trend: "0.0%", trendUp: false, status: "Archived" },
];

const Valuation = () => {
  const [vin, setVin] = useState("1HGBH41JXMN0");
  const [odometer, setOdometer] = useState(42500);
  const [condition, setCondition] = useState<typeof conditions[number]>("Excellent");
  const [modChecks, setModChecks] = useState(mods.map(m => m.checked));

  const toggleMod = (i: number) => {
    const next = [...modChecks];
    next[i] = !next[i];
    setModChecks(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Vehicle Resale Predictor</h1>
          <p className="text-sm text-muted-foreground mt-1">Precision market analysis powered by engineering-grade data.</p>
        </div>
        <div className="flex gap-2 self-start">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border/30 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all">
            <RefreshCw className="w-4 h-4" /> Recalculate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Parameters */}
        <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Car className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Vehicle Parameters</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-2">VIN Identification</label>
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="w-full bg-surface-container-low border border-border/30 rounded-lg px-4 py-3 text-sm font-mono text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Odometer Reading</label>
                <span className="text-sm font-bold text-primary font-mono">{odometer.toLocaleString()} mi</span>
              </div>
              <input
                type="range"
                min={0}
                max={200000}
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-3">Vehicle Condition</label>
              <div className="grid grid-cols-2 gap-2">
                {conditions.map(c => (
                  <button
                    key={c}
                    onClick={() => setCondition(c)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      condition === c
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border/30 text-on-surface hover:border-border/60"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-3">Modifications & Upgrades</label>
              <div className="space-y-3">
                {mods.map((m, i) => (
                  <label key={m.name} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleMod(i)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        modChecks[i]
                          ? "bg-primary border-primary"
                          : "border-border/40 group-hover:border-border/60"
                      }`}
                    >
                      {modChecks[i] && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                    <span className="text-sm text-on-surface">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Valuation + Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Valuation Result */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Real-Time Valuation</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Estimated Market Value</p>
              <p className="text-4xl font-black tracking-tight font-mono">$34,850.00</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +2.4% this month
                </span>
                <span className="text-sm text-slate-400">Base: <span className="font-mono font-bold">$31,200</span></span>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm flex flex-col items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--surface-container-high))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray={`${92 * 2.64} ${264 - 92 * 2.64}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-on-surface">92%</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-3">Confidence Score</p>
            </div>
          </div>

          {/* Depreciation Curve + Market Narrative */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Depreciation Curve</h3>
                <span className="text-[10px] text-muted-foreground">Projected 36 Months</span>
              </div>
              <div className="flex items-end gap-3 h-36">
                {[
                  { label: "Current", h1: 90, h2: 70 },
                  { label: "+12m", h1: 75, h2: 60 },
                  { label: "+24m", h1: 60, h2: 50 },
                  { label: "+36m", h1: 50, h2: 40 },
                ].map(bar => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1">
                      <div className="flex-1 bg-primary rounded-t transition-all duration-500" style={{ height: `${bar.h1}%` }} />
                      <div className="flex-1 bg-primary/30 rounded-t transition-all duration-500" style={{ height: `${bar.h2}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Shield className="w-4 h-4 text-primary" /></div>
                <h3 className="text-sm font-bold text-on-surface">Market Narrative</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The current valuation for your vehicle is <span className="font-bold text-on-surface">trending upward</span> primarily due to a supply shortage in the regional secondary market.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">Maintenance Premium</p>
                    <p className="text-xs text-muted-foreground">Excellent condition adds a $2.4k premium over the current regional average.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">Upcoming Lifecycle Phase</p>
                    <p className="text-xs text-muted-foreground">Major model refresh expected in Q3 may impact demand for existing iterations.</p>
                  </div>
                </div>
              </div>
              <button className="mt-4 text-xs text-primary font-bold uppercase tracking-wider hover:underline">Read Full Analysis</button>
            </div>
          </div>
        </div>
      </div>

      {/* Valuation History */}
      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="flex items-center gap-2 p-4 lg:p-6 border-b border-border/20">
          <History className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Valuation History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                <th className="text-left py-3 px-6 font-bold">Date</th>
                <th className="text-left py-3 px-4 font-bold">Vehicle Entity</th>
                <th className="text-left py-3 px-4 font-bold">Condition</th>
                <th className="text-left py-3 px-4 font-bold">Valuation</th>
                <th className="text-left py-3 px-4 font-bold">Trend</th>
                <th className="text-left py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {valuationHistory.map((v, i) => (
                <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-muted-foreground">{v.date}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-bold text-on-surface">{v.vehicle}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">VIN: {v.vin}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      v.condition === "Excellent" ? "text-emerald-600 bg-emerald-50" : "text-primary bg-primary/10"
                    }`}>{v.condition}</span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-on-surface font-mono">{v.valuation}</td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${v.trendUp ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {v.trendUp ? "↑" : "—"} {v.trend}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${v.status === "Active" ? "text-emerald-600" : "text-muted-foreground"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${v.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                      {v.status.toUpperCase()}
                    </span>
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

export default Valuation;
