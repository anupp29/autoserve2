import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, MapPin, CheckCircle, Loader2, X, AlertCircle, ScanLine, KeyRound, PackageOpen } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/hooks/useAuth";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, formatINR } from "@/lib/format";
import { toast } from "sonner";
import BrandLogo from "@/components/BrandLogo";
import { issueHandoverToken, type HandoverKind } from "@/lib/handover";

interface Booking {
  id: string;
  customer_id: string;
  vehicle_id: string;
  service_id: string;
  scheduled_at: string;
  status: "pending" | "confirmed" | "in_progress" | "ready_for_pickup" | "completed" | "cancelled";
  priority: "normal" | "express" | "priority";
  total_cost: number | null;
  notes: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  ready_for_pickup: boolean;
}

interface Vehicle { id: string; make: string; model: string; year: number; registration: string; }
interface Service { id: string; name: string; duration_minutes: number; }

const tabs = ["All", "Upcoming", "In Progress", "Ready for Pickup", "Past", "Cancelled"] as const;
type Tab = typeof tabs[number];

const statusBadge = (s: Booking["status"]) => {
  switch (s) {
    case "completed": return { label: "Completed", cls: "text-emerald-600 bg-emerald-50" };
    case "ready_for_pickup": return { label: "Ready for Pickup", cls: "text-emerald-700 bg-emerald-100" };
    case "in_progress": return { label: "In Progress", cls: "text-primary bg-primary/10" };
    case "confirmed": return { label: "Confirmed", cls: "text-on-surface bg-surface-container" };
    case "cancelled": return { label: "Cancelled", cls: "text-destructive bg-destructive/10" };
    default: return { label: "Pending", cls: "text-amber-600 bg-amber-50" };
  }
};

const lifecycleSteps = (b: Booking) => {
  const steps = [
    { name: "Booking Confirmed", done: ["confirmed", "in_progress", "ready_for_pickup", "completed"].includes(b.status) },
    { name: "Vehicle Checked In", done: !!b.checked_in_at || ["in_progress", "ready_for_pickup", "completed"].includes(b.status) },
    { name: "Service In Progress", done: ["in_progress", "ready_for_pickup", "completed"].includes(b.status) },
    { name: "Ready for Pickup", done: ["ready_for_pickup", "completed"].includes(b.status) || b.ready_for_pickup },
    { name: "Vehicle Released", done: !!b.checked_out_at || b.status === "completed" },
  ];
  const lastDone = steps.findIndex((s) => !s.done) - 1;
  return steps.map((s, i) => ({ ...s, active: i === Math.max(lastDone + 1, 0) && !s.done }));
};

const progressPct = (b: Booking) => {
  if (b.status === "completed") return 100;
  if (b.status === "ready_for_pickup" || b.ready_for_pickup) return 85;
  if (b.status === "in_progress") return 60;
  if (b.checked_in_at) return 40;
  if (b.status === "confirmed") return 20;
  return 5;
};

