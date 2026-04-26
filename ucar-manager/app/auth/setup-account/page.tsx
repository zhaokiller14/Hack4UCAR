"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetupAccount() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    async function init() {
      // Session is already established by /auth/confirm before landing here
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Lien d'invitation invalide ou expiré. Veuillez contacter votre administrateur.");
        setSessionReady(true);
        return;
      }

      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("users")
        .select("institutions(name)")
        .eq("id", user.id)
        .maybeSingle();

      const inst = data as { institutions: { name: string } | { name: string }[] | null } | null;
      const instData = inst?.institutions;
      const name = Array.isArray(instData) ? instData[0]?.name : instData?.name;
      if (name) setInstitutionName(name);

      setSessionReady(true);
    }

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Le nom complet est requis."); return; }
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expirée. Veuillez cliquer à nouveau sur le lien d'invitation.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName.trim() },
    });
    if (updateError) { setError(updateError.message); setLoading(false); return; }

    const { error: dbError } = await supabase
      .from("users")
      .update({ full_name: fullName.trim(), is_active: true })
      .eq("id", user.id);

    if (dbError) { setError(dbError.message); setLoading(false); return; }

    router.replace("/institution/dashboard");
  };

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-6">
      <div className="w-full max-w-sm space-y-6 rounded-sm border border-[#003850]/10 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-[#1B1C1A]">Finaliser votre compte</h1>
          <p className="mt-1 text-sm text-slate-500">Bienvenue sur UCAR Intelligence. Complétez votre profil pour accéder à la plateforme.</p>
        </div>

        {error ? (
          <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : (
          <>
            <div className="space-y-3 rounded-sm border border-slate-100 bg-[#FAF9F6] px-4 py-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-[#1B1C1A]">{email}</span>
              </div>
              {institutionName && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Établissement</span>
                  <span className="font-medium text-[#1B1C1A]">{institutionName}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Prénom Nom"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] focus:border-[#003850] focus:outline-none focus:ring-1 focus:ring-[#003850]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min. 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] focus:border-[#003850] focus:outline-none focus:ring-1 focus:ring-[#003850]/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-[#003850] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#002a3d] disabled:opacity-60 transition-colors"
              >
                {loading ? "Enregistrement…" : "Accéder à la plateforme →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
