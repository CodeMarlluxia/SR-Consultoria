import { Dashboard } from "@/components/dashboard/dashboard";
import { loadDashboardPayload, getAvailablePeriods } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo } = await searchParams;

  // Default: período mais recente com dados.
  const periods = await getAvailablePeriods();
  const mesAno = periodo ?? periods[0] ?? new Date().toISOString().slice(0, 7);

  const payload = await loadDashboardPayload(mesAno);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
      <Dashboard payload={payload} />
    </main>
  );
}
