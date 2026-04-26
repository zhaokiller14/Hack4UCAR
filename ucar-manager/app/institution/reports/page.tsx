import { requireInstitutionRole } from "@/lib/auth/guards";
import { getReports } from "@/lib/data/reports";
import SectionCard from "@/components/shared/SectionCard";

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  generating: "En cours",
  ready: "Prêt",
  failed: "Échoué",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "text-slate-500 bg-slate-100",
  generating: "text-blue-700 bg-blue-50",
  ready: "text-green-700 bg-green-50",
  failed: "text-red-700 bg-red-50",
};

const PERIOD_LABEL: Record<string, string> = {
  monthly: "Mensuel",
  semester: "Semestriel",
  annual: "Annuel",
};

export default async function InstitutionReports() {
  const ctx = await requireInstitutionRole();

  if (!ctx.institutionId) {
    return <div className="p-8 text-sm text-slate-500">Institution introuvable.</div>;
  }

  const { data: reports, error } = await getReports(ctx.institutionId);

  if (error) {
    return (
      <div className="p-8">
        <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Rapports</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {reports.length} rapport{reports.length !== 1 ? "s" : ""} générés
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Aucun rapport disponible pour cette institution.
        </div>
      ) : (
        <SectionCard
          title="Rapports générés"
          description="Historique des rapports périodiques de l'institution"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#003850]/10 bg-[#FAF9F6]">
                <tr>
                  {["Titre", "Type", "Période", "Statut", "Généré le", "Fichier"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reports.map((report) => (
                  <tr key={report.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-[#1B1C1A]">{report.title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {PERIOD_LABEL[report.period_type] ?? report.period_type}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(report.period_start).toLocaleDateString("fr-TN")}
                      {" — "}
                      {new Date(report.period_end).toLocaleDateString("fr-TN")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[report.status] ?? "text-slate-600 bg-slate-100"}`}
                      >
                        {STATUS_LABEL[report.status] ?? report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(report.generated_at).toLocaleDateString("fr-TN")}
                    </td>
                    <td className="px-4 py-3">
                      {report.storage_path ? (
                        <a
                          href={`/api/reports/download?path=${encodeURIComponent(report.storage_path)}`}
                          className="text-xs font-medium text-[#1B4F6B] hover:underline"
                        >
                          Télécharger
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
