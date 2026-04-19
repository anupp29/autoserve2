import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle, ArrowLeft, Save, Wrench, Clock, AlertCircle, PlayCircle, PackageCheck, ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { useProfilesByRole } from "@/hooks/useStaff";
import { formatINR, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { issueHandoverToken } from "@/lib/handover";
import BrandLogo from "@/components/BrandLogo";

interface Booking {
  id: string; status: string; priority: string; scheduled_at: string; notes: string | null;
  total_cost: number | null; service_id: string; vehicle_id: string; customer_id: string;
  assigned_to: string | null;
}
interface Vehicle { id: string; make: string; model: string; year: number; registration: string; mileage: number; fuel_type: string | null; color: string | null; }
interface Service { id: string; name: string; duration_minutes: number; price: number; category: string; }

const STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"] as const;

const EmployeeJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notes, setNotes] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [mileageAtService, setMileageAtService] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: vehicles } = useLiveTable<Vehicle>("vehicles", (q) => q);
  const { data: services } = useLiveTable<Service>("services", (q) => q);
  const { byId: profilesById } = useProfilesByRole();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
      if (data) {
        setBooking(data as Booking);
        setNotes(data.notes ?? "");
      }
    };
    load();
    const channel = supabase
      .channel(`booking-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (!booking) {
    return <div className="p-8 text-sm text-muted-foreground">Loading job…</div>;
  }

  const vehicle = vehicles.find((v) => v.id === booking.vehicle_id);
  const service = services.find((s) => s.id === booking.service_id);
  const customer = profilesById[booking.customer_id];

  const updateStatus = async (newStatus: string) => {
    if (!booking) return;
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus as any, notes })
      .eq("id", booking.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Status → ${newStatus.replace("_", " ")}`);

    // Notify customer
    await supabase.from("notifications").insert({
      user_id: booking.customer_id,
      title: "Service Update",
      message: `Your ${service?.name || "service"} is now ${newStatus.replace("_", " ")}.`,
      type: newStatus === "completed" ? "success" : "info",
    });

    // If completed → write service_history record
    if (newStatus === "completed") {
      await supabase.from("service_history").insert({
        booking_id: booking.id,
        customer_id: booking.customer_id,
        vehicle_id: booking.vehicle_id,
        service_id: booking.service_id,
        technician_id: user?.id,
        cost: booking.total_cost ?? service?.price ?? 0,
        notes: notes || null,
        parts_used: partsUsed || null,
        mileage_at_service: mileageAtService ? parseInt(mileageAtService, 10) : null,
      });
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    const { error } = await supabase.from("bookings").update({ notes }).eq("id", booking.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Notes saved");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/employee/queue" className="hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Service Queue</Link>
        <span>›</span>
        <span className="text-primary font-semibold font-mono">#{booking.id.slice(0, 8).toUpperCase()}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle"}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm mt-2">
            <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Registration</span><span className="font-mono font-bold">{vehicle?.registration || "—"}</span></div>
            <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Fuel</span><span className="font-bold">{vehicle?.fuel_type || "—"}</span></div>
            <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Odometer</span><span className="font-mono font-bold">{vehicle?.mileage?.toLocaleString("en-IN") || 0} km</span></div>
            <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Customer</span><span className="font-bold">{customer?.full_name || "—"}</span></div>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full self-start ${
          booking.status === "completed" ? "text-emerald-600 bg-emerald-50" :
          booking.status === "in_progress" ? "text-primary bg-primary/10" :
          booking.status === "cancelled" ? "text-destructive bg-destructive/10" :
          "text-amber-600 bg-amber-50"
        }`}>
          {booking.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
            <h3 className="font-bold text-on-surface mb-4">Service Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-4 rounded-lg border border-border/10">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Service</p>
                <p className="text-sm font-bold text-on-surface mt-1">{service?.name || "—"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{service?.category}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-border/10">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Estimated Cost</p>
                <p className="text-sm font-bold text-on-surface mt-1 font-mono">{formatINR(booking.total_cost ?? service?.price)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{service?.duration_minutes} min</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-border/10">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Scheduled</p>
                <p className="text-sm font-bold text-on-surface mt-1">{formatDateTime(booking.scheduled_at)}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-border/10">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Priority</p>
                <p className="text-sm font-bold text-on-surface mt-1 uppercase">{booking.priority}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-on-surface">Technician Notes</h3>
              <button onClick={saveNotes} disabled={saving} className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Diagnosis, observations, follow-up actions…"
              className="w-full p-3 text-sm bg-surface-container-low border border-border/20 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-y"
            />
          </div>

          {booking.status === "in_progress" && (
            <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Completion Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1.5">Parts Used</label>
                  <input value={partsUsed} onChange={(e) => setPartsUsed(e.target.value)} placeholder="e.g. Brake pads × 4, Engine oil 4L" className="w-full p-2.5 text-sm bg-surface-container-low border border-border/20 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1.5">Mileage at Service (km)</label>
                  <input type="number" value={mileageAtService} onChange={(e) => setMileageAtService(e.target.value)} placeholder={String(vehicle?.mileage ?? 0)} className="w-full p-2.5 text-sm bg-surface-container-low border border-border/20 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
            <h4 className="font-bold text-on-surface mb-4">Update Status</h4>
            <div className="space-y-2">
              {booking.status === "pending" && (
                <button onClick={() => updateStatus("confirmed")} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> Confirm Booking
                </button>
              )}
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <button onClick={() => updateStatus("in_progress")} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50">
                  <PlayCircle className="w-4 h-4" /> Start Job
                </button>
              )}
              {booking.status === "in_progress" && (
                <button onClick={() => updateStatus("completed")} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> Mark Completed
                </button>
              )}
              {booking.status !== "completed" && booking.status !== "cancelled" && (
                <button onClick={() => updateStatus("cancelled")} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 border border-destructive/30 text-destructive rounded-lg text-sm font-bold hover:bg-destructive/5 transition-colors disabled:opacity-50">
                  <AlertCircle className="w-4 h-4" /> Cancel Job
                </button>
              )}
              {(booking.status === "completed" || booking.status === "cancelled") && (
                <button onClick={() => navigate("/employee/queue")} className="w-full flex items-center justify-center gap-2 py-2.5 border border-border/30 rounded-lg text-sm font-bold hover:bg-surface-container transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Queue
                </button>
              )}
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
            <h4 className="font-bold text-on-surface mb-3">Customer</h4>
            {customer ? (
              <div>
                <p className="text-sm font-bold text-on-surface">{customer.full_name}</p>
                {customer.phone && <p className="text-xs text-muted-foreground mt-1">{customer.phone}</p>}
              </div>
            ) : <p className="text-xs text-muted-foreground">—</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeJobDetail;
