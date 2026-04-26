"use client";

import { useState } from "react";
import { FR } from "@/lib/i18n";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { InfrastructureAssetRow } from "@/lib/data/infrastructure";
import type { InfrastructureAssetInput } from "@/lib/actions/infrastructure";

type Props = {
  rows: InfrastructureAssetRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (
    institutionId: string,
    input: InfrastructureAssetInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (
    assetId: string,
    input: InfrastructureAssetInput,
  ) => Promise<{ error?: string }>;
  onDelete: (assetId: string) => Promise<{ error?: string }>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; row: InfrastructureAssetRow }
  | null;

const ASSET_TYPE_OPTIONS = Object.entries(FR.infraAssetType).map(([v, l]) => ({ value: v, label: l }));
const STATUS_OPTIONS = Object.entries(FR.infraStatus).map(([v, l]) => ({ value: v, label: l }));

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString("fr-TN");
}

function getAssetTypeLabel(type: string): string {
  return FR.infraAssetType[type as keyof typeof FR.infraAssetType] ?? type;
}

function getStatusLabel(status: string): string {
  return FR.infraStatus[status as keyof typeof FR.infraStatus] ?? status;
}

const STATUS_STYLES: Record<string, string> = {
  operational: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-yellow-100 text-yellow-700 border-yellow-200",
  out_of_service: "bg-red-100 text-red-700 border-red-200",
};

export default function InfrastructureAssetsTable({
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

  const columns: Column<InfrastructureAssetRow>[] = [
    {
      header: "Nom",
      render: (row) => (
        <span className="font-medium text-[#1B1C1A]">{row.name}</span>
      ),
    },
    {
      header: "Type",
      render: (row) => getAssetTypeLabel(row.asset_type),
    },
    {
      header: "Localisation",
      render: (row) => row.location ?? "—",
    },
    {
      header: "Capacite",
      render: (row) => (row.capacity !== null ? row.capacity : "—"),
    },
    {
      header: "Statut",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${STATUS_STYLES[row.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
        >
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: "Occupation (%)",
      render: (row) =>
        row.reported_occupancy_pct !== null
          ? `${row.reported_occupancy_pct}%`
          : "—",
    },
    {
      header: "Derniere maintenance",
      render: (row) => formatDate(row.last_maintenance),
    },
  ];

  const fields: FieldDef[] = [
    {
      key: "asset_type",
      label: "Type d'actif",
      type: "select",
      required: true,
      options: ASSET_TYPE_OPTIONS,
    },
    {
      key: "name",
      label: "Nom",
      type: "text",
      required: true,
      placeholder: "ex. Salle 101",
    },
    {
      key: "location",
      label: "Localisation",
      type: "text",
      placeholder: "ex. Batiment A, 1er etage",
    },
    {
      key: "capacity",
      label: "Capacite",
      type: "number",
      min: 0,
    },
    {
      key: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: STATUS_OPTIONS,
    },
    {
      key: "reported_occupancy_pct",
      label: "Occupation (%)",
      type: "number",
      min: 0,
      max: 100,
    },
    {
      key: "last_maintenance",
      label: "Derniere maintenance",
      type: "date",
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): InfrastructureAssetInput {
    return {
      asset_type: String(values.asset_type ?? ""),
      name: String(values.name ?? ""),
      location: String(values.location ?? "").trim() || undefined,
      capacity:
        values.capacity !== undefined && values.capacity !== ""
          ? Number(values.capacity)
          : undefined,
      status: String(values.status ?? ""),
      reported_occupancy_pct:
        values.reported_occupancy_pct !== undefined &&
        values.reported_occupancy_pct !== ""
          ? Number(values.reported_occupancy_pct)
          : undefined,
      last_maintenance:
        String(values.last_maintenance ?? "").trim() || undefined,
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
          asset_type: form.row.asset_type,
          name: form.row.name,
          location: form.row.location ?? "",
          capacity: form.row.capacity ?? "",
          status: form.row.status,
          reported_occupancy_pct: form.row.reported_occupancy_pct ?? "",
          last_maintenance: form.row.last_maintenance ?? "",
        }
      : {
          asset_type: "classroom",
          name: "",
          location: "",
          capacity: "",
          status: "operational",
          reported_occupancy_pct: "",
          last_maintenance: "",
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
        addLabel="+ Ajouter un actif"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(row) => setForm({ mode: "edit", row })}
        onDelete={onDelete}
        getDeleteLabel={(row) =>
          `${row.name} (${getAssetTypeLabel(row.asset_type)})`
        }
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create"
              ? "Ajouter un actif infrastructure"
              : "Modifier actif infrastructure"
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
