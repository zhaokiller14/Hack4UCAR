"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUcarAdmin } from "@/lib/auth/guards";

export async function publishAnnouncement(formData: FormData): Promise<{ error?: string }> {
  const ctx = await requireUcarAdmin();

  const title    = String(formData.get("title")    ?? "").trim();
  const body     = String(formData.get("body")     ?? "").trim();
  const audience = String(formData.get("audience") ?? "all").trim();

  if (!title || !body) return { error: "Titre et message requis." };

  const supabase = await createClient();

  // Fetch organization_id for the super_admin
  const { data: org } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", ctx.userId)
    .maybeSingle();

  if (!org?.organization_id) return { error: "Organisation introuvable." };

  const { error } = await supabase.from("announcements").insert({
    organization_id: org.organization_id,
    author_id:       ctx.userId,
    title,
    body,
    audience,
    is_published:    true,
    published_at:    new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/ucar/announcements");
  revalidatePath("/ucar/dashboard");
  return {};
}
