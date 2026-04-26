"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "research_manager",
]);

async function requireWriteAccess() {
  const ctx = await getServerUserContext();
  if (!ctx) throw new Error("Non authentifie.");
  if (!WRITE_ROLES.has(ctx.role ?? "")) throw new Error("Acces refuse.");
  return ctx;
}

export type ResearchProjectInput = {
  title: string;
  lead_researcher?: string;
  funding_amount?: number;
  funding_source?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  publications_count?: number;
  patents_filed?: number;
};

export async function createResearchProject(
  institutionId: string,
  input: ResearchProjectInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("research_projects").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/research");
  return {};
}

export async function updateResearchProject(
  projectId: string,
  input: ResearchProjectInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("research_projects")
    .update(sanitize(input))
    .eq("id", projectId);

  if (error) return { error: error.message };
  revalidatePath("/institution/research");
  return {};
}

export async function deleteResearchProject(
  projectId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("research_projects")
    .delete()
    .eq("id", projectId);

  if (error) return { error: error.message };
  revalidatePath("/institution/research");
  return {};
}

function sanitize(input: ResearchProjectInput) {
  return {
    title: input.title.trim(),
    lead_researcher: input.lead_researcher?.trim() || null,
    funding_amount: input.funding_amount ?? null,
    funding_source: input.funding_source?.trim() || null,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    status: input.status.trim(),
    publications_count: input.publications_count ?? 0,
    patents_filed: input.patents_filed ?? 0,
  };
}
