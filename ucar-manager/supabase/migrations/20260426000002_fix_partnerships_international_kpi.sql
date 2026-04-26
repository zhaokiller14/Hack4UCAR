-- Fix v_partnerships_kpis: NULL partner_country was excluded from international count
-- because NULL <> 'TN' evaluates to NULL in Postgres, not TRUE.
-- Partners with no country set now count as international (unknown country = not TN).
CREATE OR REPLACE VIEW v_partnerships_kpis AS
SELECT
  institution_id,
  COUNT(*) FILTER (WHERE is_active = true)                                                        AS active_partnerships,
  COUNT(*)                                                                                        AS total_partnerships,
  SUM(outgoing_students) FILTER (WHERE is_active = true)                                          AS total_outgoing_students,
  SUM(incoming_students) FILTER (WHERE is_active = true)                                          AS total_incoming_students,
  COUNT(*) FILTER (WHERE is_active = true AND (partner_country IS NULL OR partner_country <> 'TN')) AS international_partnerships,
  COUNT(*) FILTER (WHERE is_active = true AND type = 'academic')                                  AS academic_partnerships,
  COUNT(*) FILTER (WHERE is_active = true AND type = 'industry')                                  AS industry_partnerships
FROM partnerships
GROUP BY institution_id;
