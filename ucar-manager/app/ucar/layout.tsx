import { requireUcarAdmin } from "@/lib/auth/guards";

import UcarSidebar from "./_components/UcarSidebar";

export default async function UcarLayout({ children }: { children: React.ReactNode }) {
    await requireUcarAdmin();
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
      <UcarSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}