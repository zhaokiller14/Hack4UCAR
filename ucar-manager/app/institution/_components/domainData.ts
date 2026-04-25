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
    kpis: [
      { title: "Taux de reussite", value: "81.4%", delta: "+1.9%", accentColor: "#2E7D32" },
      { title: "Execution budget", value: "89.2%", delta: "+3.4%", accentColor: "#2E7D32" },
      { title: "Employabilite", value: "74.0%", delta: "+0.6%", accentColor: "#1B4F6B" },
      { title: "Absenteisme", value: "7.9%", delta: "-0.4%", accentColor: "#2E7D32" },
    ],
    alerts: [
      { id: "a1", metric: "Abandon semestre 2", detail: "Hausse de 1.7 points sur la filiere Genie Civil.", severity: "high" },
      { id: "a2", metric: "Execution budget IT", detail: "Depot de factures en retard, risque sur la cloture mensuelle.", severity: "medium" },
      { id: "a3", metric: "Retard publication notes", detail: "2 departements n'ont pas finalise les PV d'examens.", severity: "critical" },
    ],
    goals: [
      { label: "Objectif reussite", progress: 78, target: "85%" },
      { label: "Objectif budget", progress: 89, target: "95%" },
      { label: "Objectif employabilite", progress: 74, target: "80%" },
      { label: "Objectif satisfaction etudiants", progress: 67, target: "75%" },
    ],
    pipeline: [
      { id: "p1", name: "Import KPI acad", updatedAt: "Aujourd'hui 08:42", status: "completed" },
      { id: "p2", name: "Consolidation RH", updatedAt: "Aujourd'hui 08:10", status: "processing" },
      { id: "p3", name: "Controle coherence finance", updatedAt: "Hier 19:35", status: "completed" },
    ],
    actions: [
      { id: "ac1", label: "Lancer audit sur les absences critiques", owner: "Direction RH" },
      { id: "ac2", label: "Finaliser plan de rattrapage pour L2", owner: "Vice-doyen Academique" },
      { id: "ac3", label: "Valider avenants des marches IT", owner: "Direction Administrative" },
    ],
    reports: [
      { id: "r1", title: "Synthese KPI institution", period: "Semaine 17, 2026" },
      { id: "r2", title: "Comite de pilotage", period: "Avril 2026" },
      { id: "r3", title: "Comparatif N vs N-1", period: "T1 2026" },
    ],
  },
  academic: {
    title: "Dashboard academique & pedagogie",
    subtitle: "Suivi des parcours, progression et examens",
    kpis: [
      { title: "Étudiants inscrits", value: "—", delta: "—", accentColor: "#1B4F6B" },
      { title: "Taux de réussite", value: "—", delta: "—", accentColor: "#2E7D32" },
      { title: "Taux d'abandon", value: "—", delta: "—", accentColor: "#BA1A1A" },
      { title: "Taux de redoublement", value: "—", delta: "—", accentColor: "#C8A74B" },
    ],
    alerts: [
      { id: "a1", metric: "Cours non assures", detail: "18 seances non dispensees sur les 10 derniers jours.", severity: "high" },
      { id: "a2", metric: "Resultats modules", detail: "2 modules sous le seuil de 50% de reussite.", severity: "critical" },
      { id: "a3", metric: "Risque abandon", detail: "34 etudiants identifies avec absences repetitives.", severity: "medium" },
    ],
    goals: [
      { label: "Reussite globale", progress: 79, target: "85%" },
      { label: "Progression pedagogique", progress: 72, target: "80%" },
      { label: "Couverture evaluative", progress: 88, target: "95%" },
      { label: "Reduction abandon", progress: 61, target: "< 5%" },
    ],
    pipeline: [
      { id: "p1", name: "Import notes fin module", updatedAt: "Aujourd'hui 07:54", status: "completed" },
      { id: "p2", name: "Pointage assiduite", updatedAt: "Aujourd'hui 07:22", status: "completed" },
      { id: "p3", name: "Detection risques abandon", updatedAt: "Hier 22:08", status: "processing" },
    ],
    actions: [
      { id: "ac1", label: "Activer cellules d'accompagnement pedagogique", owner: "Direction des etudes" },
      { id: "ac2", label: "Programmer sessions de rattrapage", owner: "Chefs de departement" },
      { id: "ac3", label: "Notifier les tuteurs des etudiants en risque", owner: "Service scolarite" },
    ],
    reports: [
      { id: "r1", title: "Bilan examens", period: "Session principale 2026" },
      { id: "r2", title: "Tableau absentisme etudiant", period: "Mois courant" },
      { id: "r3", title: "Suivi pedagogique par niveau", period: "Semestre 2" },
    ],
  },
  employment: {
    title: "Dashboard emploi & alumni",
    subtitle: "Insertion professionnelle et reseau des diplomes",
    kpis: [
      { title: "Employabilite", value: "76.9%", delta: "+2.1%", accentColor: "#2E7D32" },
      { title: "Delai vers emploi", value: "5.2 mois", delta: "-0.4", accentColor: "#2E7D32" },
      { title: "Partenariats nationaux", value: "42", delta: "+3", accentColor: "#1B4F6B" },
      { title: "Partenariats internationaux", value: "17", delta: "+1", accentColor: "#1B4F6B" },
    ],
    alerts: [
      { id: "a1", metric: "Baisse insertion SI", detail: "La filiere SI enregistre -4.3 points sur 2 trimestres.", severity: "high" },
      { id: "a2", metric: "Faible reponse enquete alumni", detail: "Taux de reponse inferieur a 40% pour la promotion 2025.", severity: "medium" },
      { id: "a3", metric: "Conventions a renouveler", detail: "5 conventions entreprise expirent dans moins de 30 jours.", severity: "critical" },
    ],
    goals: [
      { label: "Employabilite a 6 mois", progress: 77, target: "82%" },
      { label: "Insertion via stages", progress: 69, target: "75%" },
      { label: "Activation reseau alumni", progress: 58, target: "70%" },
      { label: "Partenariats internationaux", progress: 71, target: "20 accords" },
    ],
    pipeline: [
      { id: "p1", name: "Collecte insertion diplomes", updatedAt: "Aujourd'hui 08:16", status: "processing" },
      { id: "p2", name: "Sync CRM partenaires", updatedAt: "Aujourd'hui 07:40", status: "completed" },
      { id: "p3", name: "Campagne alumni", updatedAt: "Hier 18:55", status: "completed" },
    ],
    actions: [
      { id: "ac1", label: "Relancer les diplomes non repondants", owner: "Bureau employabilite" },
      { id: "ac2", label: "Planifier forum emploi campus", owner: "Relations entreprises" },
      { id: "ac3", label: "Signer 3 nouvelles conventions stage", owner: "Direction partenariats" },
    ],
    reports: [
      { id: "r1", title: "Rapport insertion par filiere", period: "T1 2026" },
      { id: "r2", title: "Etat conventions entreprises", period: "Mensuel" },
      { id: "r3", title: "Tableau alumni actifs", period: "2025-2026" },
    ],
  },
  finance: {
    title: "Dashboard finance & comptabilite",
    subtitle: "Execution budgetaire et performance de depense",
    kpis: [
      { title: "Budget alloué", value: "—", delta: "—", accentColor: "#1B4F6B" },
      { title: "Budget consommé", value: "—", delta: "—", accentColor: "#1B4F6B" },
      { title: "Taux d'exécution", value: "—", delta: "—", accentColor: "#C8A74B" },
      { title: "Coût par étudiant", value: "—", delta: "—", accentColor: "#1B4F6B" },
    ],
    alerts: [
      { id: "a1", metric: "Depassement maintenance", detail: "Depense superieure de 12% a la trajectoire previsionnelle.", severity: "high" },
      { id: "a2", metric: "Retard engagements", detail: "2 lignes budgetaires ne sont pas encore engagees.", severity: "medium" },
      { id: "a3", metric: "Risque cloture", detail: "Des pieces justificatives manquent pour 3 dossiers.", severity: "critical" },
    ],
    goals: [
      { label: "Execution budgetaire", progress: 89, target: "95%" },
      { label: "Maitrise cout etudiant", progress: 76, target: "< 4 500 TND" },
      { label: "Delai de paiement", progress: 67, target: "< 30 jours" },
      { label: "Depenses pedagogiques", progress: 82, target: ">= 35%" },
    ],
    pipeline: [
      { id: "p1", name: "Import ecritures", updatedAt: "Aujourd'hui 08:32", status: "completed" },
      { id: "p2", name: "Reconciliation fournisseurs", updatedAt: "Aujourd'hui 07:58", status: "processing" },
      { id: "p3", name: "Controle analytique", updatedAt: "Hier 21:40", status: "completed" },
    ],
    actions: [
      { id: "ac1", label: "Regulariser dossiers non soldes", owner: "Comptabilite" },
      { id: "ac2", label: "Reprioriser enveloppe equipements", owner: "DAF" },
      { id: "ac3", label: "Plan de reduction cout energie", owner: "Services generaux" },
    ],
    reports: [
      { id: "r1", title: "Etat execution budget", period: "Mois courant" },
      { id: "r2", title: "Analyse depenses par departement", period: "T1 2026" },
      { id: "r3", title: "Projection fin d'annee", period: "2026" },
    ],
  },
  hr: {
    title: "Dashboard ressources humaines",
    subtitle: "Pilotage des effectifs, charges et stabilite",
    kpis: [
      { title: "Effectif total", value: "—", delta: "—", accentColor: "#1B4F6B" },
      { title: "Absentéisme", value: "—", delta: "—", accentColor: "#2E7D32" },
      { title: "Charge enseignement moy.", value: "—", delta: "—", accentColor: "#C8A74B" },
      { title: "Personnel recherche", value: "—", delta: "—", accentColor: "#1B4F6B" },
    ],
    alerts: [
      { id: "a1", metric: "Surcharge enseignante", detail: "3 departements depassent 18h hebdomadaires en moyenne.", severity: "high" },
      { id: "a2", metric: "Retard plan formation", detail: "Le taux de completion reste sous 60% pour les equipes admin.", severity: "medium" },
      { id: "a3", metric: "Turnover critiques", detail: "2 demissions sur des fonctions cle IT ce trimestre.", severity: "critical" },
    ],
    goals: [
      { label: "Stabilite des equipes", progress: 73, target: ">= 85%" },
      { label: "Reduction absenteisme", progress: 79, target: "< 6%" },
      { label: "Plan de formation", progress: 71, target: "90%" },
      { label: "Equilibre charge enseignement", progress: 66, target: "< 15h" },
    ],
    pipeline: [
      { id: "p1", name: "Pointage RH", updatedAt: "Aujourd'hui 08:05", status: "completed" },
      { id: "p2", name: "Sync absences", updatedAt: "Aujourd'hui 07:37", status: "completed" },
      { id: "p3", name: "Mise a jour formations", updatedAt: "Hier 20:12", status: "processing" },
    ],
    actions: [
      { id: "ac1", label: "Lancer plan retention talents", owner: "Direction RH" },
      { id: "ac2", label: "Redistribuer charge des modules lourds", owner: "Direction Academique" },
      { id: "ac3", label: "Accroitre sessions formation numerique", owner: "Cellule formation" },
    ],
    reports: [
      { id: "r1", title: "Bilan social", period: "Trim. en cours" },
      { id: "r2", title: "Suivi absences et conges", period: "Mensuel" },
      { id: "r3", title: "Charge pedagogique", period: "Semestre 2" },
    ],
  },
  research: {
    title: "Dashboard recherche & innovation",
    subtitle: "Production scientifique, projets et financement",
    kpis: [
      { title: "Publications", value: "142", delta: "+11", accentColor: "#2E7D32" },
      { title: "Projets actifs", value: "28", delta: "+2", accentColor: "#1B4F6B" },
      { title: "Financement securise", value: "3.7 M TND", delta: "+9%", accentColor: "#2E7D32" },
      { title: "Brevets deposes", value: "6", delta: "+1", accentColor: "#1B4F6B" },
    ],
    alerts: [
      { id: "a1", metric: "Retard livrables projet", detail: "2 projets nationaux depassent les jalons de 20 jours.", severity: "high" },
      { id: "a2", metric: "Sous-performance publications", detail: "Un laboratoire a -18% vs objectif semestriel.", severity: "medium" },
      { id: "a3", metric: "Renouvellement financement", detail: "3 contrats arrivent a echeance au prochain trimestre.", severity: "critical" },
    ],
    goals: [
      { label: "Publications indexees", progress: 74, target: "180" },
      { label: "Projets competitifs", progress: 68, target: "35" },
      { label: "Montant financements", progress: 79, target: "4.5 M" },
      { label: "Partenariats acad. actifs", progress: 72, target: "24" },
    ],
    pipeline: [
      { id: "p1", name: "Collecte publications", updatedAt: "Aujourd'hui 08:27", status: "completed" },
      { id: "p2", name: "Update projets", updatedAt: "Aujourd'hui 07:51", status: "processing" },
      { id: "p3", name: "Consolidation financements", updatedAt: "Hier 19:16", status: "completed" },
    ],
    actions: [
      { id: "ac1", label: "Accroitre soumissions internationales", owner: "Direction recherche" },
      { id: "ac2", label: "Accelerer valorisation brevets", owner: "Cellule innovation" },
      { id: "ac3", label: "Prioriser projets a impact socio-economique", owner: "Comite scientifique" },
    ],
    reports: [
      { id: "r1", title: "Performance recherche", period: "T1 2026" },
      { id: "r2", title: "Portefeuille projets", period: "Mensuel" },
      { id: "r3", title: "Financement par axe", period: "2026" },
    ],
  },
  esg: {
    title: "Dashboard ESG & RSE",
    subtitle: "Environnement, inclusion et gouvernance",
    kpis: [
      { title: "Conso energie", value: "-8.4%", delta: "vs N-1", accentColor: "#2E7D32" },
      { title: "Empreinte carbone", value: "-6.1%", delta: "vs N-1", accentColor: "#2E7D32" },
      { title: "Taux recyclage", value: "52%", delta: "+4%", accentColor: "#1B4F6B" },
      { title: "Accessibilite campus", value: "81%", delta: "+3%", accentColor: "#1B4F6B" },
    ],
    alerts: [
      { id: "a1", metric: "Consommation nocturne", detail: "Pics anormaux detectes sur 2 batiments administratifs.", severity: "high" },
      { id: "a2", metric: "Tri selectif", detail: "Le ratio de tri chute en dessous de 45% sur un pole.", severity: "medium" },
      { id: "a3", metric: "Accessibilite", detail: "Des travaux urgents restent a planifier sur 3 zones.", severity: "critical" },
    ],
    goals: [
      { label: "Reduction energie", progress: 66, target: "-12%" },
      { label: "Neutralite carbone", progress: 54, target: "-20%" },
      { label: "Recyclage campus", progress: 52, target: "65%" },
      { label: "Accessibilite complete", progress: 81, target: "95%" },
    ],
    pipeline: [
      { id: "p1", name: "Import compteurs energie", updatedAt: "Aujourd'hui 08:20", status: "completed" },
      { id: "p2", name: "Consolidation dechets", updatedAt: "Aujourd'hui 07:35", status: "processing" },
      { id: "p3", name: "Audit accessibilite", updatedAt: "Hier 17:50", status: "completed" },
    ],
    actions: [
      { id: "ac1", label: "Finaliser plan sobriete energetique", owner: "Direction patrimoine" },
      { id: "ac2", label: "Etendre stations de tri", owner: "Cellule environnement" },
      { id: "ac3", label: "Programmer travaux accessibilite", owner: "Direction technique" },
    ],
    reports: [
      { id: "r1", title: "Tableau ESG", period: "Mensuel" },
      { id: "r2", title: "Bilan carbone", period: "T1 2026" },
      { id: "r3", title: "Suivi inclusion campus", period: "Semestriel" },
    ],
  },
  infrastructure: {
    title: "Dashboard infrastructure & equipements",
    subtitle: "Salles, IT et travaux en cours",
    kpis: [
      { title: "Occupation salles", value: "84%", delta: "+2%", accentColor: "#1B4F6B" },
      { title: "Etat parc IT", value: "91%", delta: "+1%", accentColor: "#2E7D32" },
      { title: "Disponibilite equipements", value: "88%", delta: "-1%", accentColor: "#C8A74B" },
      { title: "Travaux en cours", value: "7", delta: "+2", accentColor: "#1B4F6B" },
    ],
    alerts: [
      { id: "a1", metric: "Salles surutilisees", detail: "4 salles depassent 95% d'occupation hebdomadaire.", severity: "high" },
      { id: "a2", metric: "Incidents reseau", detail: "Ralentissements repetes sur le bloc B.", severity: "medium" },
      { id: "a3", metric: "Travaux critiques", detail: "Retard planning sur chantier amphitheatre principal.", severity: "critical" },
    ],
    goals: [
      { label: "Disponibilite IT", progress: 91, target: "95%" },
      { label: "Maintenance preventive", progress: 73, target: "90%" },
      { label: "Occupation optimisee", progress: 84, target: "88%" },
      { label: "Livraison travaux", progress: 62, target: "100%" },
    ],
    pipeline: [
      { id: "p1", name: "Sync inventaire equipements", updatedAt: "Aujourd'hui 08:30", status: "completed" },
      { id: "p2", name: "Etat maintenance", updatedAt: "Aujourd'hui 07:48", status: "processing" },
      { id: "p3", name: "Suivi chantiers", updatedAt: "Hier 18:30", status: "completed" },
    ],
    actions: [
      { id: "ac1", label: "Redistribuer occupation salles TD", owner: "Service planning" },
      { id: "ac2", label: "Prioriser remplacement switches bloc B", owner: "DSI" },
      { id: "ac3", label: "Rattraper lot electricite chantier A", owner: "Direction technique" },
    ],
    reports: [
      { id: "r1", title: "Etat infrastructures", period: "Hebdomadaire" },
      { id: "r2", title: "Disponibilite parc IT", period: "Mensuel" },
      { id: "r3", title: "Suivi travaux", period: "Avril 2026" },
    ],
  },
  partnerships: {
    title: "Dashboard partenariats & mobilite",
    subtitle: "Accords actifs et flux de mobilite",
    kpis: [
      { title: "Accords actifs", value: "58", delta: "+4", accentColor: "#1B4F6B" },
      { title: "Mobilite entrante", value: "126", delta: "+9%", accentColor: "#2E7D32" },
      { title: "Mobilite sortante", value: "102", delta: "+7%", accentColor: "#2E7D32" },
      { title: "Projets internationaux", value: "14", delta: "+2", accentColor: "#1B4F6B" },
    ],
    alerts: [
      { id: "a1", metric: "Conventions a renouveler", detail: "8 accords expirent au prochain semestre.", severity: "high" },
      { id: "a2", metric: "Mobilite desequilibree", detail: "Sortants inferieurs de 22% aux entrants.", severity: "medium" },
      { id: "a3", metric: "Retard dossiers visas", detail: "12 dossiers en attente peuvent impacter la rentree.", severity: "critical" },
    ],
    goals: [
      { label: "Renouvellement accords", progress: 69, target: "100%" },
      { label: "Mobilite sortante", progress: 64, target: "130" },
      { label: "Projets coop internationaux", progress: 71, target: "18" },
      { label: "Reseaux academiques", progress: 76, target: "22" },
    ],
    pipeline: [
      { id: "p1", name: "Sync conventions", updatedAt: "Aujourd'hui 08:14", status: "completed" },
      { id: "p2", name: "MAJ mobilite etudiante", updatedAt: "Aujourd'hui 07:46", status: "processing" },
      { id: "p3", name: "Consolidation projets", updatedAt: "Hier 19:05", status: "completed" },
    ],
    actions: [
      { id: "ac1", label: "Prioriser renouvellement des 8 accords", owner: "Relations internationales" },
      { id: "ac2", label: "Augmenter bourses mobilite sortante", owner: "Direction cooperation" },
      { id: "ac3", label: "Cibler 3 nouveaux reseaux universitaires", owner: "Direction institutionnelle" },
    ],
    reports: [
      { id: "r1", title: "Performance partenariats", period: "Mensuel" },
      { id: "r2", title: "Flux mobilite", period: "Semestre 2" },
      { id: "r3", title: "Portefeuille projets internationaux", period: "2026" },
    ],
  },
};

export function getInstitutionDomainDashboard(domain: InstitutionDomainKey): DashboardProps {
  return DOMAIN_CONTENT[domain];
}
