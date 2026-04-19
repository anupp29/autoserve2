import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, AlertTriangle, TrendingUp, Car, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

interface Vehicle { id: string; make: string; model: string; year: number; mileage: number; fuel_type: string | null; color: string | null; registration: string; }
interface Result {
  estimated_value: number;
  low_estimate: number;
  high_estimate: number;
  confidence: number;
  depreciation_pct_per_year: number;
  narrative: string;
  tips: string[];
}

const conditions = ["Fair", "Good", "Excellent", "Showroom"] as const;

const Valuation = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [condition, setCondition] = useState<typeof conditions[number]>("Good");
  const [overrideMileage, setOverrideMileage] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("vehicles").select("*").eq("owner_id", user?.id ?? "").then(({ data }) => {
      const vs = (data as Vehicle[]) ?? [];
      setVehicles(vs);
      if (vs.length > 0) setSelectedId(vs[0].id);
    });
  }, [user?.id]);

  const veh = vehicles.find((v) => v.id === selectedId);
  const mileage = overrideMileage ?? veh?.mileage ?? 0;

  const calculate = async () => {
    if (!veh) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          mode: "valuate",
          vehicle: { ...veh, mileage, condition },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result as Result);
    } catch (e: any) {
      toast.error(e.message ?? "Valuation failed");
    } finally {
      setBusy(false);
    }
  };

  // Project depreciation curve
  const yearsAhead = [0, 1, 2, 3];
  const curve = result ? yearsAhead.map((y) => Math.round(result.estimated_value * Math.pow(1 - result.depreciation_pct_per_year / 100, y))) : [];
  const maxBar = Math.max(...curve, 1);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Resale Value Predictor</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered Indian secondary-market valuation in real time.</p>
        </div>
        <button onClick={calculate} disabled={busy || !veh} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 self-start">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {busy ? "Calculating…" : result ? "Recalculate" : "Calculate"}
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border/30 rounded-xl">
          <Car className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Add a vehicle to get a valuation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Car className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Vehicle Parameters</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-2">Vehicle</label>
                <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setOverrideMileage(null); setResult(null); }} className="w-full bg-surface-container-low border border-border/30 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Odometer</label>
                  <span className="text-sm font-bold text-primary font-mono">{mileage.toLocaleString("en-IN")} km</span>
                </div>
                <input type="range" min={0} max={300000} step={1000} value={mileage} onChange={(e) => setOverrideMileage(Number(e.target.value))} className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary" />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-3">Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {conditions.map((c) => (
                    <button key={c} onClick={() => setCondition(c)} className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${condition === c ? "border-primary bg-primary/10 text-primary font-bold" : "border-border/30 text-on-surface hover:border-border/60"}`}>{c}</button>
                  ))}
                </div>
              </div>

              {veh && (
                <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t border-border/10">
                  <p>Reg: <span className="font-mono text-on-surface">{veh.registration}</span></p>
                  <p>Fuel: {veh.fuel_type ?? "—"}</p>
                  <p>Color: {veh.color ?? "—"}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {!result && !busy && (
              <div className="bg-card p-12 rounded-xl border border-border/20 shadow-sm text-center">
                <Shield className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Click <span className="font-bold text-on-surface">Calculate</span> to get an AI-powered Indian market valuation.</p>
              </div>
            )}

            {busy && (
              <div className="bg-card p-12 rounded-xl border border-border/20 shadow-sm flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Analyzing market data…</p>
              </div>
            )}

            {result && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">AI Valuation</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Estimated Market Value</p>
                    <p className="text-3xl sm:text-4xl font-black tracking-tight font-mono">{formatINR(result.estimated_value)}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                      <span className="text-slate-400">Range: <span className="font-mono text-white">{formatINR(result.low_estimate)} – {formatINR(result.high_estimate)}</span></span>
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray={`${result.confidence * 2.64} 264`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-on-surface">{result.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-3">Confidence</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">3-Year Depreciation Forecast</h3>
                    </div>
                    <div className="flex items-end gap-3 h-36">
                      {curve.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-mono text-muted-foreground">{(val / 100000).toFixed(1)}L</span>
                          <div className="w-full bg-primary rounded-t transition-all duration-700" style={{ height: `${(val / maxBar) * 100}%` }} />
                          <span className="text-[10px] text-muted-foreground font-medium">{i === 0 ? "Now" : `+${i}y`}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3">Annual depreciation: ~{result.depreciation_pct_per_year}%</p>
                  </div>

                  <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="w-4 h-4 text-primary" /></div>
                      <h3 className="text-sm font-bold text-on-surface">Market Narrative</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{result.narrative}</p>
                    <div className="space-y-2 pt-3 border-t border-border/10">
                      {result.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {i === 0 ? <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                          <p className="text-xs text-muted-foreground">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Valuation;
