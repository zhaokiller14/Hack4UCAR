/**
 * UCAR Institution Constants
 * 
 * This file contains configuration data for UCAR's affiliated institutions.
 * Each institution can have a custom logo and display name.
 */

/**
 * List of UCAR affiliated institutions with their logo URLs.
 * Institutions not in this list will use the default UCAR logo.
 */
export const INSTITUTION_LOGOS: Record<string, string> = {
  insat: "https://insat.rnu.tn/assets/images/insat_logo.png",
  supcom: "https://www.supcom.tn/storage/app/public/coordonnees/April2025/aa8HeWk95QdtPlGED1ZY.png",
  ept: "https://www.ept.tn/sites/default/files/logo_final_corr.png",
  enau: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyW7fxFhH975nwKAnFgHXgOdqiDTUUcAlvug&s",
  enicarthage: "http://www.enicarthage.rnu.tn/assets/images/logo.png",
  enstab: "https://enstab.rnu.tn/assets/img/Enstab-logo-3.png",
  enib: "https://enib.rnu.tn/images/headers/eur-ace.jpg",
  essai: "http://www.essai.rnu.tn/images/logo-essai-rectorat-ministere.png",
  fsjpst: "https://fsjpst.rnu.tn/wp-content/uploads/2020/03/logo_fr.png",
  fsb: "http://www.fsb.rnu.tn/images/logotest.jpg",
  fsegn: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp1a35jDPfNnL_pxyAoLFM1-3HndMLKfIl8w&s",
  ihec: "https://ihec.rnu.tn/images/ihec_carthage_bleu.svg",
  esac: "https://scontent-pmo1-1.xx.fbcdn.net/v/t39.30808-6/564556435_1367812775353329_5205640491738934050_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=1Jlk8D2UU0kQ7kNvwFhNSZt&_nc_oc=AdpS1nBqgQwodXO3iFtdmGO-cF7PbaIxOUJUIIIaIG6ivIgpK42pAlRbV_pfXGdJ9z4&_nc_zt=23&_nc_ht=scontent-pmo1-1.xx&_nc_gid=3_1qWIZr_OxqgV_GGraBiQ&_nc_ss=7a2a8&oh=00_Af0p_o04XtEEOe6sUxEHHdyfZq8zYI1i6x8LRbE84GWQoA&oe=69F356EE",
  isban: "http://www.isban.rnu.tn/logo.png",
  islt: "http://www.islt.rnu.tn/wp-content/uploads/2020/09/logo-islt-blanc-1.png",
  isln: "http://www.isln.rnu.tn/Fr/static/fr/image/gif/islain.gif",
};

/**
 * Default logo path for institutions without a specific logo.
 */
export const DEFAULT_INSTITUTION_LOGO = "/ucar-logo.png";

/**
 * Get the logo path for an institution.
 * Returns the institution-specific logo if available, otherwise the default UCAR logo.
 * Handles case-insensitive matching since institution IDs may be stored in different cases.
 * 
 * @param institutionId - The institution identifier
 * @returns The path to the institution's logo
 */
export function getInstitutionLogo(institutionId: string): string {
  if (!institutionId) return DEFAULT_INSTITUTION_LOGO;
  
  // Try exact match first
  if (INSTITUTION_LOGOS[institutionId]) {
    return INSTITUTION_LOGOS[institutionId];
  }
  
  // Try lowercase match
  const lowerId = institutionId.toLowerCase();
  if (INSTITUTION_LOGOS[lowerId]) {
    return INSTITUTION_LOGOS[lowerId];
  }
  
  // Try uppercase match
  const upperId = institutionId.toUpperCase();
  if (INSTITUTION_LOGOS[upperId]) {
    return INSTITUTION_LOGOS[upperId];
  }
  
  return DEFAULT_INSTITUTION_LOGO;
}

/**
 * Check if an institution has a custom logo.
 * 
 * @param institutionId - The institution identifier
 * @returns true if the institution has a custom logo
 */
export function hasCustomLogo(institutionId: string): boolean {
  return institutionId in INSTITUTION_LOGOS;
}

/**
 * Academic year format used in the platform.
 */
export const ACADEMIC_YEAR_FORMAT = "YYYY-YYYY";

/**
 * Default period types for KPI reporting.
 */
export const PERIOD_TYPES = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  ANNUAL: "annual",
} as const;

/**
 * KPI domains available in the platform.
 */
export const KPI_DOMAINS = {
  FINANCE: "finance",
  ACADEMIC: "academic",
  HR: "hr",
  RESEARCH: "research",
  PARTNERSHIPS: "partnerships",
  EMPLOYMENT: "employment",
  ESG: "esg",
  INFRASTRUCTURE: "infrastructure",
} as const;

/**
 * Display labels for KPI domains.
 */
export const KPI_DOMAIN_LABELS: Record<string, string> = {
  finance: "Finance & Comptabilité",
  academic: "Académique & Pédagogie",
  hr: "Ressources Humaines",
  research: "Recherche & Innovation",
  partnerships: "Partenariats & Mobilité",
  employment: "Emploi & Alumni",
  esg: "ESG & RSE",
  infrastructure: "Infrastructure & Équipement",
};

/**
 * File upload constraints.
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ],
  ALLOWED_EXTENSIONS: [".pdf", ".csv", ".xls", ".xlsx"],
};

/**
 * Confidence thresholds for AI extraction.
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0.3,
};