import { Suspense } from "react";

import { requireUcarAdmin } from "@/lib/auth/guards";

import UcarSidebar from "./_components/UcarSidebar";

async function UcarAccessGate() {
  await requireUcarAdmin();
  return null;
}

export default async function UcarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
      <Suspense fallback={null}>
        <UcarAccessGate />
      </Suspense>
      <UcarSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}