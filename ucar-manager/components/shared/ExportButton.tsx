"use client";

import { useState } from "react";

type Props = {
  filename: string;
  // headers + rows — all plain strings, serializable across server/client boundary
  headers: string[];
  data: (string | number)[][];
};

export default function ExportButton({ filename, headers, data }: Props) {
  const [open, setOpen] = useState(false);

  function exportPdf() {
    setOpen(false);
    import("jspdf").then(({ jsPDF }) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(12);
        doc.text(filename, 14, 14);
        autoTable(doc, {
          startY: 22,
          head: [headers],
          body: data.map((row) => row.map(String)),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [0, 56, 80], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [250, 249, 246] },
        });
        doc.save(`${filename}.pdf`);
      });
    });
  }

  function exportExcel() {
    setOpen(false);
    import("xlsx").then((XLSX) => {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename.slice(0, 31));
      XLSX.writeFile(wb, `${filename}.xlsx`);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-sm border border-[#003850]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#003850] hover:bg-[#003850]/5 transition-colors"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v8m0 0-3-3m3 3 3-3M3 13h10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Exporter
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-sm border border-slate-200 bg-white shadow-md">
            <button
              onClick={exportPdf}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="text-red-500 font-bold text-[10px]">PDF</span>
              Exporter PDF
            </button>
            <button
              onClick={exportExcel}
              className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="text-green-600 font-bold text-[10px]">XLS</span>
              Exporter Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
