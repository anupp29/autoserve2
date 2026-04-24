-- 1. Attach the missing on_auth_user_created trigger so new signups
--    properly populate profiles + user_roles.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add cancellation metadata to bookings so we can show
--    who cancelled (for cancel-confirm UX) and reassignment flow.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancel_reason text;

-- 3. Speed up customer lookups on the Customers page.
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_to ON public.bookings(assigned_to);
CREATE INDEX IF NOT EXISTS idx_service_history_customer_id ON public.service_history(customer_id);

-- 4. Trigger: when an employee "cancels" (status set to cancelled by employee),
--    we won't actually cancel — frontend will unassign. But we still want
--    notify_managers when reassignment happens. Add a notification trigger
--    for unassigned bookings so manager dashboard surfaces them.
CREATE OR REPLACE FUNCTION public.notify_managers_unassigned_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cust_name text;
BEGIN
  IF OLD.assigned_to IS NOT NULL AND NEW.assigned_to IS NULL AND NEW.status <> 'cancelled' THEN
    SELECT full_name INTO cust_name FROM public.profiles WHERE user_id = NEW.customer_id;
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT ur.user_id,
           'Job Released by Technician',
           'Booking #' || upper(substr(NEW.id::text, 1, 6)) || ' from ' || COALESCE(cust_name, 'a customer') || ' needs reassignment.',
           'warning'
    FROM public.user_roles ur WHERE ur.role = 'manager';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_managers_unassigned ON public.bookings;
CREATE TRIGGER trg_notify_managers_unassigned
  AFTER UPDATE OF assigned_to ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_managers_unassigned_booking();