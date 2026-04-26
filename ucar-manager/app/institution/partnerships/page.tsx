import { requireInstitutionRole } from "@/lib/auth/guards";
import { getPartnerships, getPartnershipsKpis } from "@/lib/data/partnerships";
import {
  createPartnership,
  deletePartnership,
  updatePartnership,
} from "@/lib/actions/partnerships";
import type { PartnershipInput } from "@/lib/actions/partnerships";
import PartnershipsTable from "@/components/institution/PartnershipsTable";
import SectionCard from "@/components/shared/SectionCard";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "partnerships_manager",
]);

export default async function InstitutionPartnerships({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const userContext = await requireInstitutionRole();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { institutionId } = userContext;

  const base = getInstitutionDomainDashboard("partnerships");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const institutionIdValue = institutionId;

  const [row, partnershipsResult] = await Promise.all([
    getPartnershipsKpis(institutionIdValue),
    getPartnerships(institutionIdValue, page, PAGE_SIZE),
  ]);

  const canWrite = WRITE_ROLES.has(userContext.role ?? "");

  const kpis = row
    ? [
        {
          title: "Partenariats actifs",
          value:
            row.active_partnerships !== null
              ? row.active_partnerships.toLocaleString("fr-TN")
              : "—",
          delta: `sur ${row.total_partnerships ?? "—"} total`,
          accentColor: "#1B4F6B",
        },
        {
          title: "Mobilité sortante",
          value:
            row.total_outgoing_students !== null
              ? row.total_outgoing_students.toLocaleString("fr-TN")
              : "—",
          delta: `${row.total_incoming_students ?? "—"} entrants`,
          accentColor: "#2E7D32",
        },
        {
          title: "Partenariats internationaux",
          value:
            row.international_partnerships !== null
              ? row.international_partnerships.toLocaleString("fr-TN")
              : "—",
          delta: "hors Tunisie",
          accentColor: "#1B4F6B",
        },
        {
          title: "Académique / Industrie",
          value: `${row.academic_partnerships ?? "—"} / ${
            row.industry_partnerships ?? "—"
          }`,
          delta: "acad. · industrie",
          accentColor: "#C8A74B",
        },
      ]
    : undefined;

  async function handleCreate(_institutionId: string, input: PartnershipInput) {
    "use server";
    return createPartnership(institutionIdValue, input);
  }

  async function handleUpdate(partnershipId: string, input: PartnershipInput) {
    "use server";
    return updatePartnership(partnershipId, input);
  }

  async function handleDelete(partnershipId: string) {
    "use server";
    return deletePartnership(partnershipId);
  }

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />

      <div className="space-y-6 px-8 pb-8">
        <SectionCard
          title="Partenariats"
          description="Partenariats académiques, industriels, gouvernementaux et ONG"
        >
          <PartnershipsTable
            rows={partnershipsResult.data}
            total={partnershipsResult.total}
            page={page}
            pageSize={PAGE_SIZE}
            institutionId={institutionIdValue}
            canWrite={canWrite}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </SectionCard>
      </div>
    </>
  );
}
