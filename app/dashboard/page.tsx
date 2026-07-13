import { Dashboard } from "@/components/dashboard/dashboard";
import { loadDashboardPayload, getAvailablePeriods } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

/** Guard against a malformed ?periodo= value in the URL. */
function isValidPeriod(p: string | undefined): p is string {
  return typeof p === "string" && /^\d{4}-\d{2}$/.test(p);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo } = await searchParams;

  // Every period that actually has sales, newest first.
  const periods = await getAvailablePeriods();

  // Honour ?periodo= when valid; otherwise fall back to the newest period
  // that has data, then to the current month.
  const requested = isValidPeriod(periodo) ? periodo : undefined;
  const mesAno = requested ?? periods[0] ?? new Date().toISOString().slice(0, 7);

  // Re-queries Supabase scoped to `mesAno` — sales AND goals — on every
  // period change, since navigation re-runs this Server Component.
  const payload = await loadDashboardPayload(mesAno);

  return (
    <main className="w-full overflow-hidden">
      <Dashboard payload={payload} periods={periods} />
    </main>
  );
}
