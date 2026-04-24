import { useMemo, useState } from "react";
import { Search, Users, Star, Activity, UserPlus } from "lucide-react";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { useProfilesByRole } from "@/hooks/useStaff";
import { formatINR, formatDate, initials } from "@/lib/format";

interface Vehicle { id: string; make: string; model: string; year: number; registration: string; owner_id: string; }
interface Booking { id: string; customer_id: string; total_cost: number | null; status: string; }
interface History { id: string; customer_id: string; cost: number; service_date: string; }
interface ProfileRow { user_id: string; created_at: string; }

const ManagerCustomers = () => {
  const { profiles: customers } = useProfilesByRole("customer");
  const { data: vehicles } = useLiveTable<Vehicle>("vehicles", (q) => q);
  const { data: bookings } = useLiveTable<Booking>("bookings", (q) => q);
  const { data: history } = useLiveTable<History>("service_history", (q) => q);
  // Fetch created_at from profiles for "new" badges + sort.
  const { data: profileMeta } = useLiveTable<ProfileRow>("profiles", (q) => q.order("created_at", { ascending: false }));
  const createdMap = useMemo(() => {
    const m: Record<string, string> = {};
    profileMeta.forEach((p) => { m[p.user_id] = p.created_at; });
    return m;
  }, [profileMeta]);

  const [search, setSearch] = useState("");

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => {
      const ta = createdMap[a.user_id] ? +new Date(createdMap[a.user_id]) : 0;
      const tb = createdMap[b.user_id] ? +new Date(createdMap[b.user_id]) : 0;
      return tb - ta; // newest first
    }),
    [customers, createdMap]
  );

  const filtered = useMemo(() => {
    return sortedCustomers.filter((c) => {
      if (!search) return true;
      const hay = `${c.full_name} ${c.phone ?? ""}`.toLowerCase();
      return hay.includes(search.toLowerCase());
    });
  }, [sortedCustomers, search]);

  const totalSpend = history.reduce((s, h) => s + Number(h.cost || 0), 0);
  const avgLtv = customers.length ? totalSpend / customers.length : 0;
  const activeBookings = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled").length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = customers.filter((c) => {
    const t = createdMap[c.user_id] ? +new Date(createdMap[c.user_id]) : 0;
    return t >= sevenDaysAgo;
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Customer Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">All registered customers, their vehicles and service history.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total Customers" value={String(customers.length)} icon={Users} bg="bg-primary/10" color="text-primary" />
        <Kpi label="New This Week" value={String(newThisWeek)} icon={UserPlus} bg="bg-emerald-50" color="text-emerald-600" />
        <Kpi label="Active Bookings" value={String(activeBookings)} icon={Activity} bg="bg-amber-50" color="text-amber-600" />
        <Kpi label="Avg. Lifetime Value" value={formatINR(avgLtv)} icon={Star} bg="bg-primary/10" color="text-primary" mono />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…"
          className="w-full pl-11 pr-4 py-3 bg-card border border-border/20 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
      </div>

      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                <th className="text-left py-3 px-6 font-bold">Customer</th>
                <th className="text-left py-3 px-4 font-bold">Phone</th>
                <th className="text-left py-3 px-4 font-bold">Vehicles</th>
                <th className="text-left py-3 px-4 font-bold">Bookings</th>
                <th className="text-left py-3 px-4 font-bold">Total Spend</th>
                <th className="text-left py-3 px-4 font-bold">Last Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No customers found.</td></tr>
              )}
              {filtered.map((c) => {
                const myVehicles = vehicles.filter((v) => v.owner_id === c.user_id);
                const myBookings = bookings.filter((b) => b.customer_id === c.user_id);
                const myHistory = history.filter((h) => h.customer_id === c.user_id);
                const spend = myHistory.reduce((s, h) => s + Number(h.cost || 0), 0);
                const last = myHistory.sort((a, b) => +new Date(b.service_date) - +new Date(a.service_date))[0];
                return (
                  <tr key={c.user_id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{initials(c.full_name)}</div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{c.full_name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">#{c.user_id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{c.phone || "—"}</td>
                    <td className="py-4 px-4 text-sm text-on-surface">{myVehicles.length} vehicle{myVehicles.length !== 1 && "s"}</td>
                    <td className="py-4 px-4 text-sm text-on-surface">{myBookings.length}</td>
                    <td className="py-4 px-4 text-sm font-mono font-bold text-on-surface">{formatINR(spend)}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{last ? formatDate(last.service_date) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Kpi = ({ label, value, icon: Icon, bg, color, mono }: { label: string; value: string; icon: any; bg: string; color: string; mono?: boolean }) => (
  <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
    </div>
    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">{label}</p>
    <p className={`text-2xl lg:text-3xl font-black text-on-surface mt-1 ${mono ? "font-mono" : ""}`}>{value}</p>
  </div>
);

export default ManagerCustomers;
