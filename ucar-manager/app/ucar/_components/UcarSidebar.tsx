"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Wallet,
  Users,
  FlaskConical,
  Leaf,
  Building,
  Handshake,
  Building2,
  AlertTriangle,
  Target,
  FileText,
  Megaphone,
  LogOut,
} from "lucide-react";
import { isInstitutionRole, type AppRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const SUPER_ADMIN_NAV = [
  { href: "/ucar/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/ucar/institutions", label: "Établissements", icon: Building2 },
  { href: "/ucar/alerts", label: "Alertes", icon: AlertTriangle },
  { href: "/ucar/goals", label: "Objectifs stratégiques", icon: Target },
  { href: "/ucar/reports", label: "Rapports", icon: FileText },
  { href: "/ucar/announcements", label: "Annonces", icon: Megaphone },
];

const INSTITUTION_NAV = [
  { href: "/ucar/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/ucar/academic", label: "Académique & pédagogie", icon: GraduationCap },
  { href: "/ucar/employment", label: "Emploi & alumni", icon: Briefcase },
  { href: "/ucar/finance", label: "Finance & comptabilité", icon: Wallet },
  { href: "/ucar/hr", label: "Ressources humaines", icon: Users },
  { href: "/ucar/research", label: "Recherche & innovation", icon: FlaskConical },
  { href: "/ucar/esg", label: "ESG & RSE", icon: Leaf },
  { href: "/ucar/infrastructure", label: "Infrastructure & équipement", icon: Building },
  { href: "/ucar/partnerships", label: "Partenariats & mobilité", icon: Handshake },
];

type UcarSidebarProps = {
  userName: string;
  userRole: string;
  userRoleKey: AppRole | null;
};

export default function UcarSidebar({ userName, userRole, userRoleKey }: UcarSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = userRoleKey === "super_admin"
    ? SUPER_ADMIN_NAV
    : isInstitutionRole(userRoleKey)
      ? INSTITUTION_NAV
      : [];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-[#F7F6F3] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200">
        <Image
          src="/ucar-logo.png"
          alt="UCAR Logo"
          width={80}
          height={60}
          className="rounded-lg shrink-0"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#1B4F6B] leading-tight">{userName}</p>
          <p className="truncate text-xs text-slate-500 mt-0.5">{userRole}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider border-l-4 transition-all duration-150",
                active
                  ? "bg-white text-[#1B4F6B] border-[#1B4F6B] shadow-sm"
                  : "text-slate-500 border-transparent hover:text-[#1B4F6B] hover:bg-white/60",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 border-l-4 border-transparent hover:text-[#1B4F6B] hover:bg-white/60 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
