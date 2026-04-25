import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { KpiDomain, KpiSnapshotInput, PeriodType } from "@/lib/kpi";
import { createKpiSnapshot, previewKpiMetrics } from "@/lib/kpi";
import { CrudError, getAuthedSupabase } from "@/lib/db/crud";

const DEFAULT_ACADEMIC_START = "09-01";
const DEFAULT_ACADEMIC_END = "06-30";
const DEFAULT_FISCAL_START = "01-01";
const DEFAULT_FISCAL_END = "12-31";

export async function GET(request: Request) {
	try {
		const { supabase, user } = await getAuthedSupabase();
		const url = new URL(request.url);
		const domain = (url.searchParams.get("domain") ?? "academic") as KpiDomain;
		const periodType = (url.searchParams.get("period_type") ??
			defaultPeriodType(domain)) as PeriodType;
		const academicYear = url.searchParams.get("academic_year") ?? undefined;
		const fiscalYear = url.searchParams.get("fiscal_year") ?? undefined;
		const persist = url.searchParams.get("persist") === "true";
		const institutionId =
			url.searchParams.get("institution_id") ??
			(await resolveInstitutionId(supabase, user.id));
		const { period_start, period_end } = resolvePeriod(
			url.searchParams,
			academicYear,
			fiscalYear,
		);

		const input: KpiSnapshotInput = {
			institution_id: institutionId,
			domain,
			period_type: periodType,
			period_start,
			period_end,
			academic_year: academicYear,
			fiscal_year: fiscalYear,
		};

		if (persist) {
			const data = await createKpiSnapshot(input);
			return NextResponse.json({ data, persisted: true });
		}

		const metrics = await previewKpiMetrics(input);
		return NextResponse.json({ data: { ...input, metrics }, persisted: false });
	} catch (error) {
		return handleCrudError(error);
	}
}

async function resolveInstitutionId(supabase: SupabaseClient, userId: string) {
	const { data: authData } = await supabase.auth.getUser();
	const authUser = authData?.user;

	const metadataInstitutionId = authUser?.user_metadata?.institution_id;
	if (metadataInstitutionId && typeof metadataInstitutionId === "string") {
		return metadataInstitutionId;
	}

		const { data, error } = await supabase
			.from("users")
			.select("institution_id", { count: "exact" })
			.eq("id", userId)
			.limit(2);

		if (error) {
			throw new CrudError(error.message, 400);
		}

		if (data && data.length === 1 && data[0]?.institution_id) {
			return data[0].institution_id;
		}

	throw new CrudError(
		"institution_id is required for this user. Pass institution_id explicitly in the query string or add institution_id to the user's metadata/row.",
		400,
	);
}

function defaultPeriodType(domain: KpiDomain): PeriodType {
	if (domain === "esg") {
		return "monthly";
	}

	return "annual";
}

function resolvePeriod(
	params: URLSearchParams,
	academicYear?: string,
	fiscalYear?: string,
) {
	const periodStart = params.get("period_start");
	const periodEnd = params.get("period_end");

	if (periodStart && periodEnd) {
		return { period_start: periodStart, period_end: periodEnd };
	}

	if (academicYear) {
		return deriveAcademicYearPeriod(academicYear);
	}

	if (fiscalYear) {
		return deriveFiscalYearPeriod(fiscalYear);
	}

	const currentYear = new Date().getUTCFullYear();
	return {
		period_start: `${currentYear}-${DEFAULT_FISCAL_START}`,
		period_end: `${currentYear}-${DEFAULT_FISCAL_END}`,
	};
}

function deriveAcademicYearPeriod(academicYear: string) {
	const match = /^(\d{4})-(\d{4})$/.exec(academicYear);

	if (!match) {
		throw new CrudError("academic_year must look like 2024-2025.", 400);
	}

	return {
		period_start: `${match[1]}-${DEFAULT_ACADEMIC_START}`,
		period_end: `${match[2]}-${DEFAULT_ACADEMIC_END}`,
	};
}

function deriveFiscalYearPeriod(fiscalYear: string) {
	const match = /^(\d{4})$/.exec(fiscalYear);

	if (!match) {
		throw new CrudError("fiscal_year must look like 2024.", 400);
	}

	return {
		period_start: `${match[1]}-${DEFAULT_FISCAL_START}`,
		period_end: `${match[1]}-${DEFAULT_FISCAL_END}`,
	};
}

function handleCrudError(error: unknown) {
	if (error instanceof CrudError) {
		return NextResponse.json({ error: error.message }, { status: error.status });
	}

	return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
}
