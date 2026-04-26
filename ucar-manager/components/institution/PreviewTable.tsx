import Link from "next/link";

export type PreviewColumn<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
};

type Props<T extends { id: string }> = {
  title: string;
  href: string;
  columns: PreviewColumn<T>[];
  rows: T[];
  emptyLabel?: string;
};

export default function PreviewTable<T extends { id: string }>({
  title,
  href,
  columns,
  rows,
  emptyLabel = "Aucun enregistrement.",
}: Props<T>) {
  return (
    <div className="bg-white border border-[#003850]/10 rounded-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#003850]/10 bg-[#FAF9F6]">
        <h3 className="text-[15px] font-medium text-[#1B1C1A]">{title}</h3>
        <Link
          href={href}
          className="rounded-sm bg-[#003850] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#002a3d] transition-colors"
        >
          Voir plus →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-xs text-slate-400"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-2.5 text-slate-600">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
