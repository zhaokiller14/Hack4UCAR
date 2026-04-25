BEGIN;

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL
     AND to_regclass('public.users') IS NULL THEN
    ALTER TABLE public.profiles RENAME TO users;

    IF to_regclass('public.profiles_pkey') IS NOT NULL THEN
      ALTER INDEX public.profiles_pkey RENAME TO users_pkey;
    END IF;

    IF to_regclass('public.idx_profiles_institution') IS NOT NULL THEN
      ALTER INDEX public.idx_profiles_institution RENAME TO idx_users_institution;
    END IF;

    IF to_regclass('public.idx_profiles_role') IS NOT NULL THEN
      ALTER INDEX public.idx_profiles_role RENAME TO idx_users_role;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'users'
        AND policyname = 'profiles_isolation'
    ) THEN
      ALTER POLICY "profiles_isolation" ON public.users RENAME TO "users_isolation";
    END IF;
  END IF;
END
$$;

COMMIT;
