-- Handover token system: signed tokens for vehicle check-in & check-out via QR scan
CREATE TABLE IF NOT EXISTS public.handover_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('check_in', 'check_out')),
  token TEXT NOT NULL UNIQUE,
  issued_to UUID NOT NULL,
  scanned_by UUID,
  scanned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_handover_tokens_booking ON public.handover_tokens(booking_id);
CREATE INDEX IF NOT EXISTS idx_handover_tokens_token ON public.handover_tokens(token);

ALTER TABLE public.handover_tokens ENABLE ROW LEVEL SECURITY;

-- Customer can see their own tokens; staff can see all
CREATE POLICY "handover_select" ON public.handover_tokens
FOR SELECT TO authenticated
USING (
  issued_to = auth.uid()
  OR public.has_role(auth.uid(), 'manager')
  OR public.has_role(auth.uid(), 'employee')
);

-- Customer can create check-in/out tokens for their own bookings; staff can create any
CREATE POLICY "handover_insert" ON public.handover_tokens
FOR INSERT TO authenticated
WITH CHECK (
  issued_to = auth.uid()
  OR public.has_role(auth.uid(), 'manager')
  OR public.has_role(auth.uid(), 'employee')
);

-- Only staff can mark a token as scanned (update)
CREATE POLICY "handover_update_staff" ON public.handover_tokens
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'employee'))
WITH CHECK (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'employee'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.handover_tokens;
ALTER TABLE public.handover_tokens REPLICA IDENTITY FULL;

-- Add lifecycle columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ready_for_pickup BOOLEAN NOT NULL DEFAULT false;

-- Allow new "ready" status on bookings
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'ready_for_pickup';