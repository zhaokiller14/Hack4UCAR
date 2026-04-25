import { NextResponse } from "next/server";

import { CrudError, getAuthedSupabase } from "@/lib/db/crud";

export async function POST() {
	try {
		await getAuthedSupabase();

		// TODO: Integrate python-ai chat and persist conversations once table exists.
		return NextResponse.json(
			{ error: "AI chat is not implemented." },
			{ status: 501 },
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
