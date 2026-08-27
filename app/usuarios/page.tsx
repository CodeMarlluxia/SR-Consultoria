import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRole, isAdmin } from "@/lib/supabase/perfil";
import { UsersManager } from "@/components/users/users-manager";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = await getRole(supabase, user.id);
  if (!isAdmin(role)) redirect("/dashboard");

  const { data } = await supabase
    .from("perfis")
    .select("user_id, email, role, criado_em")
    .order("criado_em", { ascending: false });

  return (
    <main className="mx-auto max-w-[880px] px-6 py-10">
      <UsersManager perfis={data ?? []} currentUserId={user.id} />
    </main>
  );
}
