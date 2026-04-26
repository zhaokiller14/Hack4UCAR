import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { inviteInstitutionMember, deactivateInstitutionMember } from "@/lib/actions/invite";
import SectionCard from "@/components/shared/SectionCard";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const MANAGER_ROLES = [
  { value: "academic_manager",       label: "Responsable académique" },
  { value: "finance_manager",        label: "Responsable finance" },
  { value: "hr_manager",             label: "Responsable RH" },
  { value: "research_manager",       label: "Responsable recherche" },
  { value: "partnerships_manager",   label: "Responsable partenariats" },
  { value: "esg_manager",            label: "Responsable ESG" },
  { value: "infrastructure_manager", label: "Responsable infrastructure" },
  { value: "viewer",                 label: "Observateur" },
];

type MemberRow = {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

export default async function InstitutionSettings() {
  const ctx = await requireInstitutionRole();
  const isAdmin = ctx.role === "institution_admin";

  const supabase = await createClient();

  const { data: members } = await supabase
    .from("users")
    .select("id, full_name, role, is_active, created_at")
    .eq("institution_id", ctx.institutionId!)
    .neq("role", "institution_admin")
    .order("created_at", { ascending: false });

  const rows = (members ?? []) as MemberRow[];

  // Resolve emails via admin API
  const emailMap = new Map<string, string>();
  if (rows.length > 0) {
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    for (const au of authUsers?.users ?? []) {
      if (au.email) emailMap.set(au.id, au.email);
    }
  }

  const roleLabel = (role: string) =>
    MANAGER_ROLES.find((r) => r.value === role)?.label ?? role;

  async function handleInvite(formData: FormData) {
    "use server";
    await inviteInstitutionMember(formData);
  }

  async function handleDeactivate(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    if (userId) await deactivateInstitutionMember(userId);
  }

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Paramètres établissement</h1>
        <p className="mt-0.5 text-sm text-slate-500">Gérer les responsables de votre établissement</p>
      </div>

      {isAdmin && (
        <SectionCard
          title="Inviter un responsable"
          description="Un email d'invitation sera envoyé — le responsable devra configurer son compte"
        >
          <form action={handleInvite} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="prenom.nom@institution.tn"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] focus:border-[#003850] focus:outline-none focus:ring-1 focus:ring-[#003850]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                required
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] focus:border-[#003850] focus:outline-none focus:ring-1 focus:ring-[#003850]/20"
              >
                <option value="">— Sélectionner —</option>
                {MANAGER_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-sm bg-[#003850] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#002a3d]"
              >
                Envoyer l'invitation
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard
        title="Responsables de l'établissement"
        description={`${rows.length} responsable${rows.length !== 1 ? "s" : ""} enregistré${rows.length !== 1 ? "s" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#003850]/10 bg-[#FAF9F6]">
              <tr>
                {["Nom", "Email", "Rôle", "Statut", "Invité le", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    Aucun responsable enregistré.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-[#1B1C1A]">
                      {u.full_name || <span className="italic text-slate-400">En attente</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emailMap.get(u.id) ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{roleLabel(u.role)}</td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="inline-flex items-center rounded-sm border border-green-200 bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-sm border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(u.created_at).toLocaleDateString("fr-TN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && u.is_active && (
                        <form action={handleDeactivate}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button
                            type="submit"
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
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
