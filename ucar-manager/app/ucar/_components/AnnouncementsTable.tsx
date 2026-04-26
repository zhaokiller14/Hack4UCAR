"use client";

import { useState, useMemo } from "react";

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  audience: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

const AUDIENCE_META: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  all: { label: "Tous", color: "#1B4F6B", bg: "#EBF4FA", icon: "🌐" },
  staff: { label: "Personnel", color: "#7B3F9E", bg: "#F5EEF8", icon: "👩‍💼" },
  students: { label: "Étudiants", color: "#2E7D32", bg: "#EBF5EB", icon: "🎓" },
  teachers: {
    label: "Enseignants",
    color: "#C0392B",
    bg: "#FDEDEC",
    icon: "📚",
  },
  admin: { label: "Admins", color: "#D4860A", bg: "#FEF9E7", icon: "🔧" },
};

function audienceMeta(audience: string) {
  return (
    AUDIENCE_META[audience] ?? {
      label: audience,
      color: "#64748b",
      bg: "#F1F5F9",
      icon: "📢",
    }
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months} mois`;
  return `Il y a ${Math.floor(months / 12)} an${Math.floor(months / 12) > 1 ? "s" : ""}`;
}

export default function AnnouncementsTable({
  announcements,
}: {
  announcements: AnnouncementRow[];
}) {
  const audiences = useMemo(
    () => Array.from(new Set(announcements.map((a) => a.audience))).sort(),
    [announcements],
  );

  const [activeAudience, setActiveAudience] = useState("all_filter");
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      if (activeAudience !== "all_filter" && a.audience !== activeAudience)
        return false;
      if (activeStatus === "published" && !a.is_published) return false;
      if (activeStatus === "draft" && a.is_published) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q) ||
          a.audience.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [announcements, activeAudience, activeStatus, search]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1B1C1A]">
              Toutes les annonces
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtered.length} annonce{filtered.length !== 1 ? "s" : ""}{" "}
              affichée{filtered.length !== 1 ? "s" : ""} sur{" "}
              {announcements.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              <button
                onClick={() => setView("cards")}
                className={`px-3 py-1.5 font-medium transition ${view === "cards" ? "bg-[#1B4F6B] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                Cartes
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1.5 font-medium transition ${view === "table" ? "bg-[#1B4F6B] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                Tableau
              </button>
            </div>
            {/* Search */}
            <div className="relative w-52">
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
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B4F6B] focus:ring-2 focus:ring-[#1B4F6B]/10 transition"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Audience pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveAudience("all_filter")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeAudience === "all_filter"
                  ? "bg-[#1B1C1A] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Toutes audiences
            </button>
            {audiences.map((a) => {
              const m = audienceMeta(a);
              return (
                <button
                  key={a}
                  onClick={() =>
                    setActiveAudience(activeAudience === a ? "all_filter" : a)
                  }
                  className="rounded-full px-3 py-1 text-xs font-medium transition"
                  style={
                    activeAudience === a
                      ? { background: m.color, color: "#fff" }
                      : { background: m.bg, color: m.color }
                  }
                >
                  {m.icon} {m.label}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* Status */}
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeStatus === s
                  ? s === "published"
                    ? "bg-green-600 text-white"
                    : s === "draft"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s === "all"
                ? "Tous statuts"
                : s === "published"
                  ? "✓ Publiés"
                  : "✎ Brouillons"}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
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
          <p className="text-sm font-medium">Aucune annonce trouvée</p>
          <p className="text-xs mt-1">Essayez d'ajuster vos filtres.</p>
        </div>
      )}

      {/* Card view */}
      {view === "cards" && filtered.length > 0 && (
        <div className="divide-y divide-slate-100">
          {filtered.map((item) => {
            const m = audienceMeta(item.audience);
            return (
              <article
                key={item.id}
                className="px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Status badge */}
                      {item.is_published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Brouillon
                        </span>
                      )}
                      {/* Audience badge */}
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: m.bg, color: m.color }}
                      >
                        {m.icon} {m.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1B1C1A] group-hover:text-[#1B4F6B] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                  {/* Meta */}
                  <div className="flex-shrink-0 text-right space-y-1 sm:ml-4">
                    <p className="text-xs font-medium text-slate-400">
                      {timeAgo(item.created_at)}
                    </p>
                    {item.published_at && (
                      <p className="text-[11px] text-slate-400">
                        Publié le {formatDate(item.published_at)}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {view === "table" && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Titre</th>
                <th className="px-5 py-3">Audience</th>
                <th className="px-5 py-3">Créé</th>
                <th className="px-5 py-3">Publié le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const m = audienceMeta(item.audience);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors align-top group"
                  >
                    <td className="px-5 py-3.5">
                      {item.is_published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-sm font-medium text-[#1B1C1A] group-hover:text-[#1B4F6B] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {item.body}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: m.bg, color: m.color }}
                      >
                        {m.icon} {m.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {item.published_at ? (
                        formatDate(item.published_at)
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
