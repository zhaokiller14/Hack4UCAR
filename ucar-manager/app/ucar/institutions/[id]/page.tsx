type InstitutionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InstitutionDetailPage({ params }: InstitutionDetailPageProps) {
  const { id } = await params;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Institution {id}</h1>
      <p className="text-sm text-muted-foreground">UCAR institution drill-down placeholder page.</p>
    </main>
  );
}
