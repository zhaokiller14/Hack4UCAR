import { NextResponse } from "next/server";

import { isInstitutionRole } from "@/lib/auth/roles";
import { CrudError, getAuthedSupabase, readRequestJson, unwrapData } from "@/lib/db/crud";

type ExtractRequest = {
	raw_upload_id: string;
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

		const { raw_upload_id } = payload as ExtractRequest;

		if (!raw_upload_id) {
			return NextResponse.json(
				{ error: "raw_upload_id is required." },
				{ status: 400 },
			);
		}

		const { data: userRow, error: userError } = await supabase
			.from("users")
			.select("role, institution_id")
			.eq("id", user.id)
			.maybeSingle<{ role: string | null; institution_id: string | null }>();

		if (userError) {
			return NextResponse.json({ error: userError.message }, { status: 400 });
		}

		const role = userRow?.role;
		const isUcarAdmin = role === "ucar_admin" || role === "super_admin";
		const isInstitutionScopedRole = isInstitutionRole(role) || role === "admin";

		if (!isInstitutionScopedRole && !isUcarAdmin) {
			return NextResponse.json(
				{ error: "Forbidden: role is not allowed to trigger extraction." },
				{ status: 403 },
			);
		}

		const { data: rawUpload, error: rawUploadError } = await supabase
			.from("raw_uploads")
			.select("id, institution_id, storage_path, file_name, file_type")
			.eq("id", raw_upload_id)
			.maybeSingle();

		if (rawUploadError) {
			return NextResponse.json({ error: rawUploadError.message }, { status: 400 });
		}

		if (!rawUpload) {
			return NextResponse.json({ error: "raw_upload not found." }, { status: 404 });
		}

		if (
			isInstitutionScopedRole &&
			userRow?.institution_id !== rawUpload.institution_id
		) {
			return NextResponse.json(
				{ error: "Forbidden: institution scope mismatch." },
				{ status: 403 },
			);
		}

		// TODO: Call python-ai extraction endpoint with rawUpload metadata.
		// TODO: Update raw_uploads processing state and write extracted_records.
		return NextResponse.json(
			{
				data: {
					raw_upload: rawUpload,
					status: "queued",
					message: "Extraction trigger placeholder. AI call not implemented yet.",
				},
			},
			{ status: 202 },
		);
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
