-- Remove public trial policies before real-data preview RLS acceptance.
-- Public entry pages may remain visible, but protected CRM tables must not
-- expose direct anon SELECT/INSERT policies.

DROP POLICY IF EXISTS profiles_public_fan_read ON public.profiles;
DROP POLICY IF EXISTS profiles_public_fan_registration ON public.profiles;

DROP POLICY IF EXISTS stores_public_read ON public.stores;
DROP POLICY IF EXISTS stores_public_trial_registration ON public.stores;

DROP POLICY IF EXISTS fans_public_read ON public.fans;
DROP POLICY IF EXISTS fans_public_trial_registration ON public.fans;
