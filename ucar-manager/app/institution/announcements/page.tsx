import { requireInstitutionRole } from "@/lib/auth/guards";
import { getAnnouncements } from "@/lib/data/announcements";

const AUDIENCE_FR: Record<string, string> = {
  all:                    "Tous",
  institution_admin:      "Directeurs d'établissement",
  finance_manager:        "Responsables finance",
  hr_manager:             "Responsables RH",
  academic_manager:       "Responsables académiques",
  research_manager:       "Responsables recherche",
  partnerships_manager:   "Responsables partenariats",
  esg_manager:            "Responsables ESG",
  infrastructure_manager: "Responsables infrastructure",
  viewer:                 "Observateurs",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? "s" : ""}`;
  return new Date(dateStr).toLocaleDateString("fr-TN", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function InstitutionAnnouncements() {
  const ctx = await requireInstitutionRole();
  const announcements = ctx.role
    ? await getAnnouncements(ctx.role)
    : [];

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Annonces</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {announcements.length} annonce{announcements.length !== 1 ? "s" : ""} publiée{announcements.length !== 1 ? "s" : ""}
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-sm border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
          Aucune annonce disponible pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-sm border border-[#003850]/10 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base font-semibold text-[#1B1C1A]">{a.title}</h2>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-sm border border-[#003850]/20 bg-[#003850]/5 px-2 py-0.5 text-[11px] font-medium text-[#003850]">
                    {AUDIENCE_FR[a.audience] ?? a.audience}
                  </span>
                  {a.published_at && (
                    <span className="text-xs text-slate-400">{timeAgo(a.published_at)}</span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
