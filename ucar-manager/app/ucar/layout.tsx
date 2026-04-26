import { unstable_noStore } from "next/cache";
import { redirect } from "next/navigation";

import { getServerUserContext } from "@/lib/auth/guards";

import UcarSidebar from "./_components/UcarSidebar";

/**
 * Formats a role string to be user-friendly.
 * Converts snake_case to Title Case (e.g., "super_admin" → "Super Admin")
 */
function formatRoleLabel(role: string | null | undefined): string {
  if (!role) return "Utilisateur";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function UcarLayout({ children }: { children: React.ReactNode }) {
  unstable_noStore();
  const userContext = await getServerUserContext();

  if (!userContext) {
    redirect("/auth/login");
  }

  const roleLabel = formatRoleLabel(userContext.role);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
      <UcarSidebar
        userName={userContext.fullName ?? "Utilisateur"}
        userRole={roleLabel}
        userRoleKey={userContext.role}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}