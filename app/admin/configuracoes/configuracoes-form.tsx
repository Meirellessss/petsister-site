
"use client";

import { useActionState } from "react";
import { salvarLimiteEstoqueBaixo } from "../actions";
import styles from "../admin.module.css";

const estadoInicial = {
  ok: false,
  mensagem: "",
};

export default function ConfiguracoesForm({
  limiteInicial,
}: {
  limiteInicial: number;
}) {
  const [estado, formAction, pendente] = useActionState(
    salvarLimiteEstoqueBaixo,
    estadoInicial
  );

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3>Produtos e estoque</h3>
          <p
            style={{
              marginTop: ".3rem",
              color: "var(--muted)",
              fontSize: ".8rem",
            }}
          >
            Configure quando um produto deve ser considerado com estoque baixo.
          </p>
        </div>
      </div>

      <form action={formAction} className={styles.modalBody}>
        <div className={styles.fg}>
          <label htmlFor="estoque_limite_baixo">
            Limite de estoque baixo
          </label>

          <input
            id="estoque_limite_baixo"
            name="estoque_limite_baixo"
            type="number"
            className={styles.fc}
            min="0"
            max="10000"
            step="1"
            defaultValue={limiteInicial}
            required
          />

          <small style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Exemplo: com o limite 8, os produtos com 8 unidades ou menos
            serão considerados estoque baixo. Use 0 para alertar apenas
            quando o estoque chegar a zero.
          </small>
        </div>

        {estado.mensagem && (
          <div
            className={styles.alert}
            role="status"
            style={{
              background: estado.ok ? "#f0fdf4" : "#fef2f2",
              color: estado.ok ? "#166534" : "#991b1b",
              border: `1px solid ${estado.ok ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {estado.mensagem}
          </div>
        )}

        <div>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={pendente}
          >
            {pendente ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </form>
    </section>
  );
}
