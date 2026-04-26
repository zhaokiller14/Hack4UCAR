-- Fix auth helper functions to reference `users` instead of `profiles`
-- (profiles was renamed to users in migration 20260425173000_rename_profiles_to_users)

CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth_institution_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT institution_id FROM users WHERE id = auth.uid()
$$; 

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS bool LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
  )
$$;
