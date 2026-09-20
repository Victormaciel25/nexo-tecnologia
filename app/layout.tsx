import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "./navigation";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Nexo Tecnologia | Ideias que funcionam",
    template: "%s | Nexo Tecnologia",
  },
  description:
    "Desenvolvimento web, integrações e consultoria técnica para sua empresa.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <header className="header wrap">
          <Link href="/" className="brand" aria-label="Nexo Tecnologia, início">
            <span className="brand-mark">n</span>nexo
            <span className="brand-sub">TECNOLOGIA</span>
          </Link>
          <Navigation />
        </header>
        {children}
        <footer className="wrap footer">
          <Link className="brand" href="/">
            nexo<span className="brand-sub">TECNOLOGIA</span>
          </Link>
          <span>© {new Date().getFullYear()} Nexo</span>
        </footer>
      </body>
    </html>
  );
}
