import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

// Elegant serif for display headings + light, refined sans for body copy.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Dashboard de Metas e Comissão",
  description: "Importe relatórios, defina metas e acompanhe comissões em tempo real.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans font-light antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
