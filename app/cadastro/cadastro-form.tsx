"use client";

import { useActionState } from "react";
import { cadastrar } from "./actions";
import styles from "../login/login.module.css";

export default function CadastroForm() {
  const [state, formAction, pending] = useActionState(cadastrar, undefined);

  if (state?.sucesso) {
    return (
      <div className={styles.alert} style={{ background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}>
        ✓ Conta criada! Confira seu e-mail para confirmar antes de entrar.
      </div>
    );
  }

  return (
    <form action={formAction}>
      {state?.erro && <div className={styles.alert}>⚠ {state.erro}</div>}
      <div className={styles.fg}>
        <label>Nome completo</label>
        <input type="text" name="nome" required placeholder="Seu nome" />
      </div>
      <div className={styles.fg}>
        <label>E-mail</label>
        <input type="email" name="email" required placeholder="seu@email.com" />
      </div>
      <div className={styles.fg}>
        <label>Senha</label>
        <input type="password" name="senha" required placeholder="Mínimo 6 caracteres" />
      </div>
      <div className={styles.fg}>
        <label>Confirmar senha</label>
        <input type="password" name="confirma" required placeholder="Repita a senha" />
      </div>
      <button type="submit" className={styles.btn} disabled={pending}>
        {pending ? "Criando…" : "Criar conta →"}
      </button>
    </form>
  );
}
