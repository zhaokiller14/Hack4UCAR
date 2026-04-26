"use client";

import { useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";
import { publishAnnouncement } from "@/lib/actions/announcements";

const AUDIENCE_OPTIONS = [
  { value: "all",                  label: "Tous les utilisateurs" },
  { value: "institution_admin",    label: "Directeurs d'établissement" },
  { value: "finance_manager",      label: "Responsables finance" },
  { value: "hr_manager",           label: "Responsables RH" },
  { value: "academic_manager",     label: "Responsables académiques" },
  { value: "research_manager",     label: "Responsables recherche" },
  { value: "partnerships_manager", label: "Responsables partenariats" },
  { value: "esg_manager",          label: "Responsables ESG" },
  { value: "infrastructure_manager", label: "Responsables infrastructure" },
];

const INPUT = "w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003850]";

export default function AnnouncementComposer() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await publishAnnouncement(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        formRef.current?.reset();
        setTimeout(() => setSuccess(false), 4000);
      }
    });
  }

  return (
    <SectionCard title="Nouvelle annonce" description="Diffuser un message à tout ou partie du réseau UCAR">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Titre</label>
          <input name="title" className={INPUT} placeholder="Titre de l'annonce" required />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Message</label>
          <textarea name="body" rows={4} className={INPUT + " resize-none"} placeholder="Rédigez votre annonce…" required />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Destinataires</label>
          <select name="audience" className={INPUT}>
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#003850] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#1B4F6B] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {pending ? "Publication…" : success ? "Annonce publiée !" : "Publier l'annonce"}
        </button>
      </form>
    </SectionCard>
  );
}
