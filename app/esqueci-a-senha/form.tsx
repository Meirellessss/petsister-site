
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { solicitarRecuperacao } from "./actions";
import styles from "../login/login.module.css";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    solicitarRecuperacao,
    undefined,
  );

  if (state?.sucesso) {
    return (
      <div>
        <div
          className={styles.alert}
          style={{
            background: "#f0fdf4",
            color: "#166534",
            borderColor: "#bbf7d0",
          }}
        >
          Se este e-mail estiver cadastrado, enviaremos um link para
          redefinir sua senha.
        </div>

        <div className={styles.linkRow}>
          <Link href="/login">Voltar para o login</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {state?.erro && (
        <div className={styles.alert}>
          ⚠ {state.erro}
        </div>
      )}

      <div className={styles.fg}>
        <label htmlFor="email">E-mail</label>

        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="seu@email.com"
        />
      </div>

      <button
        type="submit"
        className={styles.btn}
        disabled={pending}
      >
        {pending ? "Enviando…" : "Enviar link →"}
      </button>

      <div className={styles.linkRow}>
        <Link href="/login">Voltar para o login</Link>
      </div>
    </form>
  );
}
