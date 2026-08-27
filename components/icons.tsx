import type { SVGProps } from "react";

// ---------------------------------------------------------------------
//  Conjunto de ícones do app — traço fino (1.8), pontas arredondadas,
//  sem preenchimento. Cada bloco do dashboard usa o ícone do seu assunto
//  (dinheiro, moedas, presente, alvo, agenda, tesoura, etiqueta) em vez do
//  logotipo, que agora aparece só na marca.
// ---------------------------------------------------------------------
const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export type IconComponent = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

export function IconSparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <path d="M12 8.5a3.7 3.7 0 0 0 3.5 3.5 3.7 3.7 0 0 0-3.5 3.5 3.7 3.7 0 0 0-3.5-3.5A3.7 3.7 0 0 0 12 8.5z" />
    </svg>
  );
}

export function IconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 9.8V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.8" />
    </svg>
  );
}

export function IconTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

/** Faturamento — cédula com a moeda ao centro. */
export function IconBanknote(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v5M18 9.5v5" />
    </svg>
  );
}

export function IconWallet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z" />
      <path d="M15.5 12.2h3a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1h-3a1.8 1.8 0 0 1 0-3.6z" />
      <path d="M3.5 8.3 14 5.2a1.6 1.6 0 0 1 2 1.1l.3 1.2" />
    </svg>
  );
}

/** Comissão acumulada — pilha de moedas. */
export function IconCoins(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="9" cy="7.5" rx="5.5" ry="3" />
      <path d="M3.5 7.5V12c0 1.66 2.46 3 5.5 3s5.5-1.34 5.5-3V7.5" />
      <path d="M3.5 12v4.5c0 1.66 2.46 3 5.5 3 2.2 0 4.1-.7 5-1.72" />
      <path d="M15 10.3c2.5.2 4.5 1.4 4.5 2.9 0 1.3-1.5 2.4-3.5 2.8" />
    </svg>
  );
}

/** Premiação — presente com laço. */
export function IconGift(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="9" width="18" height="11.5" rx="2" />
      <path d="M2.2 9a1 1 0 0 1 1-1h17.6a1 1 0 0 1 1 1v2.2a1 1 0 0 1-1 1H3.2a1 1 0 0 1-1-1z" />
      <path d="M12 8v12.5" />
      <path d="M12 8S10.8 4 8.6 4a2.2 2.2 0 0 0 0 4.4z" />
      <path d="M12 8s1.2-4 3.4-4a2.2 2.2 0 0 1 0 4.4z" />
    </svg>
  );
}

/** Atendimentos — agenda com o dia marcado. */
export function IconCalendarCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.2" y="5" width="17.6" height="15.5" rx="2.4" />
      <path d="M3.2 9.6h17.6M8 3.2v3.4M16 3.2v3.4" />
      <path d="m9.3 14.7 1.9 1.9 3.6-3.9" />
    </svg>
  );
}

/** Ritmo / progresso da equipe — seta em ascensão. */
export function IconTrendUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 16.5 9 11l3.5 3.5L20.5 6.5" />
      <path d="M15.5 6.5h5v5" />
    </svg>
  );
}

export function IconAward(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9 13.6 7.5 21l4.5-2.4 4.5 2.4-1.5-7.4" />
    </svg>
  );
}

export function IconTrophy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 5.5H4.5a1 1 0 0 0-1 1V8a3 3 0 0 0 3 3" />
      <path d="M17 5.5h2.5a1 1 0 0 1 1 1V8a3 3 0 0 1-3 3" />
      <path d="M12 14v3.2M9 20.5h6M9.5 17.2h5l.5 3.3h-6z" />
    </svg>
  );
}

export function IconUsers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c.6-3 2.7-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.8 14.3c2.3.2 4 1.8 4.5 4.2" />
    </svg>
  );
}

export function IconUser(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.8 20c.7-3.7 3.4-5.8 7.2-5.8s6.5 2.1 7.2 5.8" />
    </svg>
  );
}

/** Serviço executado — tesoura do salão. */
export function IconScissors(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="6.3" cy="6.3" r="2.3" />
      <circle cx="6.3" cy="17.7" r="2.3" />
      <path d="M20 5 8 15.5M20 19 8 8.5" />
    </svg>
  );
}

/** Categoria — etiqueta de produto. */
export function IconTag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M11.5 3.5H5a1.5 1.5 0 0 0-1.5 1.5v6.5a1.5 1.5 0 0 0 .44 1.06l8.9 8.9a1.5 1.5 0 0 0 2.12 0l6.5-6.5a1.5 1.5 0 0 0 0-2.12l-8.9-8.9a1.5 1.5 0 0 0-1.06-.44z" />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheckCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.3 12.3 2.4 2.4 5-5.2" />
    </svg>
  );
}

export function IconUserPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.3" />
      <path d="M3 19c.6-3.3 2.9-5.2 6-5.2s5.4 1.9 6 5.2" />
      <path d="M18 8v5M15.5 10.5h5" />
    </svg>
  );
}

export function IconLogout(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M14.5 16 19 12l-4.5-4" />
      <path d="M19 12H9" />
    </svg>
  );
}

export function IconSun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function IconMoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function IconX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
