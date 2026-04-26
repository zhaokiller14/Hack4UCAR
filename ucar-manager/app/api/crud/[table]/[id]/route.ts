import { NextResponse } from "next/server";

import {
  CrudError,
  getAuthedSupabase,
  getCrudTable,
  isSuperAdminOnly,
  readRequestJson,
  requireSuperAdmin,
  unwrapData,
} from "@/lib/db/crud";

type RouteParams = {
  params: {
    table: string;
    id: string;
  };
};

export async function GET(request: Request, { params }: RouteParams) {
  const table = getCrudTable(params.table);

  if (!table) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  try {
    const { supabase } = await getAuthedSupabase();

    if (isSuperAdminOnly(table)) {
      await requireSuperAdmin(supabase);
    }

    const select = new URL(request.url).searchParams.get("select") ?? "*";
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq("id", params.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleCrudError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const table = getCrudTable(params.table);

  if (!table) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  try {
    const { supabase } = await getAuthedSupabase();

    if (isSuperAdminOnly(table)) {
      await requireSuperAdmin(supabase);
    }

    const payload = unwrapData<unknown>(await readRequestJson(request));

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json(
        { error: "Request body must be an object." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", params.id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleCrudError(error);
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const table = getCrudTable(params.table);

  if (!table) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  try {
    const { supabase } = await getAuthedSupabase();

    if (isSuperAdminOnly(table)) {
      await requireSuperAdmin(supabase);
    }

    const { error } = await supabase.from(table).delete().eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return new NextResponse(null, { status: 204 });
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
