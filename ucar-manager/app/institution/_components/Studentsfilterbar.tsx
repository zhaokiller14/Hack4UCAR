"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

type Option = { value: string; label: string };

interface StudentsFilterBarProps {
  statusOptions: Option[];
  currentQ: string;
  currentStatus: string;
  currentYear: string;
}

const YEAR_OPTIONS = [
  { value: "1", label: "L1" },
  { value: "2", label: "L2" },
  { value: "3", label: "L3" },
  { value: "4", label: "M1" },
  { value: "5", label: "M2" },
];

export default function StudentsFilterBar({
  statusOptions,
  currentQ,
  currentStatus,
  currentYear,
}: StudentsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      for (const [k, v] of Object.entries(updates)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams],
  );

  const hasFilters = !!(currentQ || currentStatus || currentYear);

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-48 flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom ou spécialisation…"
            defaultValue={currentQ}
            onChange={(e) => push({ q: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B4F6B] focus:ring-2 focus:ring-[#1B4F6B]/10 transition"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Statut
          </span>
          <div className="flex flex-wrap gap-1">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  push({ status: currentStatus === opt.value ? "" : opt.value })
                }
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                  currentStatus === opt.value
                    ? "border-[#1B4F6B] bg-[#1B4F6B] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Year */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400">Année</span>
          <div className="flex gap-1">
            {YEAR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  push({ year: currentYear === opt.value ? "" : opt.value })
                }
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                  currentYear === opt.value
                    ? "border-[#1B4F6B] bg-[#1B4F6B] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => push({ q: "", status: "", year: "" })}
            className="ml-auto rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
