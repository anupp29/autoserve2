import { useState } from "react";
import { Plus, UserCog, Users, CheckCircle, Clock, X, Loader2, Mail, Lock, Phone, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { useProfilesByRole } from "@/hooks/useStaff";
import { formatINR, initials } from "@/lib/format";
import { toast } from "sonner";

interface Booking { id: string; assigned_to: string | null; status: string; }
interface History { id: string; technician_id: string | null; cost: number; }

const ManagerEmployees = () => {
  const { profiles: technicians } = useProfilesByRole("employee");
  const { profiles: managers } = useProfilesByRole("manager");
  const { data: bookings } = useLiveTable<Booking>("bookings", (q) => q);
  const { data: history } = useLiveTable<History>("service_history", (q) => q);

  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", role: "employee" as "employee" | "manager" });

  const getStats = (uid: string) => {
    const assigned = bookings.filter((b) => b.assigned_to === uid);
    const inProg = assigned.filter((b) => b.status === "in_progress").length;
    const completed = history.filter((h) => h.technician_id === uid);
    const revenue = completed.reduce((s, h) => s + Number(h.cost || 0), 0);
    return { assigned: assigned.length, inProg, completed: completed.length, revenue };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-create-employee", {
      body: form,
    });
    setBusy(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Could not create account");
      return;
    }
    toast.success(`${form.role === "employee" ? "Employee" : "Manager"} account created for ${form.email}`);
    setShowAdd(false);
    setForm({ full_name: "", email: "", password: "", phone: "", role: "employee" });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Employee Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Technical staff, current workload, and lifetime performance.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all self-start">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total Staff" value={String(technicians.length + managers.length)} icon={Users} bg="bg-primary/10" color="text-primary" />
        <Kpi label="Technicians" value={String(technicians.length)} icon={UserCog} bg="bg-emerald-50" color="text-emerald-600" />
        <Kpi label="Active Jobs" value={String(bookings.filter((b) => b.status === "in_progress").length)} icon={Clock} bg="bg-amber-50" color="text-amber-600" />
        <Kpi label="Total Completed" value={String(history.length)} icon={CheckCircle} bg="bg-primary/10" color="text-primary" />
      </div>

      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="p-4 lg:p-6 border-b border-border/20">
          <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Technicians</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                <th className="text-left py-3 px-6 font-bold">Name</th>
                <th className="text-left py-3 px-4 font-bold">Phone</th>
                <th className="text-left py-3 px-4 font-bold">Assigned</th>
                <th className="text-left py-3 px-4 font-bold">In Progress</th>
                <th className="text-left py-3 px-4 font-bold">Completed</th>
                <th className="text-left py-3 px-4 font-bold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {technicians.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No technicians yet. Click "Add Employee" to get started.</td></tr>
              )}
              {technicians.map((t) => {
                const stats = getStats(t.user_id);
                return (
                  <tr key={t.user_id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{initials(t.full_name)}</div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{t.full_name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">#{t.user_id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{t.phone || "—"}</td>
                    <td className="py-4 px-4 text-sm text-on-surface">{stats.assigned}</td>
                    <td className="py-4 px-4">
                      {stats.inProg > 0
                        ? <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{stats.inProg} active</span>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="py-4 px-4 text-sm text-on-surface">{stats.completed}</td>
                    <td className="py-4 px-4 text-sm font-mono font-bold text-on-surface">{formatINR(stats.revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {managers.length > 0 && (
        <div className="bg-card rounded-xl border border-border/20 shadow-sm">
          <div className="p-4 lg:p-6 border-b border-border/20">
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Managers</h3>
          </div>
          <div className="divide-y divide-border/10">
            {managers.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3 p-4 lg:px-6">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-700">{initials(m.full_name)}</div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{m.full_name}</p>
                  <p className="text-xs text-muted-foreground">{m.phone || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-on-surface">Add Staff Account</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-surface-container rounded"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Customer self-signup is open; managers and technicians must be provisioned here.</p>
            <form onSubmit={submit} className="space-y-3">
              <Field label="Role">
                <div className="grid grid-cols-2 gap-2">
                  {(["employee", "manager"] as const).map((r) => (
                    <button type="button" key={r} onClick={() => setForm({ ...form, role: r })}
                      className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${form.role === r ? "bg-primary text-primary-foreground" : "bg-surface-container-low border border-border/30 text-on-surface"}`}>
                      {r === "employee" ? "Technician" : "Manager"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Full Name" icon={UserCircle2}>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Rohan Sharma" className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-container-low border border-border/20 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
              </Field>
              <Field label="Email" icon={Mail}>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rohan@autoserve.in" className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-container-low border border-border/20 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
              </Field>
              <Field label="Temporary Password" icon={Lock}>
                <input required type="text" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-container-low border border-border/20 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
              </Field>
              <Field label="Phone (optional)" icon={Phone}>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98XXX XXXXX" className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-container-low border border-border/20 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
              </Field>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-border/30 rounded-lg text-sm font-bold hover:bg-surface-container">Cancel</button>
                <button type="submit" disabled={busy} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Account
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Share these credentials with the new staff member out-of-band.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1.5">{label}</span>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />}
      {children}
    </div>
  </label>
);

const Kpi = ({ label, value, icon: Icon, bg, color }: { label: string; value: string; icon: React.ElementType; bg: string; color: string }) => (
  <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
    </div>
    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{label}</p>
    <p className="text-2xl lg:text-3xl font-black text-on-surface mt-1">{value}</p>
  </div>
);

export default ManagerEmployees;
