import { cn } from "@/lib/utils";
import { FR } from "@/lib/i18n";

type Severity = "critical" | "high" | "medium" | "low";

const styles: Record<Severity, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  low:      "bg-blue-100 text-blue-700 border-blue-200",
};

export default function SeverityBadge({ severity }: { severity: string }) {
  const s = (severity as Severity) in styles ? (severity as Severity) : "low";
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wider", styles[s])}>
      {FR.severity[s].toUpperCase()}
    </span>
  );
}
