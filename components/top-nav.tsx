"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconTarget, IconUsers, type IconComponent } from "@/components/icons";
import type { Role } from "@/lib/supabase/perfil";

type NavItem = {
  href: string;
  label: string;
  icon: IconComponent;
  adminOnly?: boolean;
};

// Só rotas que existem de verdade — nada de item decorativo que leva a 404.
const ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconHome },
  { href: "/importar", label: "Metas", icon: IconTarget, adminOnly: true },
  { href: "/usuarios", label: "Usuários", icon: IconUsers, adminOnly: true },
];

/**
 * Navegação principal em pílulas, centralizada na barra do topo. O item
 * ativo ganha o pastel rosa da marca; os demais só reagem ao hover. O
 * ícone aparece a partir de `sm` — em telas estreitas fica só o rótulo,
 * que é o que importa para achar a página.
 */
export function TopNav({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const items = ITEMS.filter((item) => !item.adminOnly || role === "admin");

  return (
    <nav
      className="flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-1.5"
      aria-label="Navegação principal"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="nav-pill"
            aria-current={active ? "page" : undefined}
          >
            <Icon className="hidden h-4 w-4 sm:block" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
