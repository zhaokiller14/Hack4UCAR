"use client";

import { useState } from "react";
import { FR } from "@/lib/i18n";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { EsgRecordRow } from "@/lib/data/esg";
import type { EsgRecordInput } from "@/lib/actions/esg";

type Props = {
  rows: EsgRecordRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (
    institutionId: string,
    input: EsgRecordInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (
    esgRecordId: string,
    input: EsgRecordInput,
  ) => Promise<{ error?: string }>;
  onDelete: (esgRecordId: string) => Promise<{ error?: string }>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; row: EsgRecordRow }
  | null;

const PERIOD_TYPE_OPTIONS = Object.entries(FR.esgPeriodType).map(([v, l]) => ({ value: v, label: l }));

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString("fr-TN");
}

function formatNumber(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("fr-TN");
}

export default function EsgRecordsTable({
  rows,
  total,
  page,
  pageSize,
  institutionId,
  canWrite,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  const columns: Column<EsgRecordRow>[] = [
    {
      header: "Période",
      render: (row) => (
        <span className="font-medium text-[#1B1C1A]">{FR.esgPeriodType[row.period_type as keyof typeof FR.esgPeriodType] ?? row.period_type}</span>
      ),
    },
    {
      header: "Date début",
      render: (row) => formatDate(row.period_start),
    },
    {
      header: "Date fin",
      render: (row) => formatDate(row.period_end),
    },
    {
      header: "Energie (kWh)",
      render: (row) => formatNumber(row.energy_kwh),
    },
    {
      header: "Eau (L)",
      render: (row) => formatNumber(row.water_liters),
    },
    {
      header: "Carbone (kg)",
      render: (row) => formatNumber(row.carbon_kg),
    },
    {
      header: "Dechets (kg)",
      render: (row) => formatNumber(row.waste_kg),
    },
    {
      header: "Recycles (kg)",
      render: (row) => formatNumber(row.recycled_kg),
    },
    {
      header: "Mobilite verte (%)",
      render: (row) =>
        row.green_mobility_pct !== null ? `${row.green_mobility_pct}%` : "—",
    },
  ];

  const fields: FieldDef[] = [
    {
      key: "period_type",
      label: "Type de periode",
      type: "select",
      required: true,
      options: PERIOD_TYPE_OPTIONS,
    },
    {
      key: "period_start",
      label: "Date debut",
      type: "date",
      required: true,
    },
    {
      key: "period_end",
      label: "Date fin",
      type: "date",
      required: true,
    },
    {
      key: "energy_kwh",
      label: "Consommation energie (kWh)",
      type: "number",
      min: 0,
    },
    {
      key: "water_liters",
      label: "Consommation eau (litres)",
      type: "number",
      min: 0,
    },
    {
      key: "carbon_kg",
      label: "Empreinte carbone (kg CO2)",
      type: "number",
      min: 0,
    },
    {
      key: "waste_kg",
      label: "Dechets (kg)",
      type: "number",
      min: 0,
    },
    {
      key: "recycled_kg",
      label: "Dechets recycles (kg)",
      type: "number",
      min: 0,
    },
    {
      key: "green_mobility_pct",
      label: "Mobilite verte (%)",
      type: "number",
      min: 0,
      max: 100,
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): EsgRecordInput {
    return {
      period_type: String(values.period_type ?? ""),
      period_start: String(values.period_start ?? ""),
      period_end: String(values.period_end ?? ""),
      energy_kwh:
        values.energy_kwh !== undefined && values.energy_kwh !== ""
          ? Number(values.energy_kwh)
          : undefined,
      water_liters:
        values.water_liters !== undefined && values.water_liters !== ""
          ? Number(values.water_liters)
          : undefined,
      carbon_kg:
        values.carbon_kg !== undefined && values.carbon_kg !== ""
          ? Number(values.carbon_kg)
          : undefined,
      waste_kg:
        values.waste_kg !== undefined && values.waste_kg !== ""
          ? Number(values.waste_kg)
          : undefined,
      recycled_kg:
        values.recycled_kg !== undefined && values.recycled_kg !== ""
          ? Number(values.recycled_kg)
          : undefined,
      green_mobility_pct:
        values.green_mobility_pct !== undefined &&
        values.green_mobility_pct !== ""
          ? Number(values.green_mobility_pct)
          : undefined,
    };
  }

  async function handleSave(
    values: Record<string, string | number | undefined>,
  ) {
    const input = toInput(values);
    if (form?.mode === "edit") return onUpdate(form.row.id, input);
    return onCreate(institutionId, input);
  }

  const initialValues =
    form?.mode === "edit"
      ? {
          period_type: form.row.period_type,
          period_start: form.row.period_start,
          period_end: form.row.period_end,
          energy_kwh: form.row.energy_kwh ?? "",
          water_liters: form.row.water_liters ?? "",
          carbon_kg: form.row.carbon_kg ?? "",
          waste_kg: form.row.waste_kg ?? "",
          recycled_kg: form.row.recycled_kg ?? "",
          green_mobility_pct: form.row.green_mobility_pct ?? "",
        }
      : {
          period_type: "monthly",
          period_start: "",
          period_end: "",
          energy_kwh: "",
          water_liters: "",
          carbon_kg: "",
          waste_kg: "",
          recycled_kg: "",
          green_mobility_pct: "",
        };

  return (
    <>
      <DataTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        columns={columns}
        canWrite={canWrite}
        addLabel="+ Ajouter une donnee ESG"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(row) => setForm({ mode: "edit", row })}
        onDelete={onDelete}
        getDeleteLabel={(row) =>
          `${row.period_type} (${formatDate(row.period_start)})`
        }
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create"
              ? "Ajouter une donnee ESG"
              : "Modifier donnee ESG"
          }
          fields={fields}
          initialValues={initialValues}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
