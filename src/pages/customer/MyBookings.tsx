import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, MapPin, CheckCircle, Loader2, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, formatINR } from "@/lib/format";
import { toast } from "sonner";

interface Booking {
  id: string;
  customer_id: string;
  vehicle_id: string;
  service_id: string;
  scheduled_at: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  priority: "normal" | "express" | "priority";
  total_cost: number | null;
  notes: string | null;
}

interface Vehicle { id: string; make: string; model: string; registration: string; }
interface Service { id: string; name: string; duration_minutes: number; }

const tabs = ["All", "Upcoming", "In Progress", "Past", "Cancelled"] as const;
type Tab = typeof tabs[number];

const statusBadge = (s: Booking["status"]) => {
  switch (s) {
    case "completed": return { label: "Completed", cls: "text-emerald-600 bg-emerald-50" };
    case "in_progress": return { label: "In Progress", cls: "text-primary bg-primary/10" };
    case "confirmed": return { label: "Confirmed", cls: "text-on-surface bg-surface-container" };
    case "cancelled": return { label: "Cancelled", cls: "text-destructive bg-destructive/10" };
    default: return { label: "Pending", cls: "text-amber-600 bg-amber-50" };
  }
};

const stepsFor = (status: Booking["status"]) => {
  const all = [
    { name: "Confirmed", min: "confirmed" },
    { name: "Vehicle Check-in", min: "in_progress" },
    { name: "Service In Progress", min: "in_progress" },
    { name: "Quality Check", min: "completed" },
    { name: "Completed", min: "completed" },
  ];
  const order = ["pending", "confirmed", "in_progress", "completed", "cancelled"];
  const idx = order.indexOf(status);
  return all.map((s) => ({ ...s, done: order.indexOf(s.min) <= idx, active: order.indexOf(s.min) === idx }));
};

const CustomerBookings = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("All");
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [services, setServices] = useState<Record<string, Service>>({});

  const { data: bookings, loading } = useLiveTable<Booking>("bookings", (q) => q.eq("customer_id", user?.id ?? "").order("scheduled_at", { ascending: false }), [user?.id], { enabled: !!user });

  useEffect(() => {
    Promise.all([
      supabase.from("vehicles").select("id,make,model,registration").eq("owner_id", user?.id ?? ""),
      supabase.from("services").select("id,name,duration_minutes"),
    ]).then(([v, s]) => {
      const vmap: Record<string, Vehicle> = {}; (v.data ?? []).forEach((x: any) => vmap[x.id] = x); setVehicles(vmap);
      const smap: Record<string, Service> = {}; (s.data ?? []).forEach((x: any) => smap[x.id] = x); setServices(smap);
    });
  }, [user?.id]);

  const filtered = bookings.filter((b) => {
    if (tab === "All") return true;
    if (tab === "Upcoming") return ["pending", "confirmed"].includes(b.status);
    if (tab === "In Progress") return b.status === "in_progress";
    if (tab === "Past") return b.status === "completed";
    if (tab === "Cancelled") return b.status === "cancelled";
    return true;
  });

  const cancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Booking cancelled");
  };

  const counts = {
    upcoming: bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length,
    inprog: bookings.filter((b) => b.status === "in_progress").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">{counts.inprog} in progress, {counts.upcoming} upcoming.</p>
        </div>
        <Link to="/customer/book" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all self-start">
          <Plus className="w-4 h-4" /> Book New
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-on-surface"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border/30 rounded-xl">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-bold text-on-surface">No bookings in this view</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Schedule a service to get started.</p>
          <Link to="/customer/book" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold">
            <Plus className="w-4 h-4" /> Book Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const v = vehicles[b.vehicle_id];
            const s = services[b.service_id];
            const badge = statusBadge(b.status);
            const showProgress = b.status === "in_progress" || b.status === "confirmed";
            return (
              <div key={b.id} className={`bg-card p-5 rounded-xl border ${b.status === "in_progress" ? "border-2 border-primary/30" : "border-border/20"} shadow-sm hover:shadow-md transition-all`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${badge.cls}`}>
                    {b.status === "in_progress" && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                    {badge.label}
                  </span>
                  {b.priority !== "normal" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-50 text-amber-600">{b.priority}</span>
                  )}
                </div>
                <h4 className="font-bold text-on-surface mb-1">{s?.name ?? "Service"}</h4>
                <p className="text-xs font-mono text-muted-foreground mb-3">{v ? `${v.make} ${v.model} • ${v.registration}` : "Vehicle"}</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {formatDateTime(b.scheduled_at)}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> AutoServe Gurugram</div>
                </div>

                {showProgress && (
                  <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-border/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Live Progress</span>
                      <span className="text-[10px] font-bold text-primary">
                        {b.status === "in_progress" ? "60%" : "20%"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: b.status === "in_progress" ? "60%" : "20%" }} />
                    </div>
                    <div className="space-y-1.5">
                      {stepsFor(b.status).map((step) => (
                        <div key={step.name} className="flex items-center gap-2">
                          {step.done && !step.active ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : step.active ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-border/40 shrink-0" />
                          )}
                          <span className={`text-xs ${step.done && !step.active ? "text-muted-foreground" : step.active ? "text-on-surface font-medium" : "text-muted-foreground"}`}>
                            {step.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-black font-mono text-on-surface">{formatINR(b.total_cost)}</span>
                  {["pending", "confirmed"].includes(b.status) && (
                    <button onClick={() => cancel(b.id)} className="px-3 py-1.5 text-xs font-bold text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5 active:scale-[0.98] transition-all">Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
