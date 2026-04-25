-- Backfill profiles for any auth user referenced by bookings/vehicles but missing a profile.
INSERT INTO public.profiles (user_id, full_name, phone)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1), 'Customer'),
  u.raw_user_meta_data->>'phone'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = u.id);

-- Backfill default 'customer' role for any auth user without a role row.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, COALESCE((u.raw_user_meta_data->>'role')::public.app_role, 'customer')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id)
ON CONFLICT DO NOTHING;