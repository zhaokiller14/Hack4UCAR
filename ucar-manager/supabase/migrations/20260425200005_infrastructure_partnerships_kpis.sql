-- KPI views for infrastructure and partnerships domains

CREATE VIEW v_infrastructure_kpis AS
SELECT
  institution_id,
  COUNT(*)                                                                AS total_assets,
  COUNT(*) FILTER (WHERE status = 'operational')                          AS operational_count,
  COUNT(*) FILTER (WHERE status = 'maintenance')                          AS maintenance_count,
  COUNT(*) FILTER (WHERE status = 'out_of_service')                       AS out_of_service_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'operational')::numeric
    / NULLIF(COUNT(*), 0) * 100, 2
  )                                                                       AS operational_rate,
  ROUND(AVG(reported_occupancy_pct) FILTER (WHERE reported_occupancy_pct IS NOT NULL), 2) AS avg_occupancy_pct,
  COUNT(*) FILTER (WHERE asset_type = 'classroom')                        AS classroom_count,
  COUNT(*) FILTER (WHERE asset_type = 'lab')                              AS lab_count
FROM infrastructure_assets
GROUP BY institution_id;


CREATE VIEW v_partnerships_kpis AS
SELECT
  institution_id,
  COUNT(*) FILTER (WHERE is_active = true)                                AS active_partnerships,
  COUNT(*)                                                                AS total_partnerships,
  SUM(outgoing_students) FILTER (WHERE is_active = true)                  AS total_outgoing_students,
  SUM(incoming_students) FILTER (WHERE is_active = true)                  AS total_incoming_students,
  COUNT(*) FILTER (WHERE is_active = true AND partner_country <> 'TN')    AS international_partnerships,
  COUNT(*) FILTER (WHERE is_active = true AND type = 'academic')          AS academic_partnerships,
  COUNT(*) FILTER (WHERE is_active = true AND type = 'industry')          AS industry_partnerships
FROM partnerships
GROUP BY institution_id;
