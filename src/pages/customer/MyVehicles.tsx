import { useState, useEffect } from "react";
import { Plus, Car, Pencil, Trash2, X, Loader2, Lightbulb, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BrandLogo from "@/components/BrandLogo";

interface Vehicle {
  id: string; make: string; model: string; year: number; registration: string;
  mileage: number; color: string | null; fuel_type: string | null;
}

interface Recommendation {
  service_name: string;
  reason: string;
  urgency: "low" | "medium" | "high";
  estimated_savings_or_benefit: string;
}

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const POPULAR_MAKES = ["Maruti Suzuki", "Tata", "Mahindra", "Hyundai", "Honda", "Toyota", "Kia", "MG", "Renault", "Volkswagen", "Skoda", "BMW", "Mercedes-Benz", "Audi"];

const empty = { make: "Maruti Suzuki", model: "", year: new Date().getFullYear(), registration: "", color: "", fuel_type: "Petrol", mileage: 0 };

const urgencyColor = (u: string) =>
  u === "high" ? "text-destructive bg-destructive/10" : u === "medium" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";

const CustomerVehicles = () => {
  const { user } = useAuth();
  const { data: vehicles, loading } = useLiveTable<Vehicle>(
    "vehicles",
    (q) => q.eq("owner_id", user?.id ?? "").order("created_at", { ascending: false }),
    [user?.id],
    { enabled: !!user }
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const [tips, setTips] = useState<Recommendation[] | null>(null);
  const [tipsBusy, setTipsBusy] = useState(false);

  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({ make: v.make, model: v.model, year: v.year, registration: v.registration, color: v.color ?? "", fuel_type: v.fuel_type ?? "Petrol", mileage: v.mileage });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const payload = { ...form, owner_id: user.id };
    const res = editing
      ? await supabase.from("vehicles").update(payload).eq("id", editing.id)
      : await supabase.from("vehicles").insert(payload);
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editing ? "Vehicle updated" : "Vehicle added");
    setOpen(false);
  };

  const remove = async (v: Vehicle) => {
    if (!confirm(`Remove ${v.make} ${v.model}? This will also remove related bookings and history.`)) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", v.id);
    if (error) toast.error(error.message); else toast.success("Vehicle removed");
  };

  // Auto-fetch AI maintenance tips once we have at least one vehicle.
  useEffect(() => {
    if (!user || vehicles.length === 0 || tips !== null || tipsBusy) return;
    let cancelled = false;
    const fetchTips = async () => {
      setTipsBusy(true);
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { mode: "recommend" },
      });
      if (cancelled) return;
      setTipsBusy(false);
      if (error || data?.error || !Array.isArray(data?.result)) {
        // Silently fail — this is a delight feature, not critical.
        setTips([]);
        return;
      }
      setTips(data.result as Recommendation[]);
    };
    fetchTips();
    return () => { cancelled = true; };
  }, [user, vehicles.length, tips, tipsBusy]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">My Vehicles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your garage and registered vehicles.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all self-start">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border/30 rounded-xl">
          <Car className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-bold text-on-surface">No vehicles yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Add your first vehicle to start booking services.</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-card rounded-xl border border-border/20 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <BrandLogo make={v.make} size={44} className="group-hover:scale-105 transition-transform" />
                    <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-emerald-50 text-emerald-600">Active</span>
                  </div>
                  <h3 className="font-bold text-on-surface">{v.year} {v.make} {v.model}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{v.color || "—"} • {v.fuel_type}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded">{v.registration}</span>
                    <span className="text-xs font-mono text-muted-foreground">{v.mileage.toLocaleString("en-IN")} km</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(v)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border/30 rounded-lg text-xs font-bold hover:bg-surface-container active:scale-[0.98] transition-all">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => remove(v)} className="px-3 py-2 border border-destructive/30 rounded-lg text-destructive hover:bg-destructive/5 active:scale-[0.98] transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI-powered Maintenance Tips */}
          <div className="bg-card rounded-xl border border-border/20 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4 border-b border-border/20 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/15 rounded-lg"><Sparkles className="w-4 h-4 text-primary" /></div>
                <div>
                  <h3 className="font-bold text-on-surface text-sm">AI Maintenance Tips</h3>
                  <p className="text-[11px] text-muted-foreground">Personalised for your fleet & service history</p>
                </div>
              </div>
              <Link to="/customer/book" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Book any service <Calendar className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5">
              {tipsBusy && (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analysing your fleet…
                </div>
              )}
              {!tipsBusy && tips && tips.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  No specific tips right now — your maintenance is on track!
                </div>
              )}
              {!tipsBusy && tips && tips.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {tips.map((t, i) => (
                    <div key={i} className="p-4 bg-surface-container-low rounded-lg border border-border/10">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-bold text-sm text-on-surface">{t.service_name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap ${urgencyColor(t.urgency)}`}>
                          {t.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{t.reason}</p>
                      <p className="text-[11px] text-emerald-700 italic mb-3">{t.estimated_savings_or_benefit}</p>
                      <Link to="/customer/book" className="block w-full py-1.5 text-center text-xs font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                        Book this service
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-on-surface">{editing ? "Edit Vehicle" : "Add New Vehicle"}</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-surface-container rounded"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">Make</label>
                  <select value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className="w-full bg-surface-container-low border border-border/30 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    {POPULAR_MAKES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">Model</label>
                  <input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Swift VXi" className="w-full bg-surface-container-low border border-border/30 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">Year</label>
                  <input required type="number" min={1990} max={2030} value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })} className="w-full bg-surface-container-low border border-border/30 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">Mileage (km)</label>
                  <input required type="number" min={0} value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) || 0 })} className="w-full bg-surface-container-low border border-border/30 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">Registration</label>
                <input required value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value.toUpperCase() })} placeholder="HR 26 BX 1234" className="w-full bg-surface-container-low border border-border/30 rounded-lg py-2 px-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">Color</label>
                  <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Pearl White" className="w-full bg-surface-container-low border border-border/30 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">Fuel</label>
                  <select value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} className="w-full bg-surface-container-low border border-border/30 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 border border-border/30 rounded-lg text-sm font-bold hover:bg-surface-container active:scale-[0.98] transition-all">Cancel</button>
                <button type="submit" disabled={busy} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? "Save changes" : "Add vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerVehicles;
