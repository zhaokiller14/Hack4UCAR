import { requireUcarAdmin } from "@/lib/auth/guards";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { inviteInstitutionUser, deactivateUser } from "@/lib/actions/invite";
import SectionCard from "@/components/shared/SectionCard";
import { FR } from "@/lib/i18n";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

type UserWithInstitution = {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  institutions: { name: string }[] | { name: string } | null;
};

const INSTITUTION_ROLES = [
  { value: "institution_admin",      label: "Directeur d'établissement" },
  { value: "academic_manager",       label: "Responsable académique" },
  { value: "finance_manager",        label: "Responsable finance" },
  { value: "hr_manager",             label: "Responsable RH" },
  { value: "research_manager",       label: "Responsable recherche" },
  { value: "partnerships_manager",   label: "Responsable partenariats" },
  { value: "esg_manager",            label: "Responsable ESG" },
  { value: "infrastructure_manager", label: "Responsable infrastructure" },
  { value: "viewer",                 label: "Observateur" },
];

export default async function UcarSettings() {
  await requireUcarAdmin();

  const supabase = await createClient();

  const [usersResult, institutionsResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name, role, is_active, created_at, institutions(name)")
      .eq("role", "institution_admin")
      .order("created_at", { ascending: false }),
    supabase
      .from("institutions")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name"),
  ]);

  const users = (usersResult.data ?? []) as UserWithInstitution[];
  const institutions = institutionsResult.data ?? [];

  // Fetch emails from auth.users (admin API)
  const userIds = users.map((u) => u.id);
  const emailMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    for (const au of authUsers?.users ?? []) {
      if (au.email) emailMap.set(au.id, au.email);
    }
  }

  async function handleInvite(formData: FormData) {
    "use server";
    await inviteInstitutionUser(formData);
  }

  async function handleDeactivate(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    if (userId) await deactivateUser(userId);
  }

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Paramètres organisation</h1>
        <p className="mt-0.5 text-sm text-slate-500">Gérer les utilisateurs des établissements affiliés</p>
      </div>

      {/* Invite form */}
      <SectionCard title="Inviter un directeur d'établissement" description="Un email d'invitation sera envoyé — le directeur pourra ensuite inviter ses responsables">
        <form action={handleInvite} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">Email <span className="text-red-500">*</span></label>
            <input
              name="email"
              type="email"
              required
              placeholder="prenom.nom@institution.tn"
              className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] focus:border-[#003850] focus:outline-none focus:ring-1 focus:ring-[#003850]/20"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">Établissement <span className="text-red-500">*</span></label>
            <select
              name="institution_id"
              required
              className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] focus:border-[#003850] focus:outline-none focus:ring-1 focus:ring-[#003850]/20"
            >
              <option value="">— Sélectionner —</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-sm bg-[#003850] px-4 py-2 text-sm font-medium text-white hover:bg-[#002a3d] transition-colors"
            >
              Envoyer l'invitation
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Users table */}
      <SectionCard title="Directeurs d'établissement" description={`${users.length} directeur${users.length !== 1 ? "s" : ""} enregistré${users.length !== 1 ? "s" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF9F6] border-b border-[#003850]/10">
              <tr>
                {["Nom", "Email", "Établissement", "Rôle", "Statut", "Créé le", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    Aucun utilisateur enregistré.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1B1C1A]">
                      {u.full_name || <span className="italic text-slate-400">En attente</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emailMap.get(u.id) ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {Array.isArray(u.institutions) ? u.institutions[0]?.name ?? "—" : u.institutions?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {FR.staffRole[u.role as keyof typeof FR.staffRole]
                        ?? INSTITUTION_ROLES.find((r) => r.value === u.role)?.label
                        ?? u.role}
                    </td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="inline-flex items-center rounded-sm border border-green-200 bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Actif</span>
                      ) : (
                        <span className="inline-flex items-center rounded-sm border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">En attente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString("fr-TN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.is_active && (
                        <form action={handleDeactivate}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button type="submit" className="text-xs text-red-600 hover:underline font-medium">
                            Désactiver
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </main>
  );
}
