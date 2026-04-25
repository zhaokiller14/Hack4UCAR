import { cn } from "@/lib/utils";

interface KpiSummaryCardProps {
  title: string;
  value: string;
  sub: string;
  accentColor?: string;
  trend?: "up" | "down" | "neutral";
}

export default function KpiSummaryCard({
  title,
  value,
  sub,
  accentColor = "#1B4F6B",
  trend = "neutral",
}: KpiSummaryCardProps) {
  return (
    <div className="relative bg-white border border-[#003850]/10 rounded-sm p-4 flex flex-col gap-2 overflow-hidden">
      {/* top color bar */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accentColor }} />

      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">{title}</p>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-[36px] font-medium tracking-tight leading-none text-[#1B1C1A]">
          {value}
        </span>
        <span className={cn(
          "text-xs flex items-center gap-0.5",
          trend === "up" && "text-[#2E7D32]",
          trend === "down" && "text-[#BA1A1A]",
          trend === "neutral" && "text-slate-400",
        )}>
          {trend === "up" && "▲"}
          {trend === "down" && "▼"}
          {trend === "neutral" && "—"}
          {sub}
        </span>
      </div>
    </div>
  );
}
