"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { StudentRow } from "@/lib/data/academic";

const STATUS_STYLES: Record<string, string> = {
  active:      "bg-green-100 text-green-700 border-green-200",
  graduated:   "bg-blue-100 text-blue-700 border-blue-200",
  dropped:     "bg-red-100 text-red-700 border-red-200",
  suspended:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  transferred: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_FR: Record<string, string> = {
  active:      "Actif",
  graduated:   "Diplômé",
  dropped:     "Abandonné",
  suspended:   "Suspendu",
  transferred: "Transféré",
};

type Props = {
  students: StudentRow[];
  total: number;
  page: number;
  pageSize: number;
};

export default function StudentTable({ students, total, page, pageSize }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  function pageHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-sm border border-[#003850]/10">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF9F6] border-b border-[#003850]/10">
            <tr>
              {["Code", "Nom complet", "Spécialisation", "Année", "Statut", "Inscription", "Diplôme"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                  Aucun étudiant trouvé.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.student_code ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-[#1B1C1A]">{s.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.specialization ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.current_year !== null ? `L${s.current_year}` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${STATUS_STYLES[s.status] ?? STATUS_STYLES.active}`}>
                      {STATUS_FR[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.enrollment_date ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{s.graduation_date ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} étudiant{total !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors ${
                p === page
                  ? "bg-[#003850] text-white border-[#003850]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#003850]/40"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
