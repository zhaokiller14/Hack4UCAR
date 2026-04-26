export const APP_ROLES = [
  "super_admin",
  "institution_admin",
  "hr_manager",
  "finance_manager",
  "academic_manager",
  "research_manager",
  "partnerships_manager",
  "esg_manager",
  "infrastructure_manager",
  "viewer",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const INSTITUTION_ROLES = [
  "institution_admin",
  "hr_manager",
  "finance_manager",
  "academic_manager",
  "research_manager",
  "partnerships_manager",
  "esg_manager",
  "infrastructure_manager",
  "viewer",
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
  if (role === "super_admin") {
    return "/";
  }

  if (isInstitutionRole(role)) {
    return "/";
  }

  return null;
}
