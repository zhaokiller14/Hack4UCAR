import { Upload } from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";
import StatusBadge from "@/components/shared/StatusBadge";

export interface UploadItem {
  id: string;
  institution_name: string;
  file_name: string;
  domain: string;
  status: string;
  created_at: string;
}

const DOMAIN_FR: Record<string, string> = {
  academic:       "Académique",
  finance:        "Finance",
  hr:             "RH",
  esg:            "ESG",
  research:       "Recherche",
  partnerships:   "Partenariats",
  infrastructure: "Infrastructure",
};

export default function UploadActivityFeed({ uploads }: { uploads: UploadItem[] }) {
  return (
    <SectionCard title="Activité de dépôt" description="10 derniers fichiers déposés sur le réseau">
      {uploads.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Aucun dépôt</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {uploads.map((upload) => (
            <li key={upload.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Upload className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1B1C1A] truncate">{upload.file_name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {upload.institution_name} · {DOMAIN_FR[upload.domain] ?? upload.domain}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StatusBadge status={upload.status} />
                <span className="text-[11px] text-slate-400">
                  {new Date(upload.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
