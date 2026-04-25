import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  description,
  children,
  action,
  className,
}: SectionCardProps) {
  return (
    <div className={cn("bg-white border border-[#003850]/10 rounded-sm flex flex-col", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#003850]/10 bg-[#FAF9F6]">
        <div>
          <h3 className="text-[18px] font-medium leading-snug text-[#1B1C1A]">{title}</h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
