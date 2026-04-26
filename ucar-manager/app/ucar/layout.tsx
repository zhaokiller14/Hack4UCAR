import { unstable_noStore } from "next/cache";
import { redirect } from "next/navigation";

import { getServerUserContext } from "@/lib/auth/guards";

import UcarSidebar from "./_components/UcarSidebar";

export default async function UcarLayout({ children }: { children: React.ReactNode }) {
  unstable_noStore();
  const userContext = await getServerUserContext();

  if (!userContext) {
    redirect("/auth/login");
  }

  const roleLabel = userContext.role === "super_admin"
    ? "Super Admin"
    : userContext.role ?? "Utilisateur";

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