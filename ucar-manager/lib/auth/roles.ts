export const APP_ROLES = [
  "ucar_admin",
  "admin",
  "hr_manager",
  "finance_manager",
  "academic_manager",
  "research_manager",
  "partnerships_manager",
  "esg_manager",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const INSTITUTION_ROLES = [
  "admin",
  "hr_manager",
  "finance_manager",
  "academic_manager",
  "research_manager",
  "partnerships_manager",
  "esg_manager",
] as const;

export type InstitutionRole = (typeof INSTITUTION_ROLES)[number];

const APP_ROLE_SET = new Set<string>(APP_ROLES);
const INSTITUTION_ROLE_SET = new Set<string>(INSTITUTION_ROLES);

export function isAppRole(role: unknown): role is AppRole {
  return typeof role === "string" && APP_ROLE_SET.has(role);
}

export function isInstitutionRole(role: unknown): role is InstitutionRole {
  return typeof role === "string" && INSTITUTION_ROLE_SET.has(role);
}

export function getRoleHomePath(role: unknown): string | null {
  if (role === "ucar_admin") {
    return "/ucar/dashboard";
  }

  if (isInstitutionRole(role)) {
    return "/institution/dashboard";
  }

  return null;
}
