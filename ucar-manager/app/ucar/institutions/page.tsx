import Link from "next/link";

import { getInstitutionsList } from "@/lib/data/institutions";

export default async function UcarInstitutions() {
	const institutions = await getInstitutionsList();

	return (
		<main className="mx-auto max-w-6xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold text-[#1B1C1A]">Établissements</h1>
				<p className="mt-1 text-sm text-slate-500">
					Sélectionnez un établissement pour consulter sa fiche ou modifier ses informations.
				</p>
			</div>

			<div className="overflow-hidden rounded-sm border border-[#003850]/10 bg-white">
				<table className="min-w-full text-sm">
					<thead className="bg-[#FAF9F6] text-left text-xs uppercase tracking-wider text-slate-500">
						<tr>
							<th className="px-4 py-3">Nom</th>
							<th className="px-4 py-3">Code</th>
							<th className="px-4 py-3">Ville</th>
							<th className="px-4 py-3">Statut</th>
							<th className="px-4 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{institutions.map((institution) => (
							<tr key={institution.id} className="border-t border-[#003850]/10">
								<td className="px-4 py-3 font-medium text-[#1B1C1A]">{institution.name}</td>
								<td className="px-4 py-3 text-slate-600">{institution.code}</td>
								<td className="px-4 py-3 text-slate-600">{institution.city}</td>
								<td className="px-4 py-3 text-slate-600">
									{institution.is_active ? "Active" : "Inactive"}
								</td>
								<td className="px-4 py-3">
									<div className="flex justify-end gap-2">
										<Link
											href={`/ucar/institutions/${institution.id}`}
											className="rounded-sm border border-[#003850]/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B4F6B] hover:bg-[#F7F6F3]"
										>
											Voir
										</Link>
										<Link
											href={`/ucar/institutions/${institution.id}/edit`}
											className="rounded-sm bg-[#003850] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1B4F6B]"
										>
											Modifier
										</Link>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</main>
	);
}
