import { useState } from "react";
import { ScanLine, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import QRScanner from "@/components/QRScanner";
import { redeemHandoverToken } from "@/lib/handover";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ScanPage = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<{ ok: boolean; message: string; bookingId?: string; kind?: string } | null>(null);

  const handleResult = async (text: string) => {
    if (!user) return;
    const res = await redeemHandoverToken(text, user.id);
    setLast(res);
    setOpen(false);
    if (res.ok) {
      toast.success(res.message);
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    } else {
      toast.error(res.message);
      if (navigator.vibrate) navigator.vibrate(150);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Vehicle Handover</h1>
        <p className="text-sm text-muted-foreground mt-1">Scan customer QR to check a vehicle in or release it on collection.</p>
      </div>

      <button
        onClick={() => { setLast(null); setOpen(true); }}
        className="w-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-8 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.99] group"
      >
        <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <ScanLine className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-1">Tap to Scan</h2>
        <p className="text-sm text-white/80">Opens the camera to read the customer's check-in or check-out QR</p>
      </button>

      {last && (
        <div className={`rounded-xl border p-5 flex items-start gap-3 ${last.ok ? "bg-emerald-50 border-emerald-200" : "bg-destructive/5 border-destructive/30"}`}>
          {last.ok
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className={`font-bold ${last.ok ? "text-emerald-900" : "text-destructive"}`}>{last.message}</p>
            {last.bookingId && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Booking #{last.bookingId.slice(0, 8).toUpperCase()} · {last.kind === "check_in" ? "checked in" : "released"}
              </p>
            )}
            {last.bookingId && last.kind === "check_in" && (
              <Link to={`/employee/job/${last.bookingId}`} className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary hover:underline">
                Open job details <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border/20 p-5 shadow-sm">
        <h3 className="font-bold text-on-surface mb-3">How it works</h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">1</span><div>Customer arrives and shows their <strong className="text-on-surface">check-in QR</strong>. Scan it — vehicle is locked into the bay and the job moves to <em>In Progress</em>.</div></li>
          <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">2</span><div>Update job status & technician notes from the job detail page. When done, mark the job <strong className="text-on-surface">Ready for Pickup</strong>.</div></li>
          <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">3</span><div>Customer receives a fresh <strong className="text-on-surface">collection QR</strong>. Scan it to release the vehicle and complete the booking.</div></li>
        </ol>
      </div>

      {open && <QRScanner onResult={handleResult} onClose={() => setOpen(false)} />}
    </div>
  );
};

export default ScanPage;
