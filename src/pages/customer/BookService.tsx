import { useState } from "react";
import { CheckCircle } from "lucide-react";

const steps = ["Service", "Schedule", "Confirm"] as const;
const services = [
  { name: "Synthetic Oil Change", desc: "Full synthetic oil replacement with 21-point inspection.", price: "$89.99", time: "45 mins", icon: "⚙️" },
  { name: "Tire Rotation & Balance", desc: "Extend tire life and ensure a smooth ride with professional balancing.", price: "$59.00", time: "30 mins", icon: "🛞" },
  { name: "Brake Fluid Flush", desc: "Complete brake fluid replacement to ensure braking safety.", price: "$129.00", time: "60 mins", icon: "🔧" },
  { name: "General Diagnostics", desc: "Comprehensive engine scan and manual inspection for any issues.", price: "$149.00", time: "90 mins", icon: "🔌" },
];

const BookService = () => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Book Service</h1>
        <p className="text-sm text-muted-foreground mt-1">Schedule your next maintenance with precision. Follow the steps below to secure your slot.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground"}`}>{i + 1}</div>
            <span className={`text-xs font-bold uppercase tracking-wider ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
            {i < 2 && <div className="w-8 sm:w-16 h-px bg-border/50 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="font-bold text-on-surface mb-4">Choose a Service</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((s, i) => (
              <button key={s.name} onClick={() => setSelected(i)} className={`text-left bg-card p-5 rounded-xl border-2 transition-all ${selected === i ? "border-primary shadow-md" : "border-border/20 hover:border-border/40"}`}>
                {selected === i && <CheckCircle className="w-5 h-5 text-primary mb-2" />}
                <span className="text-2xl block mb-2">{s.icon}</span>
                <h4 className="font-bold text-on-surface mb-1">{s.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-on-surface font-mono">{s.price}</span>
                  <span className="text-xs text-muted-foreground">{s.time}</span>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(Math.min(step + 1, 2))} className="mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 ml-auto">
            Next: Schedule →
          </button>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-3"><span className="text-primary">✨</span><h4 className="font-bold text-sm">AI Suggested Upsells</h4></div>
            <p className="text-xs text-slate-400 mb-4">Based on your vehicle history (2021 BMW X5) and the selected Oil Change:</p>
            {[
              { name: "Engine Air Filter", price: "+$35.00", desc: "Your last filter change was 14,000 miles ago." },
              { name: "Wiper Blade Set", price: "+$42.00", desc: "Service history indicates original blades." },
            ].map(u => (
              <div key={u.name} className="bg-white/5 border border-white/10 rounded-lg p-3 mb-2">
                <div className="flex justify-between"><span className="text-sm font-bold">{u.name}</span><span className="text-sm text-primary font-bold">{u.price}</span></div>
                <p className="text-xs text-slate-400 mt-1">{u.desc}</p>
                <button className="w-full mt-2 py-1.5 bg-white/10 border border-white/20 rounded text-xs font-bold hover:bg-white/20 transition-colors">Add to Service</button>
              </div>
            ))}
            <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
              <span className="text-sm text-slate-400">Total Selection:</span>
              <span className="text-lg font-black font-mono">{services[selected].price}</span>
            </div>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border/20 shadow-sm">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Service Details</h4>
            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-lg">🚗</div><div><p className="text-sm font-bold text-on-surface">2021 BMW X5</p><p className="text-[10px] font-mono text-muted-foreground">VIN: ...X9420</p></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;
