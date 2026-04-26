import { NextResponse } from "next/server";

import { isInstitutionRole } from "@/lib/auth/roles";
import { CrudError, getAuthedSupabase } from "@/lib/db/crud";
import { uploadToS3 } from "@/lib/storage/s3";

type UserRoleRow = {
  role: string | null;
  institution_id: string | null;
};

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthedSupabase();

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("role, institution_id")
      .eq("id", user.id)
      .maybeSingle<UserRoleRow>();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    const role = userRow?.role;
    const isUcarAdmin = role === "ucar_admin" || role === "super_admin";
    const isInstitutionScopedRole = isInstitutionRole(role) || role === "admin";

    if (!isInstitutionScopedRole && !isUcarAdmin) {
      return NextResponse.json(
        { error: "Forbidden: role is not allowed to upload files." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const institutionIdRaw = formData.get("institution_id");
    const domainRaw = formData.get("domain");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required." }, { status: 400 });
    }

    if (typeof institutionIdRaw !== "string" || !institutionIdRaw.trim()) {
      return NextResponse.json(
        { error: "institution_id is required." },
        { status: 400 },
      );
    }

    const institutionId = institutionIdRaw.trim();
    const domain = typeof domainRaw === "string" && domainRaw.trim() ? domainRaw.trim() : null;

    // Institution-scoped roles are limited to their own institution uploads.
    if (isInstitutionScopedRole && userRow?.institution_id !== institutionId) {
      return NextResponse.json(
        { error: "Forbidden: institution scope mismatch." },
        { status: 403 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await uploadToS3({
      fileBuffer: buffer,
      contentType: file.type || "application/octet-stream",
      originalFileName: file.name,
      institutionId,
      userId: user.id,
    });

    const { data: rawUpload, error: insertError } = await supabase
      .from("raw_uploads")
      .insert({
        institution_id: institutionId,
        uploaded_by: user.id,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        storage_path: upload.key,
        domain,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // TODO: Trigger AI extraction endpoint (python-ai/extract) with raw_uploads id and storage metadata.
    // TODO: Persist extraction pipeline status and extracted_records lifecycle updates.

    return NextResponse.json(
      {
        data: {
          raw_upload: rawUpload,
          s3: upload,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleCrudError(error);
  }
}

function handleCrudError(error: unknown) {
  if (error instanceof CrudError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
}
