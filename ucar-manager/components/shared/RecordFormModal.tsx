"use client";

import { useRef, useState, useTransition } from "react";

export type FieldDef =
  | { key: string; label: string; type: "text" | "email" | "date"; required?: boolean; placeholder?: string }
  | { key: string; label: string; type: "number"; min?: number; max?: number; placeholder?: string; required?: boolean }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; required?: boolean };

export type RecordFormModalProps = {
  title: string;
  fields: FieldDef[];
  initialValues?: Record<string, string | number | undefined>;
  onClose: () => void;
  onSave: (values: Record<string, string | number | undefined>) => Promise<{ error?: string }>;
};

export default function RecordFormModal({
  title,
  fields,
  initialValues = {},
  onClose,
  onSave,
}: RecordFormModalProps) {
  const [values, setValues] = useState<Record<string, string | number | undefined>>(
    () => {
      const defaults: Record<string, string | number | undefined> = {};
      for (const f of fields) {
        defaults[f.key] = initialValues[f.key] ?? (f.type === "select" ? f.options[0]?.value : "");
      }
      return defaults;
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const overlayRef = useRef<HTMLDivElement>(null);

  function set(key: string, value: string | number | undefined) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !values[f.key]);
    if (missing) { setError(`${missing.label} est requis.`); return; }
    setError(null);
    startTransition(async () => {
      const result = await onSave(values);
      if (result.error) { setError(result.error); return; }
      onClose();
    });
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-md border border-[#003850]/10 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-[#1B1C1A]">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    {f.label}
                    {f.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {f.type === "select" ? (
                    <select
                      className={INPUT}
                      value={String(values[f.key] ?? "")}
                      onChange={(e) => set(f.key, e.target.value)}
                    >
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === "number" ? (
                    <input
                      className={INPUT}
                      type="number"
                      min={f.min}
                      max={f.max}
                      placeholder={f.placeholder}
                      value={values[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value ? Number(e.target.value) : undefined)}
                    />
                  ) : (
                    <input
                      className={INPUT}
                      type={f.type}
                      placeholder={"placeholder" in f ? f.placeholder : undefined}
                      value={String(values[f.key] ?? "")}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="mx-6 mb-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-sm bg-[#003850] px-4 py-2 text-sm font-medium text-white hover:bg-[#002a3d] disabled:opacity-60 transition-colors"
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const INPUT = "w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] focus:border-[#003850] focus:outline-none focus:ring-1 focus:ring-[#003850]/20 transition-colors";
