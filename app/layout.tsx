import type { Metadata } from "next";
import { Fraunces, Roboto } from "next/font/google";

import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "600", "900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Pet Sister — Tudo para cães e gatos · Disk Entrega",
  description:
    "Pet Sister: loja completa para cães e gatos. Rações premium, farmácia veterinária, acessórios e disk entrega. (21) 96893-4951 · @petsisterracoes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
   <html lang="pt-BR" className={`${fraunces.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
