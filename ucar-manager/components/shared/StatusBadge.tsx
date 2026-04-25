import { cn } from "@/lib/utils";

type Status = "pending" | "processing" | "completed" | "failed";

const FR_LABEL: Record<Status, string> = {
  pending:    "En attente",
  processing: "En cours",
  completed:  "Terminé",
  failed:     "Échoué",
};

const styles: Record<Status, string> = {
  pending:    "bg-slate-100 text-slate-600 border-slate-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed:  "bg-green-100 text-green-700 border-green-200",
  failed:     "bg-red-100 text-red-700 border-red-200",
};

export default function StatusBadge({ status }: { status: string }) {
  const s = (status as Status) in styles ? (status as Status) : "pending";
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide", styles[s])}>
      {FR_LABEL[s]}
    </span>
  );
}
