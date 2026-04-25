import { NextResponse } from "next/server";

import {
	CrudError,
	getAuthedSupabase,
	readRequestJson,
	unwrapData,
} from "@/lib/db/crud";

type GenerateReportRequest = {
	title: string;
	period_type: string;
	period_start: string;
	period_end: string;
	institution_id?: string;
	organization_id?: string;
};

export async function POST(request: Request) {
	try {
		const { supabase, user } = await getAuthedSupabase();
		const payload = unwrapData<unknown>(await readRequestJson(request));

		if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
			return NextResponse.json(
				{ error: "Request body must be an object." },
				{ status: 400 },
			);
		}

		const {
			title,
			period_type,
			period_start,
			period_end,
			institution_id,
			organization_id,
		} = payload as GenerateReportRequest;

		if (!title || !period_type || !period_start || !period_end) {
			return NextResponse.json(
				{
					error: "title, period_type, period_start, and period_end are required.",
				},
				{ status: 400 },
			);
		}

		if (!institution_id && !organization_id) {
			return NextResponse.json(
				{ error: "institution_id or organization_id is required." },
				{ status: 400 },
			);
		}

		const { data, error } = await supabase
			.from("reports")
			.insert({
				title,
				period_type,
				period_start,
				period_end,
				institution_id: institution_id ?? null,
				organization_id: organization_id ?? null,
				generated_by: user.id,
			})
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		// TODO: Generate report, upload to storage, and update storage_path/status.
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
