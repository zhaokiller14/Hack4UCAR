import { NextResponse } from "next/server";

import {
  CrudError,
  getAuthedSupabase,
  getCrudTable,
  isSuperAdminOnly,
  parseListParams,
  readRequestJson,
  requireSuperAdmin,
  unwrapData,
} from "@/lib/db/crud";

type RouteParams = {
  params: Promise<{
    table: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { table: tableParam } = await params;
  const table = getCrudTable(tableParam);

  if (!table) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  try {
    const { supabase } = await getAuthedSupabase();

    if (isSuperAdminOnly(table)) {
      await requireSuperAdmin(supabase);
    }

    const { select, limit, offset, order, ascending } = parseListParams(
      new URL(request.url),
    );

    let query = supabase.from(table).select(select, { count: "exact" });

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

export async function POST(request: Request, { params }: RouteParams) {
  const { table: tableParam } = await params;
  const table = getCrudTable(tableParam);

  if (!table) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  try {
    const { supabase } = await getAuthedSupabase();

    if (isSuperAdminOnly(table)) {
      await requireSuperAdmin(supabase);
    }

    const payload = unwrapData<unknown>(await readRequestJson(request));

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Request body must be an object or array." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.from(table).insert(payload).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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
