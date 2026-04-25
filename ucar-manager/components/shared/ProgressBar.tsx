import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  target?: string;
  className?: string;
}

export default function ProgressBar({ label, value, target, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color =
    clamped >= 80 ? "bg-[#2E7D32]" : clamped >= 50 ? "bg-[#1B4F6B]" : "bg-[#C8A74B]";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="font-medium text-[#1B1C1A]">{label}</span>
        <span className="text-slate-500">
          {clamped}%{target ? ` / ${target}` : ""}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
