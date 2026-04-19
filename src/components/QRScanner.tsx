import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, X, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onResult: (text: string) => Promise<void> | void;
  onClose: () => void;
}

/**
 * Lightweight QR scanner using the browser BarcodeDetector API + a manual entry fallback.
 * No external dependencies required. Works in production on Chrome/Edge/Android.
 * On unsupported browsers (older Safari/Firefox), the user can paste the token manually.
 */
const QRScanner = ({ onResult, onClose }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const win = window as any;
    const isSupported = "BarcodeDetector" in win;
    setSupported(isSupported);

    if (!isSupported) return;

    let detector: any;
    try { detector = new win.BarcodeDetector({ formats: ["qr_code"] }); } catch { setSupported(false); return; }

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        loop();
      } catch (e: any) {
        setError(e?.message || "Could not access camera");
      }
    };

    const loop = async () => {
      if (!videoRef.current || busy) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes && codes.length > 0) {
          const value = codes[0].rawValue as string;
          setBusy(true);
          stop();
          if (navigator.vibrate) navigator.vibrate(50);
          await onResult(value);
          return;
        }
      } catch { /* ignore decode misses */ }
      rafRef.current = requestAnimationFrame(loop);
    };

    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const submitManual = async () => {
    if (!manualInput.trim()) { toast.error("Enter the QR token first"); return; }
    setBusy(true);
    await onResult(manualInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card max-w-md w-full rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
          <h3 className="font-bold text-on-surface flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> Scan Handover QR
          </h3>
          <button onClick={() => { stop(); onClose(); }} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {supported === null && (
            <div className="aspect-square bg-surface-container-low rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {supported && (
            <div className="relative aspect-square bg-black rounded-xl overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              {/* Scan reticle */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-primary/70 rounded-2xl">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                </div>
                <div className="absolute left-8 right-8 h-0.5 bg-primary/80 shadow-[0_0_10px_hsl(var(--primary))] animate-[scan_2s_ease-in-out_infinite] top-1/2" />
              </div>
              {busy && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
          )}

          {supported === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-amber-900">
                <p className="font-bold mb-1">Camera scanning not supported</p>
                <p className="text-xs">Use the manual entry below — ask the customer to read out the token under their QR.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="border-t border-border/20 pt-4">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5 mb-2">
              <KeyRound className="w-3 h-3" /> Manual entry
            </label>
            <div className="flex gap-2">
              <input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                placeholder="Paste token or full QR payload"
                className="flex-1 bg-surface-container-low border border-border/30 rounded-lg py-2 px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                onClick={submitManual}
                disabled={busy}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-80px); }
          50% { transform: translateY(80px); }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
