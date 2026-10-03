"use client";

import { useState, useActionState } from "react";
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
        <div style={{ position: "relative", width: "100%" }}>
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
              right: "0.8rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "#5b6b8a"
            }}
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
