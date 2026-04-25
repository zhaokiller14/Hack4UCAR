import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F6F3] px-6 py-10 text-[#0D2B3E]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(201, 168, 76, 0.18), transparent 35%), radial-gradient(circle at 80% 80%, rgba(27, 79, 107, 0.18), transparent 40%)",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-[#1B4F6B]/15 bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(13,43,62,0.45)] backdrop-blur-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1B4F6B]">UCAR</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-[#1B4F6B] md:text-6xl">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-[#0D2B3E]">Acces refuse</h2>
        <p className="mt-3 max-w-xl text-base text-[#0D2B3E]/70">
          Vous n&apos;avez pas les permissions necessaires pour acceder a cette page.
          Retournez vers votre espace autorise pour continuer.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/ucar/dashboard"
            className="rounded-md bg-[#1B4F6B] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#153e54]"
          >
            Aller au dashboard
          </Link>
          <Link
            href="/auth/login"
            className="rounded-md border border-[#1B4F6B] px-6 py-2.5 text-sm font-medium text-[#1B4F6B] transition-colors hover:bg-[#1B4F6B]/5"
          >
            Changer de compte
          </Link>
        </div>
      </div>
    </main>
  );
}