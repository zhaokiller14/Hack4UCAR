"use client";

import { useState, useMemo } from "react";

type GoalRow = {
  id: string;
  institution_id: string | null;
  domain: string;
  kpi_key: string;
  target_value: number;
  academic_year: string;
  description: string | null;
  scope: string;
  created_at: string;
  institutions: { name: string | null } | null;
};

const DOMAIN_META: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  academic: {
    label: "Académique",
    color: "#1B4F6B",
    bg: "#EBF4FA",
    icon: "🎓",
  },
  hr: { label: "RH", color: "#7B3F9E", bg: "#F5EEF8", icon: "👥" },
  finance: { label: "Finance", color: "#2E7D32", bg: "#EBF5EB", icon: "💰" },
  research: { label: "Recherche", color: "#C0392B", bg: "#FDEDEC", icon: "🔬" },
  esg: { label: "ESG", color: "#D4860A", bg: "#FEF9E7", icon: "🌿" },
};

function domainMeta(domain: string) {
  return (
    DOMAIN_META[domain] ?? {
      label: domain,
      color: "#64748b",
      bg: "#F1F5F9",
      icon: "📌",
    }
  );
}

function scopeBadge(scope: string) {
  if (scope === "organization" || scope === "ucar_wide") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#1B4F6B]/10 px-2.5 py-0.5 text-xs font-medium text-[#1B4F6B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1B4F6B]" />
        Organisation
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Institution
    </span>
  );
}

function formatTarget(val: number, kpi: string) {
  // If looks like a rate (0–1), show as %
  if (
    val > 0 &&
    val <= 1 &&
    !kpi.includes("total") &&
    !kpi.includes("count") &&
    !kpi.includes("number")
  ) {
    return `${Math.round(val * 100)} %`;
  }
  return val.toLocaleString("fr-TN");
}

export default function GoalsTable({ goals }: { goals: GoalRow[] }) {
  const domains = useMemo(() => {
    const all = Array.from(new Set(goals.map((g) => g.domain)));
    return all.sort();
  }, [goals]);

  const years = useMemo(() => {
    return Array.from(new Set(goals.map((g) => g.academic_year)))
      .sort()
      .reverse();
  }, [goals]);

  const [activeDomain, setActiveDomain] = useState<string>("all");
  const [activeYear, setActiveYear] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [activeScope, setActiveScope] = useState<string>("all");

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      if (activeDomain !== "all" && g.domain !== activeDomain) return false;
      if (activeYear !== "all" && g.academic_year !== activeYear) return false;
      if (activeScope !== "all") {
        const isOrg = g.scope === "organization" || g.scope === "ucar_wide";
        if (activeScope === "organization" && !isOrg) return false;
        if (activeScope === "institution" && isOrg) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          g.kpi_key.toLowerCase().includes(q) ||
          g.domain.toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [goals, activeDomain, activeYear, activeScope, search]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1B1C1A]">
              Tous les objectifs stratégiques
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtered.length} objectif{filtered.length !== 1 ? "s" : ""}{" "}
              affiché{filtered.length !== 1 ? "s" : ""} sur {goals.length}
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
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
              placeholder="Rechercher un KPI, domaine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B4F6B] focus:ring-2 focus:ring-[#1B4F6B]/10 transition"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Domain tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveDomain("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeDomain === "all"
                  ? "bg-[#1B1C1A] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tous les domaines
            </button>
            {domains.map((d) => {
              const m = domainMeta(d);
              return (
                <button
                  key={d}
                  onClick={() =>
                    setActiveDomain(activeDomain === d ? "all" : d)
                  }
                  className="rounded-full px-3 py-1 text-xs font-medium transition"
                  style={
                    activeDomain === d
                      ? { background: m.color, color: "#fff" }
                      : { background: m.bg, color: m.color }
                  }
                >
                  {m.icon} {m.label}
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-slate-200 self-center mx-1 hidden sm:block" />

          {/* Year filter */}
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 outline-none focus:border-[#1B4F6B] transition cursor-pointer"
          >
            <option value="all">Toutes les années</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Scope filter */}
          <select
            value={activeScope}
            onChange={(e) => setActiveScope(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 outline-none focus:border-[#1B4F6B] transition cursor-pointer"
          >
            <option value="all">Toutes les portées</option>
            <option value="organization">Organisation</option>
            <option value="institution">Institution</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg
              className="h-10 w-10 mb-3 opacity-40"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">Aucun objectif trouvé</p>
            <p className="text-xs mt-1">Essayez d'ajuster vos filtres.</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Domaine</th>
                <th className="px-5 py-3">KPI</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Cible</th>
                <th className="px-5 py-3">Portée</th>
                <th className="px-5 py-3">Institution</th>
                <th className="px-5 py-3">Année</th>
                <th className="px-5 py-3">Créé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const m = domainMeta(item.domain);
                return (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50 transition-colors align-top"
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold"
                        style={{ background: m.bg, color: m.color }}
                      >
                        {m.icon} {m.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                        {item.kpi_key}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <span className="text-slate-600 text-xs leading-relaxed">
                        {item.description ?? (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-semibold text-[#1B1C1A]">
                        {formatTarget(item.target_value, item.kpi_key)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">{scopeBadge(item.scope)}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {item.institutions?.name ?? "UCAR"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-medium">
                        {item.academic_year}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("fr-TN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
