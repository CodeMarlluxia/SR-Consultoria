import { redirect } from "next/navigation";
import { GoalImporter } from "@/components/import/goal-importer";
import { getUser, isAdmin } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function ImportarPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  // 'usuario_padrao' só vê o Painel.
  if (!isAdmin(user.role)) redirect("/dashboard");

  return (
    <main className="px-6 py-10">
      <GoalImporter />
    </main>
  );
}
