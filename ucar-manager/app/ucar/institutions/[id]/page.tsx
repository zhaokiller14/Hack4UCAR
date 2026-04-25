import { notFound } from "next/navigation";

import { getInstitutionById } from "@/lib/data/institutions";

type InstitutionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InstitutionDetailPage({
  params,
}: InstitutionDetailPageProps) {
  const { id } = await params;
  const institution = await getInstitutionById(id);

  if (!institution) {
    notFound();
  }

  // TODO: Add KPI summary, alerts, and related module links.
  return (
    <main className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{institution.name}</h1>
        <p className="text-sm text-muted-foreground">
          {institution.code} · {institution.city}
        </p>
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">President</dt>
          <dd>{institution.president_name ?? "N/A"}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Contact</dt>
          <dd>{institution.contact_email ?? "N/A"}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Status</dt>
          <dd>{institution.is_active ? "Active" : "Inactive"}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Created</dt>
          <dd>{new Date(institution.created_at).toLocaleDateString()}</dd>
        </div>
      </dl>
    </main>
  );
}
