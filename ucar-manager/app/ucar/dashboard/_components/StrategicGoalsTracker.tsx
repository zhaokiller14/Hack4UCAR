import SectionCard from "@/components/shared/SectionCard";
import ProgressBar from "@/components/shared/ProgressBar";

export interface GoalItem {
  id: string;
  title: string;
  domain: string;
  progress: number;
  target_label: string;
}

const DOMAIN_FR: Record<string, string> = {
  academic:   "Académique",
  finance:    "Finance",
  hr:         "Ressources humaines",
  esg:        "ESG",
  research:   "Recherche",
};

export default function StrategicGoalsTracker({ goals }: { goals: GoalItem[] }) {
  return (
    <SectionCard title="Objectifs stratégiques" description="Cibles UCAR et progression actuelle">
      {goals.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Aucun objectif configuré</p>
      ) : (
        <ul className="space-y-4">
          {goals.map((goal) => (
            <li key={goal.id}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {DOMAIN_FR[goal.domain] ?? goal.domain}
              </p>
              <ProgressBar label={goal.title} value={goal.progress} target={goal.target_label} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
