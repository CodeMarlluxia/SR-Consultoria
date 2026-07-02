import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="flex min-h-[calc(100dvh-var(--nav-h))] items-center justify-center px-6 py-10">
      <LoginForm redirectTo={redirectTo ?? "/dashboard"} />
    </main>
  );
}
