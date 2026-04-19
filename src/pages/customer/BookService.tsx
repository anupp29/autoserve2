import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Car, Clock, Loader2, AlertCircle, Wrench, X, Calendar as CalIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

interface Service { id: string; name: string; description: string | null; category: string; price: number; duration_minutes: number; }
interface Vehicle { id: string; make: string; model: string; year: number; registration: string; }

const steps = ["Service", "Vehicle", "Schedule", "Confirm"] as const;
const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

const todayPlus = (days: number) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const BookService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [date, setDate] = useState(todayPlus(2));
  const [time, setTime] = useState("10:00");
  const [priority, setPriority] = useState<"normal" | "express" | "priority">("normal");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{ id: string; ref: string } | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("services").select("*").eq("active", true).order("category"),
      supabase.from("vehicles").select("*").eq("owner_id", user?.id ?? "").order("created_at", { ascending: false }),
    ]).then(([s, v]) => {
      setServices((s.data as Service[]) ?? []);
      setVehicles((v.data as Vehicle[]) ?? []);
      if (v.data && v.data.length > 0) setSelectedVehicle(v.data[0].id);
      setLoading(false);
    });
  }, [user?.id]);

  const svc = services.find((s) => s.id === selectedService);
  const veh = vehicles.find((v) => v.id === selectedVehicle);

  const submit = async () => {
    if (!user || !selectedService || !selectedVehicle) return;
    setBusy(true);
    const scheduled_at = new Date(`${date}T${time}:00`).toISOString();
    const { data, error } = await supabase.from("bookings").insert({
      customer_id: user.id,
      vehicle_id: selectedVehicle,
      service_id: selectedService,
      scheduled_at,
      status: "pending",
      priority,
      notes: notes || null,
      total_cost: svc?.price ?? null,
    }).select("id").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking confirmed!");
    setConfirmedBooking({ id: data.id, ref: data.id.slice(0, 8).toUpperCase() });
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-border/30 rounded-xl max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-bold text-on-surface">Add a vehicle first</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">You need to register a vehicle before booking a service.</p>
        <button onClick={() => navigate("/customer/vehicles")} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold">Add Vehicle</button>
      </div>
    );
  }

  return (
    <>
    {/* Booking Confirmation Modal with QR */}
    {confirmedBooking && svc && veh && (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-card max-w-md w-full rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white text-center relative">
            <button onClick={() => navigate("/customer/bookings")} className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Booking Confirmed!</h3>
            <p className="text-sm text-emerald-50 mt-1">Reference: <span className="font-mono font-bold">#{confirmedBooking.ref}</span></p>
          </div>
          <div className="p-6 text-center space-y-4">
            <div className="bg-surface-container-low p-4 rounded-xl border border-border/20 inline-block">
              <QRCodeSVG
                value={JSON.stringify({
                  booking_id: confirmedBooking.id,
                  ref: confirmedBooking.ref,
                  customer: user?.email,
                  vehicle: `${veh.year} ${veh.make} ${veh.model}`,
                  registration: veh.registration,
                  service: svc.name,
                  scheduled: `${date} ${time}`,
                  amount: svc.price,
                })}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Show this QR at the AutoServe counter</p>
              <p className="text-sm text-on-surface font-semibold mt-1">{svc.name} · {formatINR(svc.price)}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                <CalIcon className="w-3 h-3" /> {date} at {time}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setConfirmedBooking(null); setStep(0); setSelectedService(null); setNotes(""); }} className="flex-1 px-4 py-2.5 border border-border/30 rounded-lg text-sm font-bold hover:bg-surface-container transition-colors">Book Another</button>
              <button onClick={() => navigate("/customer/bookings")} className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">View Bookings</button>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Book Service</h1>
        <p className="text-sm text-muted-foreground mt-1">Schedule your next visit in a few simple steps.</p>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-surface-container text-muted-foreground"}`}>
              {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className={`w-8 sm:w-12 h-px transition-colors ${i < step ? "bg-primary" : "bg-border/50"}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <button key={s.id} onClick={() => { setSelectedService(s.id); setStep(1); }} className={`text-left bg-card p-5 rounded-xl border-2 transition-all hover:shadow-md ${selectedService === s.id ? "border-primary shadow-md" : "border-border/20 hover:border-border/40"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${selectedService === s.id ? "bg-primary/10" : "bg-surface-container"}`}><Wrench className={`w-5 h-5 ${selectedService === s.id ? "text-primary" : "text-muted-foreground"}`} /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.category}</span>
              </div>
              <h4 className="font-bold text-on-surface mb-1">{s.name}</h4>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-on-surface font-mono">{formatINR(s.price)}</span>
                <span className="text-xs text-muted-foreground">{s.duration_minutes} min</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="font-bold text-on-surface">Choose Vehicle</h3>
          {vehicles.map((v) => (
            <button key={v.id} onClick={() => { setSelectedVehicle(v.id); setStep(2); }} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selectedVehicle === v.id ? "border-primary bg-primary/5" : "border-border/20 bg-card hover:border-border/40"}`}>
              <div className="p-2 bg-primary/10 rounded-lg"><Car className="w-5 h-5 text-primary" /></div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">{v.year} {v.make} {v.model}</p>
                <p className="text-xs text-muted-foreground font-mono">{v.registration}</p>
              </div>
              {selectedVehicle === v.id && <CheckCircle className="w-5 h-5 text-primary" />}
            </button>
          ))}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setStep(0)} className="px-6 py-3 border border-border/30 rounded-lg text-sm font-bold hover:bg-surface-container active:scale-[0.98] transition-all">← Back</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Select Date</h3>
              <input type="date" min={todayPlus(0)} value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-surface-container-low border border-border/30 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Select Time Slot</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((t) => (
                  <button key={t} onClick={() => setTime(t)} className={`py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${time === t ? "bg-primary text-primary-foreground shadow-lg" : "bg-surface-container-low border border-border/30 text-on-surface hover:border-primary/30"}`}>
                    <Clock className="w-3.5 h-3.5" /> {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Priority</h3>
              <div className="grid grid-cols-3 gap-3">
                {(["normal", "express", "priority"] as const).map((p) => (
                  <button key={p} onClick={() => setPriority(p)} className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${priority === p ? "bg-primary text-primary-foreground" : "bg-surface-container-low border border-border/30 text-on-surface"}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Notes (optional)</h3>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific concerns or requests…" className="w-full bg-surface-container-low border border-border/30 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 border border-border/30 rounded-lg text-sm font-bold hover:bg-surface-container active:scale-[0.98] transition-all">← Back</button>
              <button onClick={() => setStep(3)} className="ml-auto bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">Next: Confirm →</button>
            </div>
          </div>
          <aside className="bg-card p-5 rounded-xl border border-border/20 shadow-sm h-fit space-y-4">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Summary</h4>
            <div className="space-y-3 text-sm">
              <div><p className="text-muted-foreground text-xs">Service</p><p className="font-bold text-on-surface">{svc?.name}</p></div>
              <div><p className="text-muted-foreground text-xs">Vehicle</p><p className="font-bold text-on-surface">{veh ? `${veh.year} ${veh.make} ${veh.model}` : "—"}</p></div>
              <div className="border-t border-border/10 pt-3 flex justify-between"><span className="font-bold">Total</span><span className="text-lg font-black text-primary font-mono">{formatINR(svc?.price)}</span></div>
            </div>
          </aside>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
            <h3 className="font-bold text-on-surface mb-4">Confirm Booking</h3>
            <dl className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/10"><dt className="text-sm text-muted-foreground">Service</dt><dd className="text-sm font-semibold text-on-surface">{svc?.name}</dd></div>
              <div className="flex justify-between py-2 border-b border-border/10"><dt className="text-sm text-muted-foreground">Vehicle</dt><dd className="text-sm font-semibold text-on-surface">{veh?.year} {veh?.make} {veh?.model}</dd></div>
              <div className="flex justify-between py-2 border-b border-border/10"><dt className="text-sm text-muted-foreground">Registration</dt><dd className="text-sm font-mono font-semibold">{veh?.registration}</dd></div>
              <div className="flex justify-between py-2 border-b border-border/10"><dt className="text-sm text-muted-foreground">Date & Time</dt><dd className="text-sm font-semibold">{date} • {time}</dd></div>
              <div className="flex justify-between py-2 border-b border-border/10"><dt className="text-sm text-muted-foreground">Priority</dt><dd className="text-sm font-semibold capitalize">{priority}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm font-bold">Total Amount</dt><dd className="text-xl font-black text-primary font-mono">{formatINR(svc?.price)}</dd></div>
            </dl>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} disabled={busy} className="px-6 py-3 border border-border/30 rounded-lg text-sm font-bold hover:bg-surface-container active:scale-[0.98] transition-all">← Back</button>
            <button onClick={submit} disabled={busy} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookService;