const CustomerBookings = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("All");
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [services, setServices] = useState<Record<string, Service>>({});
  const [qrModal, setQrModal] = useState<{ booking: Booking; kind: HandoverKind; payload: string; token: string } | null>(null);
  const [issuing, setIssuing] = useState<string | null>(null);

  const { data: bookings, loading } = useLiveTable<Booking>("bookings", (q) => q.eq("customer_id", user?.id ?? "").order("scheduled_at", { ascending: false }), [user?.id], { enabled: !!user });

  useEffect(() => {
    Promise.all([
      supabase.from("vehicles").select("id,make,model,year,registration").eq("owner_id", user?.id ?? ""),
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
    if (tab === "Ready for Pickup") return b.status === "ready_for_pickup" || b.ready_for_pickup;
    if (tab === "Past") return b.status === "completed";
    if (tab === "Cancelled") return b.status === "cancelled";
    return true;
  });

  const cancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Booking cancelled");
  };

  const showQR = async (b: Booking, kind: HandoverKind) => {
    if (!user) return;
    setIssuing(b.id + kind);
    const tok = await issueHandoverToken(b.id, user.id, kind);
    setIssuing(null);
    if (tok.error) { toast.error(tok.error); return; }
    setQrModal({ booking: b, kind, payload: tok.payload, token: tok.token });
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const counts = {
    upcoming: bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length,
    inprog: bookings.filter((b) => b.status === "in_progress").length,
    ready: bookings.filter((b) => b.status === "ready_for_pickup" || b.ready_for_pickup).length,
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">My Bookings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {counts.ready > 0 && <span className="text-emerald-600 font-bold">{counts.ready} ready for pickup • </span>}
              {counts.inprog} in progress, {counts.upcoming} upcoming.
            </p>
          </div>
          <Link to="/customer/book" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all self-start">
            <Plus className="w-4 h-4" /> Book New
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
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
              const showProgress = ["confirmed", "in_progress", "ready_for_pickup"].includes(b.status) || b.ready_for_pickup;
              const isReady = b.status === "ready_for_pickup" || b.ready_for_pickup;
              const showCheckIn = ["pending", "confirmed"].includes(b.status) && !b.checked_in_at;
              const pct = progressPct(b);

              return (
                <div key={b.id} className={`bg-card p-5 rounded-xl border ${isReady ? "border-2 border-emerald-400 shadow-emerald-100" : b.status === "in_progress" ? "border-2 border-primary/30" : "border-border/20"} shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${badge.cls}`}>
                      {b.status === "in_progress" && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                      {isReady && <CheckCircle className="w-2.5 h-2.5" />}
                      {badge.label}
                    </span>
                    {b.priority !== "normal" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-50 text-amber-600">{b.priority}</span>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    {v && <BrandLogo make={v.make} size={36} />}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-on-surface truncate">{s?.name ?? "Service"}</h4>
                      <p className="text-xs font-mono text-muted-foreground truncate">{v ? `${v.make} ${v.model} • ${v.registration}` : "Vehicle"}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {formatDateTime(b.scheduled_at)}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> AutoServe Gurugram</div>
                  </div>

                  {showProgress && (
                    <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-border/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Live Progress</span>
                        <span className="text-[10px] font-bold text-primary">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full transition-all duration-700 ${isReady ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="space-y-1.5">
                        {lifecycleSteps(b).map((step) => (
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

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-sm font-black font-mono text-on-surface">{formatINR(b.total_cost)}</span>
                    <div className="flex gap-2">
                      {isReady && (
                        <button onClick={() => showQR(b, "check_out")} disabled={issuing === b.id + "check_out"} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-md shadow-emerald-200">
                          {issuing === b.id + "check_out" ? <Loader2 className="w-3 h-3 animate-spin" /> : <PackageOpen className="w-3 h-3" />} Collect QR
                        </button>
                      )}
                      {showCheckIn && (
                        <button onClick={() => showQR(b, "check_in")} disabled={issuing === b.id + "check_in"} className="px-3 py-1.5 text-xs font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center gap-1.5">
                          {issuing === b.id + "check_in" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScanLine className="w-3 h-3" />} Check-in QR
                        </button>
                      )}
                      {["pending", "confirmed"].includes(b.status) && (
                        <button onClick={() => cancel(b.id)} className="px-3 py-1.5 text-xs font-bold text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5 active:scale-[0.98] transition-all">Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {qrModal && (() => {
        const v = vehicles[qrModal.booking.vehicle_id];
        const s = services[qrModal.booking.service_id];
        const isCheckIn = qrModal.kind === "check_in";
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setQrModal(null)}>
            <div className="bg-card max-w-md w-full rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className={`p-6 text-white text-center relative ${isCheckIn ? "bg-gradient-to-br from-primary to-primary/80" : "bg-gradient-to-br from-emerald-500 to-emerald-600"}`}>
                <button onClick={() => setQrModal(null)} className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                  {isCheckIn ? <ScanLine className="w-8 h-8" /> : <PackageOpen className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold">{isCheckIn ? "Vehicle Check-In QR" : "Vehicle Collection QR"}</h3>
                <p className="text-sm text-white/80 mt-1">
                  {isCheckIn ? "Show this at the counter to drop off your vehicle" : "Show this at the counter to collect your vehicle"}
                </p>
              </div>
              <div className="p-6 text-center space-y-4">
                <div className="bg-white p-4 rounded-xl border-2 border-border/30 inline-block shadow-md">
                  <QRCodeSVG value={qrModal.payload} size={220} level="M" includeMargin={false} />
                </div>
                <div className="text-[10px] font-mono text-muted-foreground tracking-wider break-all px-4 flex items-center justify-center gap-1.5">
                  <KeyRound className="w-3 h-3" /> {qrModal.token}
                </div>
                <div className="border-t border-border/10 pt-4 text-left bg-surface-container-low rounded-lg p-3">
                  <p className="text-xs font-bold text-on-surface flex items-center gap-2">
                    {v && <BrandLogo make={v.make} size={20} />}
                    {v ? `${v.year} ${v.make} ${v.model}` : "Vehicle"}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">{v?.registration}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">{s?.name} · {formatINR(qrModal.booking.total_cost)}</p>
                </div>
                <button onClick={() => setQrModal(null)} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-bold active:scale-[0.98] transition-all">
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default CustomerBookings;
