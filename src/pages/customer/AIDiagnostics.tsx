import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Zap, Loader2, AlertCircle, Lightbulb, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

interface Vehicle { id: string; make: string; model: string; year: number; mileage: number; fuel_type: string | null; }
interface Service { id: string; name: string; price: number; category: string; }
interface Fault { fault: string; detail: string; confidence: number; recommended_service: string; urgency: "low" | "medium" | "high"; }

const AIDiagnostics = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedVeh, setSelectedVeh] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [faults, setFaults] = useState<Fault[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("vehicles").select("*").eq("owner_id", user?.id ?? ""),
      supabase.from("services").select("id, name, price, category").eq("active", true),
    ]).then(([v, s]) => {
      const vs = (v.data as Vehicle[]) ?? [];
      setVehicles(vs);
      if (vs.length > 0) setSelectedVeh(vs[0].id);
      setServices((s.data as Service[]) ?? []);
    });
  }, [user?.id]);

  const analyze = async () => {
    if (!symptoms.trim() || !selectedVeh) { toast.error("Please describe symptoms and pick a vehicle"); return; }
    const veh = vehicles.find((v) => v.id === selectedVeh);
    setBusy(true);
    setFaults(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          mode: "diagnose",
          vehicle: veh,
          symptoms,
          services_catalog: services.map((s) => ({ name: s.name, price: s.price, category: s.category })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setFaults(data.result as Fault[]);
    } catch (e: any) {
      toast.error(e.message ?? "Diagnosis failed");
    } finally {
      setBusy(false);
    }
  };

  const findService = (name: string) => services.find((s) => s.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]));

  const urgencyColor = (u: string) => u === "high" ? "text-destructive bg-destructive/10" : u === "medium" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">AI Fault Diagnosis</h1>
        <p className="text-sm text-muted-foreground mt-1">Describe what your vehicle is doing — our AI ranks the most likely faults with one-click booking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-on-surface">Symptom Description</h3>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border/30 rounded-xl">
                <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Add a vehicle first to use AI diagnostics.</p>
                <Link to="/customer/vehicles" className="text-sm text-primary font-bold hover:underline">Add Vehicle →</Link>
              </div>
            ) : (
              <>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-2">Select Vehicle</label>
                <select value={selectedVeh} onChange={(e) => setSelectedVeh(e.target.value)} className="w-full bg-surface-container-low border border-border/30 rounded-lg px-4 py-2.5 text-sm mb-4 outline-none focus:ring-2 focus:ring-primary/20">
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} ({v.mileage.toLocaleString("en-IN")} km)</option>
                  ))}
                </select>

                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-2">Describe Symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. High-pitched squealing when braking at low speed, especially in cold mornings. Slight vibration through the pedal."
                  className="w-full h-32 bg-surface-container-low border border-border/30 rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button onClick={analyze} disabled={busy || !symptoms.trim()} className="mt-4 w-full sm:w-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {busy ? "Analyzing…" : "Analyze Symptoms"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Ranked Fault Suggestions</h4>
              {faults && <span className="text-[10px] font-bold text-emerald-600 border border-emerald-300 px-2 py-0.5 rounded">Live Result</span>}
            </div>

            {!faults && !busy && (
              <p className="text-sm text-muted-foreground text-center py-8">Submit symptoms to see ranked fault analysis.</p>
            )}
            {busy && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

            {faults && (
              <div className="space-y-3">
                {faults.map((f) => {
                  const matched = findService(f.recommended_service);
                  return (
                    <div key={f.fault} className="p-3 bg-surface-container-low rounded-lg border border-border/10">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-on-surface">{f.fault}</p>
                          <p className="text-xs text-muted-foreground">{f.detail}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-black text-primary">{f.confidence}%</p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-surface-container-high rounded-full mb-3">
                        <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${f.confidence}%` }} />
                      </div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${urgencyColor(f.urgency)}`}>{f.urgency}</span>
                        {matched && <span className="text-xs font-bold text-on-surface font-mono">{formatINR(matched.price)}</span>}
                      </div>
                      <Link
                        to="/customer/book"
                        state={{ preselectServiceName: f.recommended_service, preselectVehicleId: selectedVeh }}
                        className="w-full py-2 border border-border/30 rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container hover:border-primary/30 transition-all flex items-center justify-center"
                      >
                        Book: {f.recommended_service}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-border/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-tertiary" />
              <p className="text-xs font-bold text-on-surface">Pro-Tip</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Be specific: when does it happen, in what conditions, and any sounds or smells. Better symptoms = sharper diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnostics;
