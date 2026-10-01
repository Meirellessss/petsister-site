import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/queries";
import CadastroForm from "./cadastro-form";
import styles from "../login/login.module.css";

export default async function CadastroPage() {
  const usuario = await getUsuarioAtual();
  if (usuario) redirect("/");

  return (
    <div className={styles.body}>
      <div className={styles.box}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.jpg" alt="Pet Sister" />
        </Link>
        <div className={styles.sub}>Crie sua conta grátis</div>
        <CadastroForm />
        <div className={styles.linkRow}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
