"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sair } from "../actions";
import Icon from "@/components/Icon";
import styles from "./admin.module.css";

const ITENS: { href: string; ic: string; label: string; sect?: string }[] = [
  { href: "/admin", ic: "dashboard", label: "Dashboard", sect: "Principal" },
  { href: "/admin/produtos", ic: "racao", label: "Produtos", sect: "Catálogo" },
  { href: "/admin/categorias", ic: "pata", label: "Categorias" },
  { href: "/admin/pedidos", ic: "carrinho", label: "Pedidos", sect: "Operações" },
  { href: "/admin/agendamentos", ic: "agendar", label: "Agendamentos" },
  { href: "/admin/usuarios", ic: "usuarios", label: "Clientes", sect: "Usuários" },
];

export default function Sidebar({ nome }: { nome: string }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.sbLogo}>
        <img src="/logo.jpg" alt="Pet Sister" />
      </Link>
      <div style={{ padding: ".4rem 0" }}>
        {ITENS.map((item) => (
          <div key={item.href}>
            {item.sect && <div className={styles.sbSect}>{item.sect}</div>}
            <Link
              href={item.href}
              className={`${styles.sl} ${pathname === item.href ? styles.slActive : ""}`}
            >
              <span style={{ display: "flex" }}>
                <Icon name={item.ic} size={18} />
              </span>
              {item.label}
            </Link>
          </div>
        ))}
        <div style={{ margin: ".8rem .5rem", height: 1, background: "rgba(255,255,255,.08)" }}></div>
        <Link href="/" className={styles.sl}>
          <span style={{ display: "flex" }}>
            <Icon name="loja" size={18} />
          </span>
          Ver Loja
        </Link>
        <form action={sair}>
          <button type="submit" className={styles.sl} style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}>
            <span style={{ display: "flex" }}>
              <Icon name="sair" size={18} />
            </span>
            Sair
          </button>
        </form>
      </div>
      <div className={styles.sbFoot}>
        <div className={styles.sbUser}>
          <div className={styles.sbAv}>{nome.charAt(0).toUpperCase()}</div>
          <div>
            <div className={styles.sbName}>{nome.split(" ")[0]}</div>
            <div className={styles.sbRole}>Administrador</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
