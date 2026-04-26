import type { ComponentProps } from "react";
import DomainDashboardPage from "./DomainDashboardPage";

type DashboardProps = ComponentProps<typeof DomainDashboardPage>;

export type InstitutionDomainKey =
  | "dashboard"
  | "academic"
  | "employment"
  | "finance"
  | "hr"
  | "research"
  | "esg"
  | "infrastructure"
  | "partnerships";

const DOMAIN_CONTENT: Record<InstitutionDomainKey, DashboardProps> = {
  dashboard: {
    title: "Vue d'ensemble institution",
    subtitle: "Suivi consolide de tous les domaines",
  },
  academic: {
    title: "Dashboard académique & pédagogie",
    subtitle: "Suivi des parcours, progression et examens",
  },
  employment: {
    title: "Dashboard emploi & alumni",
    subtitle: "Insertion professionnelle et réseau des diplômés",
  },
  finance: {
    title: "Dashboard finance & comptabilité",
    subtitle: "Exécution budgétaire et performance de dépense",
  },
  hr: {
    title: "Dashboard ressources humaines",
    subtitle: "Pilotage des effectifs, charges et stabilité",
  },
  research: {
    title: "Dashboard recherche & innovation",
    subtitle: "Production scientifique, projets et financement",
  },
  esg: {
    title: "Dashboard ESG & RSE",
    subtitle: "Environnement, inclusion et gouvernance",
  },
  infrastructure: {
    title: "Dashboard infrastructure & équipements",
    subtitle: "Salles, IT et travaux en cours",
  },
  partnerships: {
    title: "Dashboard partenariats & mobilité",
    subtitle: "Accords actifs et flux de mobilité",
  },
};

export function getInstitutionDomainDashboard(domain: InstitutionDomainKey): DashboardProps {
  return DOMAIN_CONTENT[domain];
}
