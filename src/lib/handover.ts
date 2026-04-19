import { supabase } from "@/integrations/supabase/client";

/**
 * Production-safe payload format for QR codes.
 * The QR contains ONLY a short opaque token (no PII, no domain). Staff scanner
 * resolves the token via Supabase, so the same QR works on any domain — staging,
 * prod, or self-hosted — as long as the same backend is connected.
 *
 * Payload shape on the QR is a JSON string:
 *   { v: 1, t: "<token>", k: "check_in" | "check_out", b: "<bookingId>" }
 *
 * The token is unguessable (32 char base32) and recorded in the handover_tokens table.
 */

export type HandoverKind = "check_in" | "check_out";

export interface HandoverQRPayload {
  v: 1;
  t: string;       // token
  k: HandoverKind; // check_in | check_out
  b: string;       // bookingId (used as a sanity hint only)
}

const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

const randomToken = (len = 32): string => {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  }
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
};

/**
 * Issues (or returns the existing valid) handover token for a booking.
 * Customers call this for both check-in (after booking) and check-out (when ready).
 */
export async function issueHandoverToken(
  bookingId: string,
  issuedTo: string,
  kind: HandoverKind
): Promise<{ token: string; payload: string; error?: string }> {
  // Reuse existing un-scanned, un-expired token of same kind
  const { data: existing } = await supabase
    .from("handover_tokens")
    .select("token")
    .eq("booking_id", bookingId)
    .eq("kind", kind)
    .is("scanned_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.token) {
    const payload: HandoverQRPayload = { v: 1, t: existing.token, k: kind, b: bookingId };
    return { token: existing.token, payload: JSON.stringify(payload) };
  }

  const token = randomToken(32);
  const { error } = await supabase.from("handover_tokens").insert({
    booking_id: bookingId,
    kind,
    token,
    issued_to: issuedTo,
  });
  if (error) return { token: "", payload: "", error: error.message };
  const payload: HandoverQRPayload = { v: 1, t: token, k: kind, b: bookingId };
  return { token, payload: JSON.stringify(payload) };
}

/**
 * Parses a scanned QR string. Tolerates either the structured JSON payload or
 * a bare token string (fallback for manually typed codes).
 */
export function parseScanPayload(raw: string): { token: string; kind?: HandoverKind; bookingId?: string } | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj.t === "string") {
      return { token: obj.t, kind: obj.k, bookingId: obj.b };
    }
  } catch {
    // not JSON — treat as bare token
  }
  // bare token (alphanumeric, length plausible)
  if (/^[A-Z0-9]{16,64}$/.test(trimmed.toUpperCase())) {
    return { token: trimmed.toUpperCase() };
  }
  return null;
}

export interface RedeemResult {
  ok: boolean;
  message: string;
  bookingId?: string;
  kind?: HandoverKind;
}

/**
 * Staff-side: redeem a scanned token. This:
 *  - Verifies the token exists and isn't already used / expired
 *  - Marks it as scanned by the current staff user
 *  - Updates the booking lifecycle (check_in → in_progress + checked_in_at, check_out → completed picture)
 */
export async function redeemHandoverToken(rawScan: string, staffUserId: string): Promise<RedeemResult> {
  const parsed = parseScanPayload(rawScan);
  if (!parsed) return { ok: false, message: "Unrecognised QR code" };

  const { data: tok, error } = await supabase
    .from("handover_tokens")
    .select("id, booking_id, kind, scanned_at, expires_at")
    .eq("token", parsed.token)
    .maybeSingle();

  if (error || !tok) return { ok: false, message: "Token not found or already invalid" };
  if (tok.scanned_at) return { ok: false, message: "This QR has already been scanned" };
  if (new Date(tok.expires_at).getTime() < Date.now()) return { ok: false, message: "This QR has expired" };

  // Mark token as scanned
  const { error: updErr } = await supabase
    .from("handover_tokens")
    .update({ scanned_by: staffUserId, scanned_at: new Date().toISOString() })
    .eq("id", tok.id);
  if (updErr) return { ok: false, message: updErr.message };

  // Update booking lifecycle
  const now = new Date().toISOString();
  if (tok.kind === "check_in") {
    const { error: bErr } = await supabase
      .from("bookings")
      .update({ status: "in_progress", checked_in_at: now })
      .eq("id", tok.booking_id);
    if (bErr) return { ok: false, message: bErr.message };
  } else if (tok.kind === "check_out") {
    const { error: bErr } = await supabase
      .from("bookings")
      .update({ status: "completed", checked_out_at: now, ready_for_pickup: false })
      .eq("id", tok.booking_id);
    if (bErr) return { ok: false, message: bErr.message };
  }

  // Notify customer
  const { data: booking } = await supabase
    .from("bookings")
    .select("customer_id")
    .eq("id", tok.booking_id)
    .maybeSingle();
  if (booking?.customer_id) {
    await supabase.from("notifications").insert({
      user_id: booking.customer_id,
      title: tok.kind === "check_in" ? "Vehicle Checked In" : "Vehicle Released",
      message: tok.kind === "check_in"
        ? "Your vehicle has been checked into the service bay. Live updates on your bookings page."
        : "Your vehicle has been handed over. Thank you for choosing AutoServe!",
      type: "success",
    });
  }

  return { ok: true, message: tok.kind === "check_in" ? "Vehicle checked in ✓" : "Vehicle released ✓", bookingId: tok.booking_id, kind: tok.kind as HandoverKind };
}
