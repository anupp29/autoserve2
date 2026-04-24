// Lightweight confirmation dialog used across customer / manager / employee
// for destructive actions (cancel booking, release job, delete inventory).
// Uses semantic design tokens. Returns selected reason via onConfirm.
import { useEffect, useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When true, asks for a freeform reason before confirming. */
  askReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** Visual style of the confirm button. */
  tone?: "destructive" | "primary";
  busy?: boolean;
  onConfirm: (reason?: string) => void | Promise<void>;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Keep It",
  askReason = false,
  reasonLabel = "Reason (optional)",
  reasonPlaceholder = "Add a short note…",
  tone = "destructive",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);
  if (!open) return null;

  const confirmCls =
    tone === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !busy && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="bg-card w-full max-w-md rounded-2xl shadow-2xl p-6 border border-border/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 ${
              tone === "destructive" ? "bg-destructive/10" : "bg-primary/10"
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${
                tone === "destructive" ? "text-destructive" : "text-primary"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-title"
              className="font-bold text-on-surface text-base leading-tight"
            >
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            disabled={busy}
            aria-label="Close"
            className="p-1 rounded-lg hover:bg-surface-container text-muted-foreground hover:text-on-surface transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {askReason && (
          <div className="mt-5">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1.5">
              {reasonLabel}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 200))}
              rows={3}
              placeholder={reasonPlaceholder}
              className="w-full p-2.5 text-sm bg-surface-container-low border border-border/20 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {reason.length}/200
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2.5 rounded-lg text-sm font-bold border border-border/30 text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={busy}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all ${confirmCls}`}
          >
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
