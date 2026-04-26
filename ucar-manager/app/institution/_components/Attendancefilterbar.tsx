"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface AttendanceFilterBarProps {
  currentQ: string;
  currentPresent: string;
  currentDateFrom: string;
  currentDateTo: string;
}

const PRESENCE_OPTIONS = [
  { value: "true", label: "Présent" },
  { value: "false", label: "Absent" },
];

export default function AttendanceFilterBar({
  currentQ,
  currentPresent,
  currentDateFrom,
  currentDateTo,
}: AttendanceFilterBarProps) {
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

  const hasFilters = !!(
    currentQ ||
    currentPresent ||
    currentDateFrom ||
    currentDateTo
  );

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
            placeholder="Rechercher par nom ou note…"
            defaultValue={currentQ}
            onChange={(e) => push({ q: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B4F6B] focus:ring-2 focus:ring-[#1B4F6B]/10 transition"
          />
        </div>

        {/* Presence status */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Statut
          </span>
          <div className="flex gap-1">
            {PRESENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  push({
                    present: currentPresent === opt.value ? "" : opt.value,
                  })
                }
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                  currentPresent === opt.value
                    ? opt.value === "true"
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-red-500 bg-red-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Période
          </span>
          <input
            type="date"
            defaultValue={currentDateFrom}
            onChange={(e) => push({ dateFrom: e.target.value })}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 outline-none focus:border-[#1B4F6B] focus:ring-2 focus:ring-[#1B4F6B]/10 transition"
          />
          <span className="text-xs text-slate-400">—</span>
          <input
            type="date"
            defaultValue={currentDateTo}
            onChange={(e) => push({ dateTo: e.target.value })}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 outline-none focus:border-[#1B4F6B] focus:ring-2 focus:ring-[#1B4F6B]/10 transition"
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() =>
              push({ q: "", present: "", dateFrom: "", dateTo: "" })
            }
            className="ml-auto rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
