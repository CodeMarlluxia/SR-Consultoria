"use client";

import type { IconComponent } from "@/components/icons";
import { useCountUp } from "./use-count-up";

// ---------------------------------------------------------------------
//  Cartões do topo. Cada um recebe um véu pastel (.tile-*) e um selo de
//  ícone no canto — e o ícone é o do ASSUNTO do bloco (cédula, moedas,
//  presente, alvo, agenda…), não o logotipo. O logotipo agora aparece uma
//  única vez, na marca do topo, que é onde ele identifica alguma coisa.
// ---------------------------------------------------------------------
export type Tone = "rose" | "gold" | "mint" | "serenity" | "lavender";

const TONE: Record<Tone, { tile: string; badge: string; value: string }> = {
  rose: { tile: "tile-rose", badge: "bg-brand-rose/70", value: "text-accent-rose" },
  gold: { tile: "tile-butter", badge: "bg-brand-butter/80", value: "text-accent-gold" },
  mint: { tile: "tile-mint", badge: "bg-brand-mint/70", value: "text-accent-mint" },
  serenity: { tile: "tile-sky", badge: "bg-brand-sky/70", value: "text-accent-serenity" },
  lavender: { tile: "tile-lilac", badge: "bg-brand-lilac/65", value: "text-accent-lavender" },
};

/** Selo redondo do ícone, no canto superior direito do cartão. */
function IconBadge({ icon: Icon, tone }: { icon: IconComponent; tone: Tone }) {
  const t = TONE[tone];
  return (
    <span
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-white/60 dark:ring-white/10 ${t.badge} ${t.value}`}
      aria-hidden
    >
      <Icon className="h-[1.15rem] w-[1.15rem]" />
    </span>
  );
}

const brlFull = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** KPI numérico com contagem animada. */
export function MetricCard({
  label,
  value,
  sub,
  icon,
  tone = "mint",
  isCurrency = true,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: IconComponent;
  tone?: Tone;
  isCurrency?: boolean;
}) {
  const animated = useCountUp(value);
  const t = TONE[tone];

  return (
    <div className={`tile ${t.tile} flex flex-col px-4 pb-3.5 pt-3.5`}>
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow mt-1 truncate">{label}</p>
        <IconBadge icon={icon} tone={tone} />
      </div>
      <p
        className={`mt-2 truncate font-display text-[1.7rem] font-semibold leading-none tabular-nums tracking-tight ${t.value}`}
      >
        {isCurrency ? brlFull(animated) : Math.round(animated).toLocaleString("pt-BR")}
      </p>
      {sub && <p className="mt-1.5 truncate text-[0.72rem] text-ink-soft">{sub}</p>}
    </div>
  );
}

/** Cartão de destaque: quem lidera a meta, quem mais atendeu. */
export function ChampionCard({
  tone,
  label,
  nome,
  stat,
  hint,
  icon,
}: {
  tone: Tone;
  label: string;
  nome: string;
  stat: string;
  hint?: string;
  icon: IconComponent;
}) {
  const t = TONE[tone];

  return (
    <div className={`tile ${t.tile} flex flex-col px-4 pb-3.5 pt-3.5`}>
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow mt-1 truncate">{label}</p>
        <IconBadge icon={icon} tone={tone} />
      </div>
      <p
        className="mt-2 truncate font-display text-xl font-semibold uppercase leading-tight tracking-tight text-ink"
        title={nome}
      >
        {nome}
      </p>
      <p className={`truncate font-display text-lg font-semibold leading-tight tabular-nums ${t.value}`}>
        {stat}
      </p>
      {hint && <p className="mt-1 truncate text-[0.72rem] text-ink-soft">{hint}</p>}
    </div>
  );
}

/** Cartão analítico (serviço mais executado / categoria mais vendida). */
export function InsightCard({
  label,
  title,
  detail,
  icon,
  tone = "serenity",
}: {
  label: string;
  title: string;
  detail: string;
  icon: IconComponent;
  tone?: Tone;
}) {
  const t = TONE[tone];

  return (
    <div className={`tile ${t.tile} flex flex-col justify-center px-4 pb-4 pt-3.5`}>
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow mt-1 truncate">{label}</p>
        <IconBadge icon={icon} tone={tone} />
      </div>
      <p className="mt-2 truncate font-display text-lg font-semibold text-ink" title={title}>
        {title}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium tabular-nums text-ink-soft">{detail}</p>
    </div>
  );
}
