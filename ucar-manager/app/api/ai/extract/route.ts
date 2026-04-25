import { NextResponse } from "next/server";

import {
	CrudError,
	getAuthedSupabase,
	readRequestJson,
	unwrapData,
} from "@/lib/db/crud";

type ExtractRequest = {
	institution_id: string;
	file_name: string;
	file_type: string;
	storage_path: string;
	domain?: string;
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

		const { institution_id, file_name, file_type, storage_path, domain } =
			payload as ExtractRequest;

		if (!institution_id || !file_name || !file_type || !storage_path) {
			return NextResponse.json(
				{
					error:
						"institution_id, file_name, file_type, and storage_path are required.",
				},
				{ status: 400 },
			);
		}

		const { data, error } = await supabase
			.from("raw_uploads")
			.insert({
				institution_id,
				uploaded_by: user.id,
				file_name,
				file_type,
				storage_path,
				domain,
			})
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		// TODO: Trigger extraction pipeline and populate extracted_records.
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
