"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface CoursesFilterBarProps {
  currentQ: string;
  currentSemester: string;
  currentYear: string;
}

const SEMESTER_OPTIONS = [
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
  { value: "S4", label: "S4" },
  { value: "S5", label: "S5" },
  { value: "S6", label: "S6" },
];

export default function CoursesFilterBar({
  currentQ,
  currentSemester,
  currentYear,
}: CoursesFilterBarProps) {
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

  const hasFilters = !!(currentQ || currentSemester || currentYear);

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
            placeholder="Rechercher par intitulé ou spécialisation…"
            defaultValue={currentQ}
            onChange={(e) => push({ q: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B4F6B] focus:ring-2 focus:ring-[#1B4F6B]/10 transition"
          />
        </div>

        {/* Semester */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Semestre
          </span>
          <div className="flex flex-wrap gap-1">
            {SEMESTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  push({
                    semester: currentSemester === opt.value ? "" : opt.value,
                  })
                }
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                  currentSemester === opt.value
                    ? "border-[#1B4F6B] bg-[#1B4F6B] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Academic year */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Année
          </span>
          <input
            type="text"
            placeholder="ex: 2025-2026"
            defaultValue={currentYear}
            onChange={(e) => push({ year: e.target.value })}
            className="w-32 rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B4F6B] focus:ring-2 focus:ring-[#1B4F6B]/10 transition"
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => push({ q: "", semester: "", year: "" })}
            className="ml-auto rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
