import { useState } from "react";
import { CheckCircle, Settings, Wrench, Zap, CircleDot, Car, ShieldCheck, Calendar, Clock } from "lucide-react";

const steps = ["Service", "Schedule", "Confirm"] as const;
const services = [
  { name: "Synthetic Oil Change", desc: "Full synthetic oil replacement with 21-point inspection.", price: "₹2,499", time: "45 mins", icon: Settings },
  { name: "Tyre Rotation & Balancing", desc: "Extend tyre life and ensure a smooth ride with professional balancing.", price: "₹1,499", time: "30 mins", icon: CircleDot },
  { name: "Brake Fluid Flush", desc: "Complete brake fluid replacement to ensure braking safety.", price: "₹3,299", time: "60 mins", icon: Wrench },
  { name: "General Diagnostics", desc: "Comprehensive engine scan and manual inspection for any issues.", price: "₹3,999", time: "90 mins", icon: Zap },
  { name: "AC Service & Gas Refill", desc: "Complete AC system check with refrigerant top-up.", price: "₹2,199", time: "60 mins", icon: ShieldCheck },
  { name: "Full Body Detailing", desc: "Interior and exterior deep cleaning with ceramic coat.", price: "₹5,999", time: "3 hours", icon: Car },
];

const timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

const BookService = () => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set([0]));
  const [selectedDate, setSelectedDate] = useState("2024-10-28");
  const [selectedTime, setSelectedTime] = useState("09:00 AM");
  const [booked, setBooked] = useState(false);

  const toggleService = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) { if (next.size > 1) next.delete(i); }
      else next.add(i);
      return next;
    });
  };

  const totalPrice = Array.from(selected).reduce((sum, i) => {
    const num = parseInt(services[i].price.replace(/[₹,]/g, ""));
    return sum + num;
  }, 0);

  const handleConfirm = () => {
    setBooked(true);
    setTimeout(() => { setBooked(false); setStep(0); setSelected(new Set([0])); }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Book Service</h1>
        <p className="text-sm text-muted-foreground mt-1">Schedule your next maintenance. Select one or more services below.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-surface-container text-muted-foreground"}`}>{i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}</div>
            <span className={`text-xs font-bold uppercase tracking-wider ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
            {i < 2 && <div className={`w-8 sm:w-16 h-px mx-2 transition-colors ${i < step ? "bg-primary" : "bg-border/50"}`} />}
          </div>
        ))}
      </div>

      {/* Success Toast */}
      {booked && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">Booking Confirmed!</p>
            <p className="text-xs text-emerald-100">You'll receive a confirmation shortly.</p>
          </div>
        </div>
      )}

      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-on-surface">Choose Services</h3>
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((s, i) => (
                <button key={s.name} onClick={() => toggleService(i)} className={`text-left bg-card p-5 rounded-xl border-2 transition-all hover:shadow-md group ${selected.has(i) ? "border-primary shadow-md" : "border-border/20 hover:border-border/40"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg transition-colors ${selected.has(i) ? "bg-primary/10" : "bg-surface-container group-hover:bg-surface-container-high"}`}>
                      <s.icon className={`w-5 h-5 ${selected.has(i) ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    {selected.has(i) && <CheckCircle className="w-5 h-5 text-primary" />}
                  </div>
                  <h4 className="font-bold text-on-surface mb-1">{s.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-on-surface font-mono">{s.price}</span>
                    <span className="text-xs text-muted-foreground">{s.time}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 ml-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all">
              Next: Schedule →
            </button>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-4">
            <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Order Summary</h4>
              <div className="space-y-2 mb-4">
                {Array.from(selected).map(i => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{services[i].name}</span>
                    <span className="font-bold text-on-surface font-mono">{services[i].price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/20 pt-3 flex justify-between">
                <span className="text-sm font-bold text-on-surface">Total</span>
                <span className="text-lg font-black text-primary font-mono">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border/20 shadow-sm">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Vehicle</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Car className="w-5 h-5 text-primary" /></div>
                <div><p className="text-sm font-bold text-on-surface">2023 Maruti Suzuki Swift</p><p className="text-[10px] font-mono text-muted-foreground">VIN: MA3F...981</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Select Date</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full bg-surface-container-low border border-border/30 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Select Time Slot</h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${selectedTime === t ? "bg-primary text-primary-foreground shadow-lg" : "bg-surface-container-low border border-border/30 text-on-surface hover:border-primary/30"}`}
                  >
                    <Clock className="w-3.5 h-3.5" /> {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="px-6 py-3 border border-border/30 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container active:scale-[0.98] transition-all">← Back</button>
              <button onClick={() => setStep(2)} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 ml-auto shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">Next: Confirm →</button>
            </div>
          </div>
          <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm h-fit">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Selected Services</h4>
            <div className="space-y-2">
              {Array.from(selected).map(i => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-on-surface">{services[i].name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/20 flex justify-between">
              <span className="text-sm font-bold">Total</span>
              <span className="text-lg font-black text-primary font-mono">₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
            <h3 className="font-bold text-on-surface mb-4">Confirm Your Booking</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border/10">
                <span className="text-sm text-muted-foreground">Vehicle</span>
                <span className="text-sm font-semibold text-on-surface">2023 Maruti Suzuki Swift</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/10">
                <span className="text-sm text-muted-foreground">Date & Time</span>
                <span className="text-sm font-semibold text-on-surface">{selectedDate} • {selectedTime}</span>
              </div>
              <div className="py-2 border-b border-border/10">
                <span className="text-sm text-muted-foreground block mb-2">Services</span>
                <div className="space-y-1">
                  {Array.from(selected).map(i => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-on-surface">{services[i].name}</span>
                      <span className="font-mono font-bold">{services[i].price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-bold text-on-surface">Total Amount</span>
                <span className="text-xl font-black text-primary font-mono">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-3 border border-border/30 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container active:scale-[0.98] transition-all">← Back</button>
            <button onClick={handleConfirm} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">Confirm Booking</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookService;
