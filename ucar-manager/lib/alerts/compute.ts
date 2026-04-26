"use server";

import { createClient } from "@/lib/supabase/server";
import { ALERT_RULES, type KpiDomain } from "./rules";

type KpiValueMap = Map<string, number | null>; // kpi_key → value

async function fetchKpiValues(
  supabase: Awaited<ReturnType<typeof createClient>>,
  institutionId: string,
): Promise<Map<KpiDomain, KpiValueMap>> {
  const result = new Map<KpiDomain, KpiValueMap>();

  const [academic, finance, hr, employment, research, esgData, infrastructure, partnerships] =
    await Promise.all([
      supabase.from("v_academic_kpis").select("dropout_rate, success_rate").eq("institution_id", institutionId).order("academic_year", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("v_finance_kpis_summary").select("execution_rate").eq("institution_id", institutionId).order("fiscal_year", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("v_hr_kpis").select("absenteeism_rate, avg_teaching_load").eq("institution_id", institutionId).maybeSingle(),
      supabase.from("v_employment_kpis").select("employability_rate").eq("institution_id", institutionId).maybeSingle(),
      supabase.from("v_research_kpis").select("active_projects").eq("institution_id", institutionId).maybeSingle(),
      supabase.from("v_esg_kpis").select("recycling_rate").eq("institution_id", institutionId).order("period_start", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("v_infrastructure_kpis").select("operational_rate").eq("institution_id", institutionId).maybeSingle(),
      supabase.from("v_partnerships_kpis").select("active_partnerships").eq("institution_id", institutionId).maybeSingle(),
    ]);

  result.set("academic", new Map([
    ["dropout_rate", academic.data?.dropout_rate ?? null],
    ["success_rate", academic.data?.success_rate ?? null],
  ]));
  result.set("finance", new Map([
    ["execution_rate", finance.data?.execution_rate ?? null],
  ]));
  result.set("hr", new Map([
    ["absenteeism_rate", hr.data?.absenteeism_rate ?? null],
    ["avg_teaching_load", hr.data?.avg_teaching_load ?? null],
  ]));
  result.set("employment", new Map([
    ["employability_rate", employment.data?.employability_rate ?? null],
  ]));
  result.set("research", new Map([
    ["active_projects", research.data?.active_projects ?? null],
  ]));
  result.set("esg", new Map([
    ["recycling_rate", esgData.data?.recycling_rate ?? null],
  ]));
  result.set("infrastructure", new Map([
    ["operational_rate", infrastructure.data?.operational_rate ?? null],
  ]));
  result.set("partnerships", new Map([
    ["active_partnerships", partnerships.data?.active_partnerships ?? null],
  ]));

  return result;
}

export async function computeAndUpsertAlerts(
  institutionId: string,
  organizationId: string,
): Promise<void> {
  const supabase = await createClient();
  const kpiValues = await fetchKpiValues(supabase, institutionId);

  const toInsert: {
    organization_id: string;
    institution_id: string;
    kpi_domain: string;
    kpi_key: string;
    threshold_value: number;
    actual_value: number;
    severity: string;
    message: string;
    is_acknowledged: boolean;
  }[] = [];

  const triggeredKeys = new Set<string>(); // "domain:kpi_key"

  for (const rule of ALERT_RULES) {
    const domainMap = kpiValues.get(rule.domain);
    if (!domainMap) continue;

    const value = domainMap.get(rule.kpi_key);
    if (value === null || value === undefined) continue;

    const result = rule.getSeverity(value);
    if (!result) continue;

    triggeredKeys.add(`${rule.domain}:${rule.kpi_key}`);
    toInsert.push({
      organization_id: organizationId,
      institution_id: institutionId,
      kpi_domain: rule.domain,
      kpi_key: rule.kpi_key,
      threshold_value: result.threshold,
      actual_value: value,
      severity: result.severity,
      message: rule.messageTemplate(value, result.threshold),
      is_acknowledged: false,
    });
  }

  // Fetch acknowledged keys so we don't create duplicates for them
  const { data: ackedRows } = await supabase
    .from("alerts")
    .select("kpi_domain, kpi_key")
    .eq("institution_id", institutionId)
    .eq("is_acknowledged", true);

  const ackedKeys = new Set(
    (ackedRows ?? []).map((r) => `${r.kpi_domain}:${r.kpi_key}`),
  );

  // Delete ALL non-acknowledged alerts for every known rule key.
  // This is a single sweep that handles stale recovery AND de-duplication.
  for (const rule of ALERT_RULES) {
    await supabase
      .from("alerts")
      .delete()
      .eq("institution_id", institutionId)
      .eq("kpi_domain", rule.domain)
      .eq("kpi_key", rule.kpi_key)
      .eq("is_acknowledged", false);
  }

  // Insert fresh alerts only for triggered rules that have no acknowledged row yet.
  const toInsertFresh = toInsert.filter(
    (a) => !ackedKeys.has(`${a.kpi_domain}:${a.kpi_key}`),
  );

  if (toInsertFresh.length > 0) {
    await supabase.from("alerts").insert(toInsertFresh);
  }
}
