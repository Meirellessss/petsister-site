
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import styles from "./AreaHeader.module.css";

const links = [
  { href: "/#produtos", rota: "/", texto: "Loja", icone: "loja" },
  {
    href: "/agendamentos",
    rota: "/agendamentos",
    texto: "Agendamentos",
    icone: "agendar",
  },
  {
    href: "/pedidos",
    rota: "/pedidos",
    texto: "Meus pedidos",
    icone: "pedidos",
  },
  {
    href: "/carrinho",
    rota: "/carrinho",
    texto: "Carrinho",
    icone: "carrinho",
  },
];

export default function AreaHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.logo}
          aria-label="PetSister - início"
        >
          <img src="/logo.jpg" alt="PetSister" />
        </Link>

        <nav className={styles.nav} aria-label="Menu principal">
          {links.map((link) => {
            const ativo =
              link.rota === "/"
                ? pathname === "/"
                : pathname.startsWith(link.rota);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${
                  ativo ? styles.ativo : ""
                }`}
                aria-current={ativo ? "page" : undefined}
              >
                <Icon name={link.icone} size={19} />
                <span>{link.texto}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
