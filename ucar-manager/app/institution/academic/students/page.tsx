import Link from "next/link";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { getStudents } from "@/lib/data/academic";
import StudentTable from "@/components/institution/StudentTable";
import SectionCard from "@/components/shared/SectionCard";

const PAGE_SIZE = 20;

export default async function InstitutionStudents({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { institutionId } = await requireInstitutionRole();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  if (!institutionId) {
    return (
      <div className="p-8 text-sm text-slate-500">Institution introuvable.</div>
    );
  }

  const { data: students, total } = await getStudents(institutionId, page, PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/institution/academic" className="hover:text-[#003850] transition-colors">
              Académique
            </Link>
            <span>/</span>
            <span className="text-slate-600">Étudiants</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">Étudiants</h1>
          <p className="mt-0.5 text-sm text-slate-500">{total} étudiant{total !== 1 ? "s" : ""} enregistré{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <SectionCard title="Liste des étudiants" description="Triés par nom alphabétique">
        <StudentTable students={students} total={total} page={page} pageSize={PAGE_SIZE} />
      </SectionCard>
    </div>
  );
}
