"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProfileState = {
	auth: {
	id: string;
	email: string | null;
	role: string | null;
	emailConfirmedAt: string | null;
	lastSignInAt: string | null;
	createdAt: string | null;
	};
	publicUser: {
		fullName: string | null;
		role: string | null;
		organizationId: string | null;
		institutionId: string | null;
		isActive: boolean | null;
		createdAt: string | null;
		source: "users" | "profiles" | "none";
	};
};

type PublicUserRow = {
	full_name: string | null;
	role: string | null;
	organization_id: string | null;
	institution_id: string | null;
	is_active: boolean | null;
	created_at: string | null;
};

export default function ProfilePage() {
	const [profile, setProfile] = useState<ProfileState | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const loadProfile = async () => {
			const supabase = createClient();

			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError) {
				setError("Impossible de recuperer la session utilisateur.");
				setLoading(false);
				return;
			}

			if (!session?.access_token) {
				router.replace("/auth/login");
				return;
			}

			const { data, error: userError } = await supabase.auth.getUser(
				session.access_token,
			);

			if (userError || !data.user) {
				setError("Impossible de recuperer les informations du profil.");
				setLoading(false);
				return;
			}

			const user = data.user;

			const { data: usersRow, error: usersError } = await supabase
				.from("users")
				.select("full_name, role, organization_id, institution_id, is_active, created_at")
				.eq("id", user.id)
				.maybeSingle<PublicUserRow>();

			let publicRow = usersRow;
			let source: ProfileState["publicUser"]["source"] = usersRow ? "users" : "none";

			if (!usersRow && usersError) {
				const { data: profilesRow } = await supabase
					.from("profiles")
					.select(
						"full_name, role, organization_id, institution_id, is_active, created_at",
					)
					.eq("id", user.id)
					.maybeSingle<PublicUserRow>();

				if (profilesRow) {
					publicRow = profilesRow;
					source = "profiles";
				}
			}

			setProfile({
				auth: {
					id: user.id,
					email: user.email ?? null,
					role: user.role ?? null,
					emailConfirmedAt: user.email_confirmed_at ?? null,
					lastSignInAt: user.last_sign_in_at ?? null,
					createdAt: user.created_at ?? null,
				},
				publicUser: {
					fullName: publicRow?.full_name ?? null,
					role: publicRow?.role ?? null,
					organizationId: publicRow?.organization_id ?? null,
					institutionId: publicRow?.institution_id ?? null,
					isActive: publicRow?.is_active ?? null,
					createdAt: publicRow?.created_at ?? null,
					source,
				},
			});
			setLoading(false);
		};

		loadProfile();
	}, [router]);

	return (
		<main className="min-h-screen bg-[#F7F6F3] p-6 text-[#0D2B3E] md:p-10">
			<div className="mx-auto w-full max-w-3xl rounded-xl border border-[#1B4F6B]/20 bg-white p-6 shadow-sm md:p-8">
				<h1 className="text-3xl font-bold tracking-tight text-[#1B4F6B]">Mon Profil</h1>
				<p className="mt-2 text-sm text-[#0D2B3E]/70">
					Informations recuperees depuis les schemas auth et public de Supabase.
				</p>

				{loading && <p className="mt-6 text-sm">Chargement du profil...</p>}

				{error && (
					<p className="mt-6 rounded-md border border-[#ffdad6] bg-[#fff4f2] px-4 py-3 text-sm text-[#93000a]">
						{error}
					</p>
				)}

				{!loading && !error && profile && (
					<dl className="mt-6 grid gap-3 text-sm">
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Auth User ID</dt>
							<dd className="break-all text-[#0D2B3E]">{profile.auth.id}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Auth Email</dt>
							<dd className="text-[#0D2B3E]">{profile.auth.email ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Auth Role</dt>
							<dd className="text-[#0D2B3E]">{profile.auth.role ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Email confirme le</dt>
							<dd className="text-[#0D2B3E]">{profile.auth.emailConfirmedAt ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Derniere connexion</dt>
							<dd className="text-[#0D2B3E]">{profile.auth.lastSignInAt ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Auth Compte cree le</dt>
							<dd className="text-[#0D2B3E]">{profile.auth.createdAt ?? "-"}</dd>
						</div>
						<div className="rounded-md border border-[#1B4F6B]/20 bg-[#EAF4FA] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Public Source</dt>
							<dd className="text-[#0D2B3E]">{profile.publicUser.source}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Public Full Name</dt>
							<dd className="text-[#0D2B3E]">{profile.publicUser.fullName ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Public Role</dt>
							<dd className="text-[#0D2B3E]">{profile.publicUser.role ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Public Organization ID</dt>
							<dd className="break-all text-[#0D2B3E]">{profile.publicUser.organizationId ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Public Institution ID</dt>
							<dd className="break-all text-[#0D2B3E]">{profile.publicUser.institutionId ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Public Is Active</dt>
							<dd className="text-[#0D2B3E]">
								{profile.publicUser.isActive === null ? "-" : profile.publicUser.isActive ? "true" : "false"}
							</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Public Created At</dt>
							<dd className="text-[#0D2B3E]">{profile.publicUser.createdAt ?? "-"}</dd>
						</div>
					</dl>
				)}
			</div>
		</main>
	);
}
