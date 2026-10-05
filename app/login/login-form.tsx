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

      {state?.erro && (
        <div className={styles.alert}>⚠ {state.erro}</div>
      )}

      <div className={styles.fg}>
        <label>E-mail</label>

        <input
          type="email"
          name="email"
          required
          placeholder="seu@email.com"
        />
      </div>

      <div className={styles.fg}>
        <label>Senha</label>

        <div
          style={{
            position: "relative",
            width: "100%",
          }}
        >
          <input
            type={mostrarSenha ? "text" : "password"}
            name="senha"
            required
            placeholder="••••••••"
            style={{
              paddingRight: "3rem",
            }}
          />

          <button
            type="button"
            onClick={() => setMostrarSenha((valor) => !valor)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            style={{
              position: "absolute",
              right: "0.7rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "32px",
              height: "32px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5b6b8a",
            }}
          >
            {mostrarSenha ? (
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                <path d="M9.88 4.24A9.77 9.77 0 0 1 12 4c7 0 10 8 10 8a18.28 18.28 0 0 1-3.17 4.19" />
                <path d="M6.61 6.61C3.95 8.27 2 12 2 12s3 8 10 8a9.77 9.77 0 0 0 3.7-.7" />
              </svg>
            ) : (
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className={styles.btn}
        disabled={pending}
      >
        {pending ? "Entrando…" : "Entrar →"}
      </button>
    </form>
  );
}
