import { getAuthedSupabase } from "@/lib/db/crud";

export type KpiSnapshotFilters = {
	domain?: string;
	period_type?: string;
	period_start?: string;
	institution_id?: string;
	limit?: number;
};

export type KpiSnapshotInput = {
	institution_id: string;
	domain: string;
	period_type: string;
	period_start: string;
	period_end: string;
	metrics?: Record<string, unknown>;
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

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
		throw new Error(error.message);
	}

	return data;
}

export async function createKpiSnapshot(input: KpiSnapshotInput) {
	const { supabase } = await getAuthedSupabase();
	const { data, error } = await supabase
		.from("kpi_snapshots")
		.insert({
			institution_id: input.institution_id,
			domain: input.domain,
			period_type: input.period_type,
			period_start: input.period_start,
			period_end: input.period_end,
			metrics: input.metrics ?? {},
		})
		.select()
		.single();

	if (error) {
		throw new Error(error.message);
	}

	// TODO: Compute metrics server-side instead of accepting client input.
	return data;
}

function clampInt(value: number | undefined, fallback: number, min: number, max: number) {
	if (value === undefined || Number.isNaN(value)) {
		return fallback;
	}

	return Math.min(Math.max(value, min), max);
}
