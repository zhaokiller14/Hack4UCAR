export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type KpiDomain =
  | "academic"
  | "finance"
  | "hr"
  | "research"
  | "partnerships"
  | "infrastructure"
  | "esg"
  | "employment";

export type AlertRule = {
  domain: KpiDomain;
  kpi_key: string;
  messageTemplate: (value: number, threshold: number) => string;
  getSeverity: (value: number) => { severity: AlertSeverity; threshold: number } | null;
};

export const ALERT_RULES: AlertRule[] = [
  // Academic
  {
    domain: "academic",
    kpi_key: "dropout_rate",
    messageTemplate: (v, t) => `Taux d'abandon ${v.toFixed(1)}% dépasse le seuil de ${t}%`,
    getSeverity: (v) =>
      v > 30 ? { severity: "critical", threshold: 30 } :
      v > 20 ? { severity: "high",     threshold: 20 } : null,
  },
  {
    domain: "academic",
    kpi_key: "success_rate",
    messageTemplate: (v, t) => `Taux de réussite ${v.toFixed(1)}% en dessous du seuil de ${t}%`,
    getSeverity: (v) =>
      v < 45 ? { severity: "high",   threshold: 45 } :
      v < 60 ? { severity: "medium", threshold: 60 } : null,
  },

  // Finance
  {
    domain: "finance",
    kpi_key: "execution_rate",
    messageTemplate: (v, t) =>
      v > 100
        ? `Dépassement budgétaire : taux d'exécution ${v.toFixed(1)}%`
        : `Taux d'exécution faible : ${v.toFixed(1)}% (seuil ${t}%)`,
    getSeverity: (v) =>
      v > 100 ? { severity: "high",   threshold: 100 } :
      v < 70  ? { severity: "medium", threshold: 70  } : null,
  },

  // HR
  {
    domain: "hr",
    kpi_key: "absenteeism_rate",
    messageTemplate: (v, t) => `Taux d'absentéisme ${v.toFixed(1)}% dépasse le seuil de ${t}%`,
    getSeverity: (v) =>
      v > 15 ? { severity: "high",   threshold: 15 } :
      v > 10 ? { severity: "medium", threshold: 10 } : null,
  },
  {
    domain: "hr",
    kpi_key: "avg_teaching_load",
    messageTemplate: (v, t) => `Charge enseignement moyenne ${v.toFixed(1)}h/sem dépasse ${t}h`,
    getSeverity: (v) =>
      v > 22 ? { severity: "high",   threshold: 22 } :
      v > 18 ? { severity: "medium", threshold: 18 } : null,
  },

  // Employment
  {
    domain: "employment",
    kpi_key: "employability_rate",
    messageTemplate: (v, t) => `Taux d'employabilité faible : ${v.toFixed(1)}% (seuil ${t}%)`,
    getSeverity: (v) =>
      v < 30 ? { severity: "high",   threshold: 30 } :
      v < 50 ? { severity: "medium", threshold: 50 } : null,
  },

  // Research
  {
    domain: "research",
    kpi_key: "active_projects",
    messageTemplate: () => `Aucun projet de recherche actif`,
    getSeverity: (v) =>
      v === 0 ? { severity: "low", threshold: 1 } : null,
  },

  // ESG
  {
    domain: "esg",
    kpi_key: "recycling_rate",
    messageTemplate: (v, t) => `Taux de recyclage faible : ${v.toFixed(1)}% (seuil ${t}%)`,
    getSeverity: (v) =>
      v < 20 ? { severity: "high",   threshold: 20 } :
      v < 30 ? { severity: "medium", threshold: 30 } : null,
  },

  // Infrastructure
  {
    domain: "infrastructure",
    kpi_key: "operational_rate",
    messageTemplate: (v, t) => `Taux opérationnel faible : ${v.toFixed(1)}% (seuil ${t}%)`,
    getSeverity: (v) =>
      v < 60 ? { severity: "high",   threshold: 60 } :
      v < 80 ? { severity: "medium", threshold: 80 } : null,
  },

  // Partnerships
  {
    domain: "partnerships",
    kpi_key: "active_partnerships",
    messageTemplate: () => `Aucun partenariat actif`,
    getSeverity: (v) =>
      v === 0 ? { severity: "low", threshold: 1 } : null,
  },
];
