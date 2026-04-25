-- Rename org_admin → institution_admin in user_role enum.
-- Postgres has no DROP VALUE, so we recreate the type.
-- Must first drop dependents: auth_role() and the column default.

-- 1. Drop dependent function and column default
DROP FUNCTION IF EXISTS auth_role();
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- 2. Cast column to text so the type can be dropped
ALTER TABLE users ALTER COLUMN role TYPE text;

-- 3. Recreate the enum without org_admin
DROP TYPE user_role;
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'institution_admin',
  'finance_manager',
  'hr_manager',
  'academic_manager',
  'research_manager',
  'partnerships_manager',
  'esg_manager',
  'infrastructure_manager',
  'viewer'
);

-- 4. Migrate existing rows, restore column type and default
UPDATE users SET role = 'institution_admin' WHERE role = 'org_admin';
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'viewer';

-- 5. Restore auth_role() function
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;
