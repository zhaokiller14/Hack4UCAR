"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";

const AUDIENCE_OPTIONS = [
  { value: "all",                  label: "Tous les utilisateurs" },
  { value: "super_admin",          label: "Super administrateurs" },
  { value: "institution_admin",    label: "Directeurs d'établissement" },
  { value: "finance_manager",      label: "Responsables finance" },
  { value: "hr_manager",           label: "Responsables RH" },
  { value: "academic_manager",     label: "Responsables académiques" },
];

export default function AnnouncementComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTitle("");
      setBody("");
      setAudience("all");
      setTimeout(() => setSent(false), 3000);
    }, 800);
  }

  const inputCls = "w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-[#1B1C1A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F6B]";

  return (
    <SectionCard title="Nouvelle annonce" description="Diffuser un message à tout ou partie du réseau">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="ann-title" className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Titre
          </label>
          <input
            id="ann-title"
            className={inputCls}
            placeholder="Titre de l'annonce"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ann-body" className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Message
          </label>
          <textarea
            id="ann-body"
            rows={4}
            className={inputCls + " resize-none"}
            placeholder="Rédigez votre annonce…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ann-audience" className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Destinataires
          </label>
          <select
            id="ann-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className={inputCls}
          >
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 bg-[#003850] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-sm hover:bg-[#1B4F6B] transition-colors disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {sending ? "Envoi en cours…" : sent ? "Annonce envoyée !" : "Publier l'annonce"}
        </button>
      </form>
    </SectionCard>
  );
}
