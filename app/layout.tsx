import type { Metadata } from "next";
import { Manrope, Poppins } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

// Manrope: grotesca moderna, com números de largura constante e ótimo peso
// semibold — é a fonte dos títulos e de todo valor monetário do painel.
// Poppins: geométrica arredondada, mantém a leitura leve em rótulos e
// textos corridos sem perder o tom delicado do conjunto.
const display = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const sans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// O favicon vem da convenção de arquivos do App Router: `app/icon.png` e
// `app/apple-icon.png` são detectados pelo Next e viram <link rel="icon">
// automaticamente — por isso não há campo `icons` aqui.
export const metadata: Metadata = {
  title: "SR Consultoria · Metas e Comissões",
  description: "Importe relatórios, defina metas e acompanhe comissões em tempo real.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
