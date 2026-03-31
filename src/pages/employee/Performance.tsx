import { TrendingUp, Clock, CheckCircle, Star } from "lucide-react";

const EmployeePerformance = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-on-surface tracking-tight">My Performance</h1>
      <p className="text-sm text-muted-foreground mt-1">Track your efficiency metrics, completed jobs, and shift performance.</p>
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Jobs This Week", value: "24", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", sub: "+4 vs last week" },
        { label: "Avg. Job Time", value: "1.8h", icon: Clock, color: "text-primary", bg: "bg-primary/10", sub: "12% faster" },
        { label: "Efficiency Score", value: "92%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", sub: "Above target" },
        { label: "Customer Rating", value: "4.9", icon: Star, color: "text-amber-500", bg: "bg-amber-50", sub: "32 reviews" },
      ].map(k => (
        <div key={k.label} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-lg ${k.bg}`}><k.icon className={`w-5 h-5 ${k.color}`} /></div>
          </div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{k.label}</p>
          <p className="text-2xl lg:text-3xl font-black text-on-surface mt-1">{k.value}</p>
          <p className="text-[10px] text-emerald-600 mt-1">{k.sub}</p>
        </div>
      ))}
    </div>

    {/* Weekly Breakdown */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border/20 shadow-sm">
        <h3 className="font-bold text-on-surface mb-6">Weekly Job Completion</h3>
        <div className="flex items-end gap-3 h-48">
          {[
            { day: "MON", jobs: 5, h: 50 },
            { day: "TUE", jobs: 4, h: 40 },
            { day: "WED", jobs: 6, h: 60 },
            { day: "THU", jobs: 3, h: 30 },
            { day: "FRI", jobs: 4, h: 40 },
            { day: "SAT", jobs: 2, h: 20, highlight: true },
          ].map(bar => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-on-surface">{bar.jobs}</span>
              <div
                className={`w-full rounded-t-md ${bar.highlight ? "bg-primary" : "bg-primary/20"}`}
                style={{ height: `${bar.h}%` }}
              />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl">
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-4">Shift Summary</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Target Efficiency</span><span className="font-bold text-emerald-400">92%</span></div>
            <div className="h-1.5 bg-white/10 rounded-full"><div className="h-full w-[92%] bg-emerald-400 rounded-full" /></div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Customer Satisfaction</span><span className="font-bold text-primary">98%</span></div>
            <div className="h-1.5 bg-white/10 rounded-full"><div className="h-full w-[98%] bg-primary rounded-full" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <p className="text-lg font-black">38.5h</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Billable</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <p className="text-lg font-black">$4,620</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Recent Completed */}
    <div className="bg-card rounded-xl border border-border/20 shadow-sm">
      <div className="p-4 lg:p-6 border-b border-border/20">
        <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Recently Completed Jobs</h3>
      </div>
      <div className="divide-y divide-border/10">
        {[
          { id: "#AS-94019", vehicle: "Porsche Taycan 4S", service: "Tire Rotation & Balance", time: "45 min", rating: "⭐ 5.0" },
          { id: "#AS-94017", vehicle: "Tesla Model Y", service: "Full System Diagnostic", time: "1h 20min", rating: "⭐ 4.8" },
          { id: "#AS-94015", vehicle: "BMW 330i", service: "Oil Change & Filter", time: "35 min", rating: "⭐ 5.0" },
        ].map(j => (
          <div key={j.id} className="flex items-center justify-between p-4 lg:px-6 hover:bg-surface-container-low/50 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono font-bold text-on-surface">{j.id}</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">{j.vehicle}</p>
                <p className="text-xs text-muted-foreground">{j.service}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">{j.time}</span>
              <span className="text-xs font-bold">{j.rating}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Done</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default EmployeePerformance;
