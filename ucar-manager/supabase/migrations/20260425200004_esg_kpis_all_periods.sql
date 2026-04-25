-- Rebuild v_esg_kpis: aggregate metrics per institution+period, all period types
DROP VIEW IF EXISTS v_esg_kpis;
CREATE VIEW v_esg_kpis AS
SELECT
  institution_id,
  period_type,
  period_start,
  period_end,
  SUM(energy_kwh)         AS energy_kwh,
  SUM(carbon_kg)          AS carbon_kg,
  SUM(water_liters)       AS water_liters,
  SUM(waste_kg)           AS waste_kg,
  SUM(recycled_kg)        AS recycled_kg,
  ROUND(SUM(recycled_kg) / NULLIF(SUM(waste_kg), 0) * 100, 2) AS recycling_rate,
  ROUND(AVG(green_mobility_pct), 2)                            AS green_mobility_pct
FROM esg_records
GROUP BY institution_id, period_type, period_start, period_end;
