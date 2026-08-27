import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

// Playfair Display: serifa de alto contraste, elegante e feminina — usada
// nos títulos e no logotipo. Poppins: geométrica arredondada, mantém boa
// leitura em rótulos e números sem perder o tom delicado do conjunto.
const display = Playfair_Display({
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

export const metadata: Metadata = {
  title: "SR Consultoria · Metas e Comissões",
  description: "Importe relatórios, defina metas e acompanhe comissões em tempo real.",
  // Aponta para public/logo.png — quando o arquivo for salvo ali, vira o
  // favicon automaticamente, sem precisar mexer em mais nada.
  icons: { icon: "/logo.png" },
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
