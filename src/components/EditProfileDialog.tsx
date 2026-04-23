import { useEffect, useState } from "react";
import { Loader2, User, Phone, Mail, Save, X } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone too long")
    .refine((v) => v === "" || /^[+\d][\d\s-]{7,19}$/.test(v), "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

const EditProfileDialog = ({ open, onOpenChange }: Props) => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>({});

  useEffect(() => {
    if (open) {
      setFullName(profile?.full_name ?? "");
      setPhone(profile?.phone ?? "");
      setErrors({});
    }
  }, [open, profile]);

  const handleSave = async () => {
    if (!user) return;
    const parsed = profileSchema.safeParse({ full_name: fullName, phone });
    if (!parsed.success) {
      const fieldErrors: { full_name?: string; phone?: string } = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0] === "full_name") fieldErrors.full_name = err.message;
        if (err.path[0] === "phone") fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: parsed.data.full_name,
          phone: parsed.data.phone || null,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>Update your display name and contact phone number.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Email (read-only) */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5 mb-1.5">
              <Mail className="w-3 h-3" /> Email
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-container-low rounded-lg border border-border/20 text-sm text-muted-foreground">
              {user?.email}
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 ml-auto">Locked</span>
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5 mb-1.5">
              <User className="w-3 h-3" /> Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, full_name: undefined })); }}
              className={`w-full px-3 py-2.5 bg-card border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.full_name ? "border-destructive" : "border-border/30 focus:border-primary"
              }`}
              placeholder="Your full name"
              maxLength={100}
              autoFocus
            />
            {errors.full_name && <p className="text-[11px] text-destructive mt-1">{errors.full_name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5 mb-1.5">
              <Phone className="w-3 h-3" /> Phone (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
              className={`w-full px-3 py-2.5 bg-card border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.phone ? "border-destructive" : "border-border/30 focus:border-primary"
              }`}
              placeholder="+91 98765 43210"
              maxLength={20}
            />
            {errors.phone && <p className="text-[11px] text-destructive mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end pt-2 border-t border-border/20">
          <button
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:bg-surface-container-low flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
