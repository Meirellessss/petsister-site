"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { entrar } from "./actions";
import styles from "./login.module.css";

function EyeIcon({ off = false }: { off?: boolean }) {
  return off ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.eyeIcon}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.7 4.2 10 8-0.5 1.4-1.3 2.7-2.5 4" />
      <path d="M6.5 6.5C4.8 7.6 3.6 9.4 2 12c1.3 3.8 5 8 10 8 1.4 0 2.7-.3 3.9-.9" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.eyeIcon}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(entrar, undefined);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <form action={formAction}>
      <input type="hidden" name="redirect" value={redirectTo} />

      {state?.erro && (
        <div className={styles.alert}>
          ⚠ {state.erro}
        </div>
      )}

      <div className={styles.fg}>
        <label htmlFor="login-email">E-mail</label>

        <input
          id="login-email"
          type="email"
          name="email"
          required
          placeholder="seu@email.com"
        />
      </div>

      <div className={styles.fg}>
        <label htmlFor="login-senha">Senha</label>

        <div className={styles.passwordWrapper}>
          <input
            id="login-senha"
            type={mostrarSenha ? "text" : "password"}
            name="senha"
            required
            placeholder="••••••••"
            className={styles.passwordInput}
          />

          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setMostrarSenha((visivel) => !visivel)}
            aria-label={
              mostrarSenha ? "Ocultar senha" : "Mostrar senha"
            }
          >
            <EyeIcon off={mostrarSenha} />
          </button>
        </div>
      </div>
      <div className={styles.forgotRow}>
        <Link href="/esqueci-a-senha">Esqueci a senha?</Link>
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
