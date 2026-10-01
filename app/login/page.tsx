import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/queries";
import LoginForm from "./login-form";
import styles from "./login.module.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const usuario = await getUsuarioAtual();
  if (usuario) redirect(usuario.profile.perfil === "admin" ? "/admin" : "/");

  const { redirect: redirectTo } = await searchParams;

  return (
    <div className={styles.body}>
      <div className={styles.box}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.jpg" alt="Pet Sister" />
        </Link>
        <div className={styles.sub}>Acesse sua conta</div>
        <LoginForm redirectTo={redirectTo ?? "/"} />
        <div className={styles.linkRow}>
          Não tem conta? <Link href="/cadastro">Cadastre-se grátis</Link>
        </div>
        <div className={styles.hint}>
          <strong>Conta de teste:</strong>
          <br />
          Admin: admin@petsister.com
        </div>
      </div>
    </div>
  );
}
