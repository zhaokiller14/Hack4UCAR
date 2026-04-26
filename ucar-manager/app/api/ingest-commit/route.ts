import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ExtractedKpi } from "../extract/route";

interface CommitRequest {
  extractedData: ExtractedKpi[];
  fileName: string;
  periodStart: string;
  periodEnd: string;
  periodType: "monthly" | "quarterly" | "annual";
  academicYear?: string;
  fiscalYear?: string;
  institutionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authentication from request
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload: CommitRequest = await request.json();

    const {
      extractedData,
      fileName,
      periodStart,
      periodEnd,
      periodType,
      academicYear,
      fiscalYear,
      institutionId,
    } = payload;

    // Validate required fields
    if (!extractedData || !Array.isArray(extractedData) || extractedData.length === 0) {
      return NextResponse.json(
        { error: "No data provided for ingestion" },
        { status: 400 }
      );
    }

    if (!periodStart || !periodEnd || !periodType || !institutionId) {
      return NextResponse.json(
        { error: "Missing required fields: periodStart, periodEnd, periodType, institutionId" },
        { status: 400 }
      );
    }

    // Group KPIs by domain
    const kpisByDomain: Record<string, ExtractedKpi[]> = {};
    for (const kpi of extractedData) {
      if (!kpisByDomain[kpi.domain]) {
        kpisByDomain[kpi.domain] = [];
      }
      kpisByDomain[kpi.domain].push(kpi);
    }

    // Insert KPI snapshots for each domain
    const insertPromises = Object.entries(kpisByDomain).map(
      async ([domain, kpis]) => {
        // Build the data object for insertion
        const snapshotData: Record<string, unknown> = {
          institution_id: institutionId,
          domain: domain,
          period_type: periodType,
          period_start: periodStart,
          period_end: periodEnd,
          academic_year: academicYear,
          fiscal_year: fiscalYear,
          source_file: fileName,
          created_at: new Date().toISOString(),
        };

        // Add each KPI value to the snapshot data
        for (const kpi of kpis) {
          if (kpi.value !== null && kpi.value !== undefined) {
            snapshotData[kpi.key] = kpi.value;
          }
        }

        // Insert into kpi_snapshots table
        const { data, error } = await supabase
          .from("kpi_snapshots")
          .insert(snapshotData)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to insert ${domain} data: ${error.message}`);
        }

        return { domain, data };
      }
    );

    const results = await Promise.all(insertPromises);

    // Log the ingestion for audit purposes
    await supabase.from("ingestion_logs").insert({
      institution_id: institutionId,
      file_name: fileName,
      domains_affected: Object.keys(kpisByDomain),
      kpi_count: extractedData.length,
      period_start: periodStart,
      period_end: periodEnd,
      period_type: periodType,
      academic_year: academicYear,
      fiscal_year: fiscalYear,
      status: "completed",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Data successfully ingested and synchronized!",
        results: results.map((r) => ({
          domain: r.domain,
          id: r.data?.id,
        })),
        domainsUpdated: Object.keys(kpisByDomain),
        totalKpis: extractedData.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ingestion commit error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to commit data to database",
      },
      { status: 500 }
    );
  }
}