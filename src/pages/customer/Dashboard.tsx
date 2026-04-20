import { Link } from "react-router-dom";
import { Car, Calendar, MapPin, Wrench, ArrowRight, Plus, Activity, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { formatINR, formatDateTime, formatDate } from "@/lib/format";
import VehicleBrandLogo from "@/components/VehicleBrandLogo";

interface Vehicle { id: string; make: string; model: string; year: number; registration: string; mileage: number; color: string | null; fuel_type: string | null; }
interface Booking { id: string; scheduled_at: string; status: string; priority: string; total_cost: number | null; vehicle_id: string; service_id: string; }
interface History { id: string; service_date: string; cost: number; vehicle_id: string; service_id: string; notes: string | null; }
interface Service { id: string; name: string; category: string; }

const statusBadge = (s: string) => {
  switch (s) {
    case "completed": return "text-emerald-600 bg-emerald-50";
    case "in_progress": return "text-primary bg-primary/10";
    case "confirmed": return "text-on-surface bg-surface-container";
    case "cancelled": return "text-destructive bg-destructive/10";
    default: return "text-amber-600 bg-amber-50";
  }
};

const CustomerDashboard = () => {
  const { user, profile } = useAuth();
  const [services, setServices] = useState<Record<string, Service>>({});

  const { data: vehicles } = useLiveTable<Vehicle>("vehicles", (q) => q.eq("owner_id", user?.id ?? "").order("created_at", { ascending: false }), [user?.id], { enabled: !!user });
  const { data: bookings } = useLiveTable<Booking>("bookings", (q) => q.eq("customer_id", user?.id ?? "").order("scheduled_at", { ascending: true }), [user?.id], { enabled: !!user });
  const { data: history } = useLiveTable<History>("service_history", (q) => q.eq("customer_id", user?.id ?? "").order("service_date", { ascending: false }).limit(5), [user?.id], { enabled: !!user });

  useEffect(() => {
    supabase.from("services").select("id,name,category").then(({ data }) => {
      const map: Record<string, Service> = {};
      (data ?? []).forEach((s: any) => { map[s.id] = s; });
      setServices(map);
    });
  }, []);

  const vehicleById = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  const upcoming = bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status));
  const nextBooking = upcoming[0];

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const fleetHealth = vehicles.length ? Math.round((1 - history.filter((h) => Date.now() - new Date(h.service_date).getTime() < 30 * 86400000).length / Math.max(vehicles.length * 2, 1)) * 100) : 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Welcome back, {firstName}.</h1>
        <p className="text-sm text-muted-foreground mt-1">
          You have <span className="text-primary font-semibold">{upcoming.length}</span> upcoming {upcoming.length === 1 ? "booking" : "bookings"}, and {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"} in your garage. Fleet health: <span className="text-emerald-600 font-semibold">{fleetHealth}%</span>.
        </p>
      </div>

      {/* Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {vehicles.slice(0, 4).map((v) => (
            <Link to="/customer/vehicles" key={v.id} className="bg-card p-5 rounded-xl border border-border/20 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors"><Car className="w-5 h-5 text-primary" /></div>
                <span className="text-[10px] font-mono text-muted-foreground">{v.registration}</span>
              </div>
              <h3 className="font-bold text-on-surface">{v.year} {v.make} {v.model}</h3>
              <p className="text-xs text-muted-foreground mb-4">{v.color} • {v.fuel_type}</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Odometer</p>
                  <p className="text-xl font-black text-on-surface font-mono">{v.mileage.toLocaleString("en-IN")} <span className="text-xs font-normal">km</span></p>
                </div>
              </div>
            </Link>
          ))}
          {vehicles.length === 0 && (
            <Link to="/customer/vehicles" className="sm:col-span-2 border-2 border-dashed border-border/30 rounded-xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all">
              <Plus className="w-8 h-8 mb-2" />
              <h4 className="font-bold text-sm">Add Your First Vehicle</h4>
              <p className="text-xs mt-1">Start tracking maintenance and bookings.</p>
            </Link>
          )}
        </div>

        {/* Next Booking */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-primary">Next Appointment</span>
          </div>
          {nextBooking ? (
            <>
              <h3 className="text-lg font-bold mb-2">{services[nextBooking.service_id]?.name ?? "Service"}</h3>
              <p className="text-sm text-slate-400 mb-4">
                {vehicleById[nextBooking.vehicle_id] ? `${vehicleById[nextBooking.vehicle_id].make} ${vehicleById[nextBooking.vehicle_id].model}` : "Vehicle"}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-300"><Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> {formatDateTime(nextBooking.scheduled_at)}</div>
                <div className="flex items-center gap-2 text-sm text-slate-300"><MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> AutoServe Gurugram</div>
                <div className="flex items-center gap-2 text-sm text-slate-300"><Activity className="w-3.5 h-3.5 text-primary shrink-0" /> Status: <span className="capitalize font-semibold">{nextBooking.status.replace("_", " ")}</span></div>
              </div>
              <Link to="/customer/bookings" className="w-full py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm font-bold hover:bg-white/20 active:scale-[0.98] transition-all block text-center">View Details</Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold mb-2">No upcoming bookings</h3>
              <p className="text-sm text-slate-400 mb-4">Schedule your next service to keep your vehicles in top shape.</p>
              <Link to="/customer/book" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all block text-center">Book Service</Link>
            </>
          )}
        </div>
      </div>

      {/* History & quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">Recent Service History</h3>
            <Link to="/customer/history" className="text-xs text-primary font-semibold hover:underline">View All</Link>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No service history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead><tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                  <th className="text-left py-2 font-bold">Date</th><th className="text-left py-2 font-bold">Service</th><th className="text-left py-2 font-bold">Vehicle</th><th className="text-right py-2 font-bold">Cost</th>
                </tr></thead>
                <tbody className="divide-y divide-border/10">
                  {history.map((r) => {
                    const veh = vehicleById[r.vehicle_id];
                    return (
                      <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 text-xs text-muted-foreground">{formatDate(r.service_date)}</td>
                        <td className="py-3"><p className="text-sm font-semibold text-on-surface">{services[r.service_id]?.name ?? "Service"}</p></td>
                        <td className="py-3 text-sm text-muted-foreground">{veh ? `${veh.make} ${veh.model}` : "—"}</td>
                        <td className="py-3 text-sm font-bold text-on-surface text-right font-mono">{formatINR(r.cost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <h4 className="font-bold text-on-surface mb-4">Quick Actions</h4>
          <div className="space-y-2">
            <Link to="/customer/book" className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group">
              <span className="text-sm font-semibold text-on-surface flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" /> Book a service</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link to="/customer/vehicles" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors group">
              <span className="text-sm font-semibold text-on-surface flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /> Manage vehicles</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link to="/customer/diagnostics" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors group">
              <span className="text-sm font-semibold text-on-surface flex items-center gap-2"><Activity className="w-4 h-4 text-muted-foreground" /> AI diagnostics</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
