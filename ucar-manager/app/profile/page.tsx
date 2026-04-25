"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProfileState = {
	id: string;
	email: string | null;
	role: string | null;
	emailConfirmedAt: string | null;
	lastSignInAt: string | null;
	createdAt: string | null;
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
			setProfile({
				id: user.id,
				email: user.email ?? null,
				role: user.role ?? null,
				emailConfirmedAt: user.email_confirmed_at ?? null,
				lastSignInAt: user.last_sign_in_at ?? null,
				createdAt: user.created_at ?? null,
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
					Informations recuperees depuis le schema d&apos;authentification Supabase.
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
							<dt className="font-semibold text-[#1B4F6B]">User ID</dt>
							<dd className="break-all text-[#0D2B3E]">{profile.id}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Email</dt>
							<dd className="text-[#0D2B3E]">{profile.email ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Role</dt>
							<dd className="text-[#0D2B3E]">{profile.role ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Email confirme le</dt>
							<dd className="text-[#0D2B3E]">{profile.emailConfirmedAt ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Derniere connexion</dt>
							<dd className="text-[#0D2B3E]">{profile.lastSignInAt ?? "-"}</dd>
						</div>
						<div className="rounded-md bg-[#F7F6F3] px-4 py-3">
							<dt className="font-semibold text-[#1B4F6B]">Compte cree le</dt>
							<dd className="text-[#0D2B3E]">{profile.createdAt ?? "-"}</dd>
						</div>
					</dl>
				)}
			</div>
		</main>
	);
}
