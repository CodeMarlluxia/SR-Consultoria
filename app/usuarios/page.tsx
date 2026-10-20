import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUser, isAdmin } from "@/lib/auth/user";
import { UsersManager, type PerfilRow } from "@/components/users/users-manager";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.role)) redirect("/dashboard");

  const { rows } = await db.query<PerfilRow>(
    "select user_id, email, role, criado_em::text from perfis order by criado_em desc",
  );

  return (
    <main className="mx-auto max-w-[880px] px-6 py-10">
      <UsersManager perfis={rows} currentUserId={user.id} />
    </main>
  );
}
