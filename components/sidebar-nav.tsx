"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { IconHome, IconTarget } from "@/components/icons";

const ITEMS: { href: string; label: string; icon: (p: SVGProps<SVGSVGElement>) => React.ReactElement }[] = [
  { href: "/dashboard", label: "Painel", icon: IconHome },
  { href: "/importar", label: "Metas", icon: IconTarget },
];

/** Navegação vertical de ícones da sidebar. Cliente por causa do pathname ativo. */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-center gap-2" aria-label="Navegação principal">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            title={label}
            className={[
              "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",
              active
                ? "bg-brand-rose/30 text-accent-rose shadow-glow-rose"
                : "text-ink-faint hover:bg-white/50 hover:text-ink-soft dark:hover:bg-white/10",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
            <span
              className={[
                "absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-accent-rose transition-opacity",
                active ? "opacity-100" : "opacity-0",
              ].join(" ")}
              aria-hidden
            />
          </Link>
        );
      })}
    </nav>
  );
}
