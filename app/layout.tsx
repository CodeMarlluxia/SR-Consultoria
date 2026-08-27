import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

// Fraunces: serifa de eixo óptico, macia nas terminações — dá o tom
// delicado sem cair no serif de alto contraste padrão.
// Manrope: sans geométrico de cantos suaves, ótimo para números.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SR Consultoria · Metas e Comissões",
  description: "Importe relatórios, defina metas e acompanhe comissões em tempo real.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
