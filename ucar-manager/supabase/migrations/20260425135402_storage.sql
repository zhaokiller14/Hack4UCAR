-- ───────────────────────────────────────────────────────────────
-- Storage buckets
-- ───────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', false),
  ('reports',   'reports',   false)
ON CONFLICT DO NOTHING;


-- ───────────────────────────────────────────────────────────────
-- Storage RLS — documents bucket
-- Path convention: {institution_id}/{upload_id}/{file_name}
-- ───────────────────────────────────────────────────────────────

CREATE POLICY "documents_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      is_super_admin()
      OR (storage.foldername(name))[1] = auth_institution_id()::text
    )
  );

CREATE POLICY "documents_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      is_super_admin()
      OR (storage.foldername(name))[1] = auth_institution_id()::text
    )
  );

CREATE POLICY "documents_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      is_super_admin()
      OR (storage.foldername(name))[1] = auth_institution_id()::text
    )
  );


-- ───────────────────────────────────────────────────────────────
-- Storage RLS — reports bucket
-- Path convention: {institution_id}/{report_id}.pdf
--   or ucar/{report_id}.pdf for super_admin reports
-- ───────────────────────────────────────────────────────────────

CREATE POLICY "reports_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'reports'
    AND (
      is_super_admin()
      OR (storage.foldername(name))[1] = auth_institution_id()::text
    )
  );

CREATE POLICY "reports_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'reports'
    AND (
      is_super_admin()
      OR (storage.foldername(name))[1] = auth_institution_id()::text
    )
  );

CREATE POLICY "reports_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'reports'
    AND (
      is_super_admin()
      OR (storage.foldername(name))[1] = auth_institution_id()::text
    )
  );
