import { createClient } from "@/lib/supabase/server";

export type InstitutionDetail = {
  id: string;
  name: string;
  code: string;
  city: string;
  president_name: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
};

export async function getInstitutionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("institutions")
    .select(
      "id, name, code, city, president_name, contact_email, is_active, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as InstitutionDetail | null;
}
