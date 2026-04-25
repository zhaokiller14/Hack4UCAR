import { NextResponse } from "next/server";

import type { KpiSnapshotInput } from "@/lib/kpi";

import { createKpiSnapshot } from "@/lib/kpi";
import {
	CrudError,
	getAuthedSupabase,
	parseListParams,
	readRequestJson,
	unwrapData,
} from "@/lib/db/crud";

type SnapshotCreateRequest = {
	institution_id: string;
	domain: string;
	period_type: string;
	period_start: string;
	period_end: string;
	academic_year?: string;
	fiscal_year?: string;
};

export async function GET(request: Request) {
	try {
		const { supabase } = await getAuthedSupabase();
		const url = new URL(request.url);
		const { select, limit, offset, order, ascending } = parseListParams(url);

		let query = supabase
			.from("kpi_snapshots")
			.select(select, { count: "exact" });

		const domain = url.searchParams.get("domain");
		const periodType = url.searchParams.get("period_type");
		const periodStart = url.searchParams.get("period_start");
		const institutionId = url.searchParams.get("institution_id");

		if (domain) {
			query = query.eq("domain", domain);
		}

		if (periodType) {
			query = query.eq("period_type", periodType);
		}

		if (periodStart) {
			query = query.eq("period_start", periodStart);
		}

		if (institutionId) {
			query = query.eq("institution_id", institutionId);
		}

		if (order) {
			query = query.order(order, { ascending });
		}

		const rangeEnd = offset + limit - 1;
		const { data, error, count } = await query.range(offset, rangeEnd);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ data, count, limit, offset });
	} catch (error) {
		return handleCrudError(error);
	}
}

export async function POST(request: Request) {
	try {
		const payload = unwrapData<unknown>(await readRequestJson(request));

		if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
			return NextResponse.json(
				{ error: "Request body must be an object." },
				{ status: 400 },
			);
		}

		const {
			institution_id,
			domain,
			period_type,
			period_start,
			period_end,
			academic_year,
			fiscal_year,
		} = payload as SnapshotCreateRequest;

		if (!institution_id || !domain || !period_type || !period_start || !period_end) {
			return NextResponse.json(
				{
					error:
						"institution_id, domain, period_type, period_start, and period_end are required.",
				},
				{ status: 400 },
			);
		}

		const data = await createKpiSnapshot({
			institution_id,
			domain,
			period_type,
			period_start,
			period_end,
			academic_year,
			fiscal_year,
		} as KpiSnapshotInput);

		return NextResponse.json({ data }, { status: 201 });
	} catch (error) {
		return handleCrudError(error);
	}
}

function handleCrudError(error: unknown) {
	if (error instanceof CrudError) {
		return NextResponse.json({ error: error.message }, { status: error.status });
	}

	return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
}
