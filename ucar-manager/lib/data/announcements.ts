import { createClient } from "@/lib/supabase/server";

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  audience: string;
  published_at: string | null;
};

export async function getAnnouncements(
  role: string,
  limit = 50,
): Promise<AnnouncementRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, audience, published_at")
    .eq("is_published", true)
    .or(`audience.eq.all,audience.eq.${role}`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AnnouncementRow[];
}
