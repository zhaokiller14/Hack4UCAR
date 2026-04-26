-- RLS for organization which were omitted from the initial schema.
-- organization: all authenticated users can read (needed to load institution context);
--               only super_admin can write.

ALTER TABLE organization          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organization_read"
  ON organization FOR SELECT TO authenticated
  USING (true);

