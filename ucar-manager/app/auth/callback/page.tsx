"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Handles implicit flow: Supabase redirects here with session tokens in the URL fragment
// e.g. /auth/confirm#access_token=...&refresh_token=...&type=invite
// The server-side route.ts never sees fragment params — this client page handles them.
export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function handleFragment() {
      const hash = window.location.hash.slice(1); // strip leading #
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const accessToken  = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type         = params.get("type");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          router.replace(`/auth/error?error=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      // After session is set, redirect based on type
      if (type === "invite") {
        router.replace("/auth/setup-account");
      } else {
        router.replace("/");
      }
    }

    handleFragment();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
      <p className="text-sm text-slate-500">Connexion en cours…</p>
    </div>
  );
}
