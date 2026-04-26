"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { ExtractedKpi } from "@/app/api/extract/route";

interface KpiReviewFormProps {
  extractedData: ExtractedKpi[];
  onValueChange: (key: string, value: string | number | null) => void;
}

export function KpiReviewForm({ extractedData, onValueChange }: KpiReviewFormProps) {
  // Group by domain
  const groupedByDomain = extractedData.reduce(
    (acc, kpi) => {
      if (!acc[kpi.domain]) {
        acc[kpi.domain] = [];
      }
      acc[kpi.domain].push(kpi);
      return acc;
    },
    {} as Record<string, ExtractedKpi[]>
  );

  const needsReviewCount = extractedData.filter((kpi) => kpi.needsReview).length;

  return (
    <div className="w-full">
      {/* Summary Banner */}
      {needsReviewCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {needsReviewCount} field{needsReviewCount > 1 ? "s" : ""} need{needsReviewCount > 1 ? "" : "s"} your attention
            </p>
            <p className="text-xs text-amber-600 mt-1">
              These fields have low AI confidence or were not detected. Please review and fill them manually.
            </p>
          </div>
        </div>
      )}

      {/* KPI Fields by Domain */}
      {Object.entries(groupedByDomain).map(([domain, kpis]) => (
        <div key={domain} className="mb-8">
          <h3 className="text-lg font-semibold text-[#0D2B3E] mb-4 capitalize">
            {domain === "hr" ? "Human Resources" : domain === "esg" ? "ESG" : domain}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {kpis.map((kpi) => (
              <KpiField
                key={kpi.key}
                kpi={kpi}
                onChange={(value) => onValueChange(kpi.key, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface KpiFieldProps {
  kpi: ExtractedKpi;
  onChange: (value: string | number | null) => void;
}

function KpiField({ kpi, onChange }: KpiFieldProps) {
  const [localValue, setLocalValue] = React.useState<string>(
    kpi.value !== null && kpi.value !== undefined ? String(kpi.value) : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Convert to number if it's a numeric field
    if (newValue === "") {
      onChange(null);
    } else if (kpi.unit === "TND" || kpi.unit === "%" || kpi.unit === "tCO2e" || kpi.unit === "MWh") {
      const numValue = Number(newValue.replace(/,/g, ""));
      if (!isNaN(numValue)) {
        onChange(numValue);
      } else {
        onChange(newValue);
      }
    } else {
      onChange(newValue);
    }
  };

  const statusIcon = kpi.needsReview ? (
    <AlertCircle className="w-4 h-4 text-amber-500" />
  ) : (
    <CheckCircle className="w-4 h-4 text-green-500" />
  );

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 transition-all",
        kpi.needsReview
          ? "border-amber-300 bg-amber-50/50"
          : "border-gray-200 bg-white"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <Label
          htmlFor={`kpi-${kpi.key}`}
          className={cn(
            "text-sm font-medium",
            kpi.needsReview ? "text-amber-800" : "text-[#0D2B3E]"
          )}
        >
          {kpi.label}
        </Label>
        <div className="flex items-center gap-1">
          {statusIcon}
          <span
            className={cn(
              "text-xs",
              kpi.confidence >= 0.8
                ? "text-green-600"
                : kpi.confidence >= 0.5
                ? "text-amber-600"
                : "text-red-500"
            )}
          >
            {Math.round(kpi.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          id={`kpi-${kpi.key}`}
          value={localValue}
          onChange={handleChange}
          placeholder={kpi.needsReview ? "Enter value manually" : "AI extracted value"}
          className={cn(
            kpi.needsReview && "border-amber-300 focus-visible:ring-amber-500"
          )}
        />
        {kpi.unit && (
          <span className="text-sm text-gray-500 shrink-0">{kpi.unit}</span>
        )}
      </div>

      {kpi.needsReview && !localValue && (
        <p className="text-xs text-amber-600 mt-2">
          This field was not detected by AI. Please enter the value manually.
        </p>
      )}

      {kpi.needsReview && localValue && (
        <p className="text-xs text-amber-600 mt-2">
          Please verify this value before proceeding.
        </p>
      )}
    </div>
  );
}