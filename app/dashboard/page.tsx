import { Dashboard } from "@/components/dashboard/dashboard";
import { loadDashboardPayload, getDataBounds } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

const isDate = (v: string | undefined): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** First and last day of the month containing `isoDate`. */
function monthWindow(isoDate: string): { from: string; to: string } {
  const [y, m] = isoDate.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, "0");
  return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(last).padStart(2, "0")}` };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const { de, ate } = await searchParams;

  // The date-range picker is the only period control. Its bounds are the full
  // extent of imported data, so the user can reach any month from it.
  const bounds = await getDataBounds();

  // Default window: the month of the most recent sale (or the current month
  // when the database is still empty).
  const fallback = monthWindow(bounds.max ?? new Date().toISOString().slice(0, 10));

  let from = isDate(de) ? de : fallback.from;
  let to = isDate(ate) ? ate : fallback.to;
  if (from > to) [from, to] = [to, from]; // tolerate an inverted window

  // Re-queries Supabase on every window change — sales by data_venda, goals
  // for every month the window touches.
  const payload = await loadDashboardPayload(from, to);

  return (
    <main className="w-full overflow-hidden">
      <Dashboard payload={payload} />
    </main>
  );
}
