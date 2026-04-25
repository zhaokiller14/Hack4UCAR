import type { SupabaseClient } from "@supabase/supabase-js";

import { CrudError, getAuthedSupabase } from "@/lib/db/crud";

export type KpiSnapshotFilters = {
	domain?: string;
	period_type?: string;
	period_start?: string;
	institution_id?: string;
	limit?: number;
};

export type KpiDomain =
	| "academic"
	| "finance"
	| "hr"
	| "research"
	| "esg"
	| "partnerships"
	| "infrastructure"
	| "employment";

export type PeriodType = "monthly" | "semester" | "annual";

export type KpiSnapshotInput = {
	institution_id: string;
	domain: KpiDomain;
	period_type: PeriodType;
	period_start: string;
	period_end: string;
	academic_year?: string;
	fiscal_year?: string;
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

const SUPPORTED_DOMAINS: KpiDomain[] = ["academic", "finance", "hr", "research", "esg"];

export async function listKpiSnapshots(filters: KpiSnapshotFilters = {}) {
	const { supabase } = await getAuthedSupabase();
	let query = supabase
		.from("kpi_snapshots")
		.select("*")
		.order("period_start", { ascending: false });

	if (filters.domain) {
		query = query.eq("domain", filters.domain);
	}

	if (filters.period_type) {
		query = query.eq("period_type", filters.period_type);
	}

	if (filters.period_start) {
		query = query.eq("period_start", filters.period_start);
	}

	if (filters.institution_id) {
		query = query.eq("institution_id", filters.institution_id);
	}

	const limit = clampInt(filters.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
	const { data, error } = await query.limit(limit);

	if (error) {
		throw new CrudError(error.message, 400);
	}

	return data;
}

export async function createKpiSnapshot(input: KpiSnapshotInput) {
	const { supabase } = await getAuthedSupabase();
	const metrics = await computeKpiMetrics(supabase, input);
	const { data, error } = await supabase
		.from("kpi_snapshots")
		.insert({
			institution_id: input.institution_id,
			domain: input.domain,
			period_type: input.period_type,
			period_start: input.period_start,
			period_end: input.period_end,
			metrics,
		})
		.select()
		.single();

	if (error) {
		throw new CrudError(error.message, 400);
	}

	return data;
}

export async function previewKpiMetrics(input: KpiSnapshotInput) {
	const { supabase } = await getAuthedSupabase();
	return computeKpiMetrics(supabase, input);
}

async function computeKpiMetrics(supabase: SupabaseClient, input: KpiSnapshotInput) {
	assertSupportedDomain(input.domain);

	switch (input.domain) {
		case "academic":
			return computeAcademicMetrics(supabase, input);
		case "finance":
			return computeFinanceMetrics(supabase, input);
		case "hr":
			return computeHrMetrics(supabase, input);
		case "research":
			return computeResearchMetrics(supabase, input);
		case "esg":
			return computeEsgMetrics(supabase, input);
		default:
			throw new CrudError(`Unsupported KPI domain: ${input.domain}.`, 400);
	}
}

async function computeAcademicMetrics(supabase: SupabaseClient, input: KpiSnapshotInput) {
	requirePeriodType("annual", input.period_type, "academic");
	const academicYear = requireField(input.academic_year, "academic_year");

	const { data: summary, error } = await supabase
		.from("v_academic_kpis")
		.select("*")
		.eq("institution_id", input.institution_id)
		.eq("academic_year", academicYear)
		.maybeSingle();

	if (error) {
		throw new CrudError(error.message, 400);
	}

	if (!summary) {
		throw new CrudError("No academic KPI data found for the requested period.", 404);
	}

	const { data: attendanceRows, error: attendanceError } = await supabase
		.from("v_attendance_kpis")
		.select(
			"course_id, course_title, sessions_present, sessions_total, attendance_rate",
		)
		.eq("institution_id", input.institution_id)
		.eq("academic_year", academicYear);

	if (attendanceError) {
		throw new CrudError(attendanceError.message, 400);
	}

	return {
		academic_year: academicYear,
		total_students: summary.total_students,
		total_enrollments: summary.total_enrollments,
		dropout_rate: summary.dropout_rate,
		success_rate: summary.success_rate,
		repetition_rate: summary.repetition_rate,
		attendance_by_course: attendanceRows ?? [],
	};
}

async function computeFinanceMetrics(supabase: SupabaseClient, input: KpiSnapshotInput) {
	requirePeriodType("annual", input.period_type, "finance");
	const fiscalYear = requireField(input.fiscal_year, "fiscal_year");

	const { data: summary, error } = await supabase
		.from("v_finance_kpis_summary")
		.select("*")
		.eq("institution_id", input.institution_id)
		.eq("fiscal_year", fiscalYear)
		.maybeSingle();

	if (error) {
		throw new CrudError(error.message, 400);
	}

	if (!summary) {
		throw new CrudError("No finance KPI data found for the requested period.", 404);
	}

	const { data: departments, error: departmentError } = await supabase
		.from("v_finance_kpis")
		.select("department, dept_allocated, dept_consumed")
		.eq("institution_id", input.institution_id)
		.eq("fiscal_year", fiscalYear);

	if (departmentError) {
		throw new CrudError(departmentError.message, 400);
	}

	const department_breakdown = (departments ?? []).map((row) => ({
		department: row.department,
		dept_allocated: row.dept_allocated,
		dept_consumed: row.dept_consumed,
		execution_rate: computePercent(row.dept_consumed, row.dept_allocated),
	}));

	return {
		fiscal_year: fiscalYear,
		total_allocated: summary.total_allocated,
		total_consumed: summary.total_consumed,
		execution_rate: summary.execution_rate,
		cost_per_student: summary.cost_per_student,
		department_breakdown,
	};
}

async function computeHrMetrics(supabase: SupabaseClient, input: KpiSnapshotInput) {
	const { data, error } = await supabase
		.from("v_hr_kpis")
		.select("*")
		.eq("institution_id", input.institution_id)
		.maybeSingle();

	if (error) {
		throw new CrudError(error.message, 400);
	}

	if (!data) {
		throw new CrudError("No HR KPI data found for the requested institution.", 404);
	}

	return {
		teaching_staff_count: data.teaching_staff_count,
		admin_staff_count: data.admin_staff_count,
		research_staff_count: data.research_staff_count,
		avg_teaching_load: data.avg_teaching_load,
		absenteeism_rate: data.absenteeism_rate,
	};
}

async function computeResearchMetrics(supabase: SupabaseClient, input: KpiSnapshotInput) {
	const { data, error } = await supabase
		.from("v_research_kpis")
		.select("*")
		.eq("institution_id", input.institution_id)
		.maybeSingle();

	if (error) {
		throw new CrudError(error.message, 400);
	}

	if (!data) {
		throw new CrudError("No research KPI data found for the requested institution.", 404);
	}

	return {
		active_projects: data.active_projects,
		total_projects: data.total_projects,
		total_publications: data.total_publications,
		total_patents: data.total_patents,
		total_funding_k: data.total_funding_k,
	};
}

async function computeEsgMetrics(supabase: SupabaseClient, input: KpiSnapshotInput) {
	requirePeriodType("monthly", input.period_type, "esg");

	const { data, error } = await supabase
		.from("v_esg_kpis")
		.select("*")
		.eq("institution_id", input.institution_id)
		.eq("period_start", input.period_start)
		.eq("period_end", input.period_end)
		.maybeSingle();

	if (error) {
		throw new CrudError(error.message, 400);
	}

	if (!data) {
		throw new CrudError("No ESG KPI data found for the requested period.", 404);
	}

	return {
		period_start: data.period_start,
		period_end: data.period_end,
		energy_kwh: data.energy_kwh,
		carbon_kg: data.carbon_kg,
		water_liters: data.water_liters,
		waste_kg: data.waste_kg,
		recycled_kg: data.recycled_kg,
		recycling_rate: data.recycling_rate,
		green_mobility_pct: data.green_mobility_pct,
	};
}

function assertSupportedDomain(domain: KpiDomain) {
	if (!SUPPORTED_DOMAINS.includes(domain)) {
		throw new CrudError(`KPI domain '${domain}' is not supported yet.`, 400);
	}
}

function requirePeriodType(expected: PeriodType, actual: PeriodType, domain: string) {
	if (actual !== expected) {
		throw new CrudError(
			`Domain '${domain}' requires period_type='${expected}'.`,
			400,
		);
	}
}

function requireField(value: string | undefined, field: string) {
	if (!value) {
		throw new CrudError(`'${field}' is required for this KPI domain.`, 400);
	}

	return value;
}

function computePercent(numerator: unknown, denominator: unknown) {
	const num = toNumber(numerator);
	const den = toNumber(denominator);

	if (num === null || den === null || den === 0) {
		return null;
	}

	return Math.round((num / den) * 100 * 100) / 100;
}

function toNumber(value: unknown) {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

function clampInt(value: number | undefined, fallback: number, min: number, max: number) {
	if (value === undefined || Number.isNaN(value)) {
		return fallback;
	}

	return Math.min(Math.max(value, min), max);
}
