// quick and dirty i18n solution for fixed sets of values in the app
export const FR = {
  severity: {
    low:      "Faible",
    medium:   "Moyen",
    high:     "Élevé",
    critical: "Critique",
  },

  studentStatus: {
    active:      "Actif",
    graduated:   "Diplômé",
    dropped:     "Abandonné",
    suspended:   "Suspendu",
    transferred: "Transféré",
  },

  staffRole: {
    teaching:       "Enseignant",
    administrative: "Administratif",
    technical:      "Technique",
    research:       "Recherche",
  },

  contractType: {
    permanent:  "Permanent",
    fixed_term: "Durée déterminée",
    part_time:  "Temps partiel",
    visiting:   "Vacataire",
  },

  researchStatus: {
    active:    "Actif",
    completed: "Terminé",
    cancelled: "Annulé",
  },

  examType: {
    midterm: "Partiel",
    final:   "Final",
    makeup:  "Rattrapage",
  },

  esgPeriodType: {
    monthly:  "Mensuel",
    semester: "Semestriel",
    annual:   "Annuel",
  },

  infraStatus: {
    operational:    "Opérationnel",
    maintenance:    "En maintenance",
    out_of_service: "Hors service",
  },

  infraAssetType: {
    classroom: "Salle de classe",
    lab:       "Laboratoire",
    office:    "Bureau",
    server:    "Serveur",
  },

  partnershipType: {
    academic:   "Académique",
    industry:   "Industrie",
    government: "Gouvernement",
    ngo:        "ONG",
  },

  budgetCategory: {
    maintenance: "Maintenance",
    salaries:    "Salaires",
    equipment:   "Équipements",
    operations:  "Opérations",
    other:       "Autre",
  },

  trainingStatus: {
    true:  "Complété",
    false: "En cours",
  },

  activeStatus: {
    true:  "Actif",
    false: "Inactif",
  },

  kpiDomain: {
    academic:       "Académique",
    finance:        "Finance",
    hr:             "RH",
    research:       "Recherche",
    esg:            "ESG",
    employment:     "Emploi",
    infrastructure: "Infrastructure",
    partnerships:   "Partenariats",
  },
} as const;

/** Translate a value with a fallback to the raw value if not found. */
export function t(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}
