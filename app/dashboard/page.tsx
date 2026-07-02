import { Dashboard } from "@/components/dashboard/dashboard";
import { loadDashboardPayload, getAvailablePeriods } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo } = await searchParams;

  // Default to the most recent period with data.
  const periods = await getAvailablePeriods();
  const mesAno = periodo ?? periods[0] ?? new Date().toISOString().slice(0, 7);

  const payload = await loadDashboardPayload(mesAno);

  return (
    <main className="w-full overflow-hidden">
      <Dashboard payload={payload} />
    </main>
  );
}
