"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { IconSparkle } from "@/components/icons";

// O arquivo em public/ é o logotipo tratado: fundo removido, recorte justo
// e traço recolorido no degradê rosa → lilás da paleta. Por ser PNG com
// transparência ele é *contido* dentro do disco pastel (object-contain),
// nunca cortado.
const LOGO_SRC = "/logo.png";

/**
 * Selo circular da marca. Mostra o ícone vetorial até confirmar — via uma
 * sondagem client-side com `new Image()` — que o arquivo do logo existe e
 * carrega; só então troca para o arquivo real. Checar depois de montado
 * (em vez de um <img onError>) evita a corrida de hidratação: o erro do
 * <img> renderizado no HTML do servidor dispara antes do React religar o
 * handler, então onError nunca chegaria a rodar.
 */
export function LogoMark({
  size = "sm",
  className,
  style,
}: {
  size?: "sm" | "lg";
  className?: string;
  style?: CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const lg = size === "lg";

  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => !cancelled && setLoaded(true);
    probe.onerror = () => !cancelled && setLoaded(false);
    probe.src = LOGO_SRC;
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-onPastel ring-1 ring-white/60 dark:ring-white/10 ${
        className ?? (lg ? "h-12 w-12" : "h-10 w-10")
      }`}
      style={{
        background: "linear-gradient(140deg, var(--brand-rose), var(--brand-lilac))",
        ...style,
      }}
      aria-hidden
    >
      {loaded ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={LOGO_SRC} alt="" className="h-[68%] w-[68%] object-contain" />
      ) : (
        <IconSparkle className={lg ? "h-5 w-5" : "h-4 w-4"} />
      )}
    </span>
  );
}

/** Lockup da marca: selo + nome + tagline. */
export function BrandMark({
  compact = false,
  size = "sm",
}: {
  compact?: boolean;
  size?: "sm" | "lg";
}) {
  const lg = size === "lg";

  return (
    <div className={`flex min-w-0 items-center ${lg ? "gap-3.5" : "gap-3"}`}>
      <LogoMark size={size} />
      {!compact && (
        <div className="hidden min-w-0 leading-tight xs:block">
          <p
            className={`truncate font-display font-semibold uppercase tracking-[0.04em] text-accent-lavender ${
              lg ? "text-2xl" : "text-xl"
            }`}
          >
            SR Consultoria
          </p>
          <p className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Metas &amp; Comissões
          </p>
        </div>
      )}
    </div>
  );
}
