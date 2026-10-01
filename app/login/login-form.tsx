"use client";

import { useActionState } from "react";
import { entrar } from "./actions";
import styles from "./login.module.css";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(entrar, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="redirect" value={redirectTo} />
      {state?.erro && <div className={styles.alert}>⚠ {state.erro}</div>}
      <div className={styles.fg}>
        <label>E-mail</label>
        <input type="email" name="email" required placeholder="seu@email.com" />
      </div>
      <div className={styles.fg}>
        <label>Senha</label>
        <input type="password" name="senha" required placeholder="••••••••" />
      </div>
      <button type="submit" className={styles.btn} disabled={pending}>
        {pending ? "Entrando…" : "Entrar →"}
      </button>
    </form>
  );
}
