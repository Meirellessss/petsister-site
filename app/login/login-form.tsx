"use client";

import { useActionState, useState } from "react";
import { entrar } from "./actions";
import styles from "./login.module.css";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(entrar, undefined);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
        <div style={{ position: "relative" }}>
          <input
            type={mostrarSenha ? "text" : "password"}
            name="senha"
            required
            placeholder="••••••••"
            style={{ paddingRight: "2.5rem" }}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            style={{
              position: "absolute",
              right: "0.7rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              color: "var(--muted)",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? "🙈" : "👁️"}
          </button>
        </div>
      </div>
      <button type="submit" className={styles.btn} disabled={pending}>
        {pending ? "Entrando…" : "Entrar →"}
      </button>
    </form>
  );
}
