"use client";

import { useEffect, useState } from "react";
import { IconSparkle } from "@/components/icons";

/**
 * Selo circular da marca. Mostra o ícone vetorial até confirmar — via uma
 * sondagem client-side com `new Image()` — que `public/logo.png` existe e
 * carrega; só então troca para o arquivo real. Checar depois de montado
 * (em vez de um <img onError>) evita a corrida de hidratação: o erro do
 * <img> renderizado no HTML do servidor dispara antes do React religar o
 * handler, então onError nunca chegaria a rodar.
 */
export function LogoMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const [loaded, setLoaded] = useState(false);
  const lg = size === "lg";

  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => !cancelled && setLoaded(true);
    probe.onerror = () => !cancelled && setLoaded(false);
    probe.src = "/logo.png";
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-onPastel ${lg ? "h-12 w-12" : "h-9 w-9"}`}
      style={{ background: "linear-gradient(135deg, var(--brand-rose), var(--brand-lilac))" }}
      aria-hidden
    >
      {loaded ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.png" alt="" className="h-full w-full object-cover" />
      ) : (
        <IconSparkle className={lg ? "h-5 w-5" : "h-4 w-4"} />
      )}
    </span>
  );
}

/** Lockup da marca: selo + nome em serifa + tagline. */
export function BrandMark({
  compact = false,
  size = "sm",
}: {
  compact?: boolean;
  size?: "sm" | "lg";
}) {
  const lg = size === "lg";

  return (
    <div className={`flex min-w-0 items-center ${lg ? "gap-3.5" : "gap-2.5"}`}>
      <LogoMark size={size} />
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className={`truncate font-display font-semibold uppercase tracking-[0.08em] text-ink ${lg ? "text-2xl" : "text-lg"}`}>
            SR Consultoria
          </p>
          <p className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ink-faint">
            Metas &amp; Comissões
          </p>
        </div>
      )}
    </div>
  );
}
