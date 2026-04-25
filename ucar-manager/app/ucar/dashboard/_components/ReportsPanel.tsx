import { FileText, Download } from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";

export interface ReportItem {
  id: string;
  title: string;
  institution_name: string;
  storage_path: string;
  created_at: string;
}

export default function ReportsPanel({ reports }: { reports: ReportItem[] }) {
  return (
    <SectionCard title="Rapports disponibles" description="Rapports générés prêts au téléchargement">
      {reports.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Aucun rapport disponible</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {reports.map((report) => (
            <li key={report.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1B1C1A] truncate">{report.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {report.institution_name} ·{" "}
                  {new Date(report.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <a
                href={report.storage_path}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#003850]/20 text-[#1B4F6B] rounded-sm hover:bg-[#003850]/5 transition-colors shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </a>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
