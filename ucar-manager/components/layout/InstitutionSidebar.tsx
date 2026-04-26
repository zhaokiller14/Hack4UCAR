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
	AlertTriangle,
	FileText,
	Bot,
	Upload,
	LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_INSTITUTION_LOGO } from "@/app/constants/CONSTANTS";

const NAV = [
	{ href: "/institution/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
	{ href: "/institution/academic", label: "Académique & pédagogie", icon: GraduationCap },
	{ href: "/institution/employment", label: "Emploi & alumni", icon: Briefcase },
	{ href: "/institution/finance", label: "Finance & comptabilité", icon: Wallet },
	{ href: "/institution/hr", label: "Ressources humaines", icon: Users },
	{ href: "/institution/research", label: "Recherche & innovation", icon: FlaskConical },
	{ href: "/institution/esg", label: "ESG & RSE", icon: Leaf },
	{ href: "/institution/infrastructure", label: "Infrastructure & équipement", icon: Building },
	{ href: "/institution/partnerships", label: "Partenariats & mobilité", icon: Handshake },
	{ href: "/institution/alerts", label: "Alertes", icon: AlertTriangle },
	{ href: "/institution/reports", label: "Rapports", icon: FileText },
	{ href: "/institution/upload", label: "Upload & ingestion", icon: Upload },
	{ href: "/institution/ai-chat", label: "Assistant IA", icon: Bot },
];

type InstitutionSidebarProps = {
	userName: string;
	userRole: string;
	institutionLogo?: string;
	institutionId?: string;
};

export default function InstitutionSidebar({ 
	userName, 
	userRole, 
	institutionLogo = DEFAULT_INSTITUTION_LOGO,
	institutionId 
}: InstitutionSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.replace("/auth/login");
		router.refresh();
	};

	return (
		<aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-[#F7F6F3]">
			<div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
				<img
					src={institutionLogo}
					alt={institutionId ? `${institutionId} Logo` : "UCAR Logo"}
					width={80}
					height={60}
					className="shrink-0 rounded-lg"
				/>
				<div className="min-w-0">
					<p className="truncate text-sm font-black leading-tight text-[#1B4F6B]">{userName}</p>
					<p className="mt-0.5 truncate text-xs text-slate-500">{userRole}</p>
				</div>
			</div>

			<nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
				{NAV.map(({ href, label, icon: Icon }) => {
					const active = pathname === href || pathname.startsWith(`${href}/`);

					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"flex items-center gap-3 border-l-4 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150",
								active
									? "border-[#1B4F6B] bg-white text-[#1B4F6B] shadow-sm"
									: "border-transparent text-slate-500 hover:bg-white/60 hover:text-[#1B4F6B]",
							)}
						>
							<Icon className="h-4 w-4 shrink-0" />
							{label}
						</Link>
					);
				})}
			</nav>

			<div className="border-t border-slate-200 px-3 pb-5 pt-3">
				<button
					type="button"
					onClick={handleLogout}
					className="flex items-center gap-3 border-l-4 border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-all hover:bg-white/60 hover:text-[#1B4F6B]"
				>
					<LogOut className="h-4 w-4 shrink-0" />
					Déconnexion
				</button>
			</div>
		</aside>
	);
}
