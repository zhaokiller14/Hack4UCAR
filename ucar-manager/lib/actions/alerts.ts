"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

export async function acknowledgeAlert(alertId: string): Promise<{ error?: string }> {
  const ctx = await getServerUserContext();
  if (!ctx) return { error: "Non authentifié." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("alerts")
    .update({ is_acknowledged: true })
    .eq("id", alertId);

  if (error) return { error: error.message };
  revalidatePath("/institution/alerts");
  revalidatePath("/ucar/alerts");
  return {};
}
