"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getLoginErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message).toLowerCase();

    if (message.includes("invalid login credentials")) {
      return "Email ou mot de passe incorrect. Veuillez verifier vos informations.";
    }

    if (message.includes("email not confirmed")) {
      return "Votre email n'est pas encore confirme. Verifiez votre boite mail.";
    }

    if (message.includes("too many requests")) {
      return "Trop de tentatives. Merci de patienter avant de reessayer.";
    }

    return String(error.message);
  }

  return "Une erreur est survenue. Merci de reessayer.";
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted && data.session) {
        router.replace("/");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace("/");
    } catch (error: unknown) {
      setError(getLoginErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-screen w-full overflow-hidden bg-[#faf9f6] text-[#1b1c1a]",
        className,
      )}
      {...props}
    >
      <aside className="relative hidden w-[40%] flex-col justify-between bg-[#efeeeb] p-8 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 40px, #1b4f6b 40px, #1b4f6b 42px)",
          }}
        />
        <div className="relative z-10 flex flex-grow flex-col items-center justify-center space-y-3 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#c1c7ce] bg-white p-4">
            <span className="text-2xl font-bold text-[#1b4f6b]">UC</span>
          </div>
          <h1 className="text-3xl font-semibold uppercase tracking-tight text-[#1b4f6b]">
            Universite de Carthage
          </h1>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#41484d]">
            Plateforme d&apos;Intelligence Institutionnelle
          </p>
          <div className="my-8 h-px w-16 bg-[#c1c7ce]" />
          <p className="text-lg text-[#1b1c1a]">Bienvenue sur UCAR Intelligence</p>
        </div>
        <p className="relative z-10 text-center text-xs text-[#41484d]">
          © 2026 UCAR. Tous droits reserves.
        </p>
      </aside>

      <main className="flex w-full items-center justify-center bg-white p-6 lg:w-[60%] lg:p-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <h1 className="text-center text-2xl font-semibold uppercase tracking-tight text-[#1b4f6b]">
              Universite de Carthage
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-semibold text-[#1b1c1a]">Bienvenue</h2>
            <p className="text-sm text-[#41484d]">
              Veuillez vous authentifier pour acceder au portail de gestion.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#41484d]"
              >
                Email institutionnel
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#71787e]">
                  @
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@ucar.rnu.tn"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-[#c1c7ce] bg-white py-2 pl-9 pr-3 text-sm text-[#1b1c1a] outline-none transition-colors placeholder:text-[#71787e] focus:border-[#c8a74b]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#41484d]"
                >
                  Mot de passe
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#1b4f6b] hover:underline"
                >
                  Mot de passe oublie ?
                </Link>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#71787e]">
                  *
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-[#c1c7ce] bg-white py-2 pl-9 pr-3 text-sm text-[#1b1c1a] outline-none transition-colors placeholder:text-[#71787e] focus:border-[#c8a74b]"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded border border-[#ffdad6] bg-[#fff4f2] px-3 py-2 text-sm text-[#93000a]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#1b4f6b] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#336380] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{isLoading ? "Connexion..." : "Se connecter"}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>

            <p className="pt-2 text-center text-sm text-[#41484d]">
              Vous n&apos;avez pas de compte ?{" "}
              <Link href="/auth/sign-up" className="text-[#1b4f6b] underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
