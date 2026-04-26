import UploadIngestCard from "@/components/institution/UploadIngestCard";
import { requireInstitutionRole } from "@/lib/auth/guards";

export default async function InstitutionUploadPage() {
  const { institutionId } = await requireInstitutionRole();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Upload and Data Ingestion</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload source files, review extracted entities, then verify before writing into domain tables.
        </p>
      </div>

      <UploadIngestCard institutionId={institutionId ?? ""} />
    </div>
  );
}
