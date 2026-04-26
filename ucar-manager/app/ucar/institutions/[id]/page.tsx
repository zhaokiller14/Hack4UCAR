import Link from "next/link";
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
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">{institution.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {institution.code} · {institution.city}
          </p>
        </div>
        <Link
          href={`/ucar/institutions/${institution.id}/edit`}
          className="rounded-sm bg-[#003850] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1B4F6B]"
        >
          Modifier
        </Link>
      </div>

      <div className="overflow-hidden rounded-sm border border-[#003850]/10 bg-white">
        <dl className="grid gap-0 text-sm">
          <div className="flex items-center justify-between border-b border-[#003850]/10 px-4 py-3">
            <dt className="text-slate-500">Président</dt>
            <dd className="font-medium text-[#1B1C1A]">{institution.president_name ?? "N/A"}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-[#003850]/10 px-4 py-3">
            <dt className="text-slate-500">Contact</dt>
            <dd className="font-medium text-[#1B1C1A]">{institution.contact_email ?? "N/A"}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-[#003850]/10 px-4 py-3">
            <dt className="text-slate-500">Statut</dt>
            <dd className="font-medium text-[#1B1C1A]">
              {institution.is_active ? "Active" : "Inactive"}
            </dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-slate-500">Créé le</dt>
            <dd className="font-medium text-[#1B1C1A]">
              {new Date(institution.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <Link
          href="/ucar/institutions"
          className="text-sm font-medium text-[#1B4F6B] hover:underline"
        >
          ← Retour à la liste
        </Link>
      </div>
    </main>
  );
}
