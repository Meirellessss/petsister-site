"use client";

import { useActionState, useState } from "react";
import { cadastrar } from "./actions";
import styles from "../login/login.module.css";

export default function CadastroForm() {
  const [state, formAction, pending] = useActionState(cadastrar, undefined);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  if (state?.sucesso) {
    return (
      <div
        className={styles.alert}
        style={{
          background: "#f0fdf4",
          color: "#166534",
          borderColor: "#bbf7d0",
        }}
      >
        ✓ Conta criada! Confira seu e-mail para confirmar antes de entrar.
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
        <label>Nome completo</label>

        <input
          type="text"
          name="nome"
          required
          placeholder="Seu nome"
        />
      </div>

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

        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={mostrarSenha ? "text" : "password"}
            name="senha"
            required
            placeholder="Mínimo 6 caracteres"
            style={{
              width: "100%",
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
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "32px",
              height: "32px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5b6b8a",
              zIndex: 10,
            }}
          >
            {mostrarSenha ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M6.5 6.5C4 8 2 12 2 12s3 8 10 8c2 0 3.7-.6 5.2-1.5" />
                <path d="M9.9 4.3C10.6 4.1 11.3 4 12 4c7 0 10 8 10 8s-.9 2.3-2.7 4.2" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
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

      <div className={styles.fg}>
        <label>Confirmar senha</label>

        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={mostrarConfirmacao ? "text" : "password"}
            name="confirma"
            required
            placeholder="Repita a senha"
            style={{
              width: "100%",
              paddingRight: "3rem",
            }}
          />

          <button
            type="button"
            onClick={() =>
              setMostrarConfirmacao((valor) => !valor)
            }
            aria-label={
              mostrarConfirmacao
                ? "Ocultar confirmação da senha"
                : "Mostrar confirmação da senha"
            }
            title={
              mostrarConfirmacao
                ? "Ocultar confirmação da senha"
                : "Mostrar confirmação da senha"
            }
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "32px",
              height: "32px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5b6b8a",
              zIndex: 10,
            }}
          >
            {mostrarConfirmacao ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M6.5 6.5C4 8 2 12 2 12s3 8 10 8c2 0 3.7-.6 5.2-1.5" />
                <path d="M9.9 4.3C10.6 4.1 11.3 4 12 4c7 0 10 8 10 8s-.9 2.3-2.7 4.2" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
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
        {pending ? "Criando…" : "Criar conta →"}
      </button>
    </form>
  );
}
