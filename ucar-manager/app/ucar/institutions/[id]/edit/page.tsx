import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getInstitutionById } from "@/lib/data/institutions";
import { createClient } from "@/lib/supabase/server";

type InstitutionEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InstitutionEditPage({ params }: InstitutionEditPageProps) {
  const { id } = await params;
  const institution = await getInstitutionById(id);

  if (!institution) {
    notFound();
  }

  async function updateInstitution(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const name = String(formData.get("name") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const president_name = String(formData.get("president_name") ?? "").trim();
    const contact_email = String(formData.get("contact_email") ?? "").trim();
    const is_active = formData.get("is_active") === "on";

    const payload = {
      name,
      code,
      city,
      president_name: president_name.length > 0 ? president_name : null,
      contact_email: contact_email.length > 0 ? contact_email : null,
      is_active,
    };

    const { error } = await supabase.from("institutions").update(payload).eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/ucar/institutions");
    revalidatePath(`/ucar/institutions/${id}`);
    redirect(`/ucar/institutions/${id}`);
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Modifier l'établissement</h1>
        <p className="mt-1 text-sm text-slate-500">Mettez à jour les informations institutionnelles.</p>
      </div>

      <form action={updateInstitution} className="space-y-4 rounded-sm border border-[#003850]/10 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[#1B1C1A]">Nom</span>
            <input
              name="name"
              defaultValue={institution.name}
              required
              className="w-full rounded-sm border border-[#003850]/20 px-3 py-2 text-sm outline-none focus:border-[#1B4F6B]"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-[#1B1C1A]">Code</span>
            <input
              name="code"
              defaultValue={institution.code}
              required
              className="w-full rounded-sm border border-[#003850]/20 px-3 py-2 text-sm outline-none focus:border-[#1B4F6B]"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-[#1B1C1A]">Ville</span>
            <input
              name="city"
              defaultValue={institution.city}
              required
              className="w-full rounded-sm border border-[#003850]/20 px-3 py-2 text-sm outline-none focus:border-[#1B4F6B]"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-[#1B1C1A]">Président</span>
            <input
              name="president_name"
              defaultValue={institution.president_name ?? ""}
              className="w-full rounded-sm border border-[#003850]/20 px-3 py-2 text-sm outline-none focus:border-[#1B4F6B]"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-[#1B1C1A]">Email de contact</span>
            <input
              name="contact_email"
              type="email"
              defaultValue={institution.contact_email ?? ""}
              className="w-full rounded-sm border border-[#003850]/20 px-3 py-2 text-sm outline-none focus:border-[#1B4F6B]"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-[#1B1C1A]">
          <input name="is_active" type="checkbox" defaultChecked={institution.is_active} />
          Établissement actif
        </label>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            className="rounded-sm bg-[#003850] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1B4F6B]"
          >
            Enregistrer
          </button>
          <Link
            href={`/ucar/institutions/${id}`}
            className="rounded-sm border border-[#003850]/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1B4F6B] hover:bg-[#F7F6F3]"
          >
            Annuler
          </Link>
        </div>
      </form>
    </main>
  );
}
