"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
};

export type DataTableProps<T extends { id: string }> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  columns: Column<T>[];
  canWrite: boolean;
  addLabel?: string;
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete: (id: string) => Promise<{ error?: string }>;
  getDeleteLabel?: (row: T) => string;
};

export default function DataTable<T extends { id: string }>({
  rows,
  total,
  page,
  pageSize,
  columns,
  canWrite,
  addLabel = "+ Ajouter",
  onAdd,
  onEdit,
  onDelete,
  getDeleteLabel,
}: DataTableProps<T>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pageHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    setDeleteError(null);
    startTransition(async () => {
      const result = await onDelete(id);
      if (result.error) setDeleteError(result.error);
    });
  }

  const colCount = columns.length + (canWrite ? 1 : 0);

  return (
    <div className="space-y-4">
      {canWrite && onAdd && (
        <div className="flex justify-end">
          <button
            onClick={onAdd}
            className="rounded-sm bg-[#003850] px-4 py-2 text-sm font-medium text-white hover:bg-[#002a3d] transition-colors"
          >
            {addLabel}
          </button>
        </div>
      )}

      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {deleteError}
        </p>
      )}

      <div className="overflow-x-auto rounded-sm border border-[#003850]/10">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF9F6] border-b border-[#003850]/10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {col.header}
                </th>
              ))}
              {canWrite && (
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-slate-400">
                  Aucun enregistrement trouvé.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3 text-slate-600">
                      {col.render(row)}
                    </td>
                  ))}
                  {canWrite && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-xs text-[#003850] hover:underline font-medium"
                          >
                            Modifier
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: row.id,
                              label: getDeleteLabel ? getDeleteLabel(row) : row.id,
                            })
                          }
                          className="text-xs text-red-600 hover:underline font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {total} enregistrement{total !== 1 ? "s" : ""}
          </span>
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
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-medium text-[#1B1C1A]">{deleteTarget?.label}</span>
              {" "}? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-sm border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={confirmDelete}
              disabled={pending}
              className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {pending ? "Suppression…" : "Supprimer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
