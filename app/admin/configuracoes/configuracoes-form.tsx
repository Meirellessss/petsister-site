
"use client";

import { useActionState } from "react";
import {
  salvarLimiteEstoqueBaixo,
  salvarConfiguracaoParcelamento,
  salvarDadosLoja,
} from "../actions";
import styles from "../admin.module.css";

const estadoInicial = {
  ok: false,
  mensagem: "",
};

export default function ConfiguracoesForm({
  limiteInicial,
  parcelamentoAtivoInicial,
  parcelasMaximasIniciais,
  telefoneInicial = "",
  whatsappInicial = "",
  mensagemEntregaInicial = "",
}: {
  limiteInicial: number;
  parcelamentoAtivoInicial: boolean;
  parcelasMaximasIniciais: number;
  telefoneInicial?: string;
  whatsappInicial?: string;
  mensagemEntregaInicial?: string;
}) {
  const [estadoEstoque, salvarEstoque, pendenteEstoque] =
    useActionState(salvarLimiteEstoqueBaixo, estadoInicial);

  const [estadoParcelamento, salvarParcelamento, pendenteParcelamento] =
    useActionState(salvarConfiguracaoParcelamento, estadoInicial);

    const [estadoLoja, salvarLoja, pendenteLoja] =
    useActionState(salvarDadosLoja, estadoInicial);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
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
              Defina quando um produto deve ser considerado com estoque baixo.
            </p>
          </div>
        </div>

        <form action={salvarEstoque} className={styles.modalBody}>
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
              Produtos com essa quantidade ou menos serão sinalizados
              no Dashboard e na lista de produtos.
            </small>
          </div>

          {estadoEstoque.mensagem && (
            <div
              className={styles.alert}
              role="status"
              style={{
                background: estadoEstoque.ok ? "#f0fdf4" : "#fef2f2",
                color: estadoEstoque.ok ? "#166534" : "#991b1b",
                border: `1px solid ${
                  estadoEstoque.ok ? "#bbf7d0" : "#fecaca"
                }`,
              }}
            >
              {estadoEstoque.mensagem}
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={pendenteEstoque}
            >
              {pendenteEstoque ? "Salvando..." : "Salvar limite de estoque"}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3>Vendas e parcelamento</h3>
            <p
              style={{
                marginTop: ".3rem",
                color: "var(--muted)",
                fontSize: ".8rem",
              }}
            >
              Configure como as condições de parcelamento serão apresentadas
              na loja.
            </p>
          </div>
        </div>

        <form action={salvarParcelamento} className={styles.modalBody}>
          <div className={styles.fg}>
            <label
              htmlFor="parcelamento_ativo"
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".65rem",
                cursor: "pointer",
              }}
            >
              <input
                id="parcelamento_ativo"
                name="parcelamento_ativo"
                type="checkbox"
                defaultChecked={parcelamentoAtivoInicial}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "var(--p600)",
                }}
              />
              Ativar exibição do parcelamento
            </label>

            <small style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Desmarque para não exibir as informações de parcelamento
              na página dos produtos.
            </small>
          </div>

          <div className={styles.fg}>
            <label htmlFor="parcelamento_maximo">
              Número máximo de parcelas
            </label>

            <select
              id="parcelamento_maximo"
              name="parcelamento_maximo"
              className={styles.fc}
              defaultValue={parcelasMaximasIniciais}
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x {n === 1 ? "parcela" : "parcelas"}
                </option>
              ))}
            </select>

            <small style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Escolha de 1 a 12 parcelas. Só configure condições que
              correspondam às modalidades de pagamento realmente oferecidas.
            </small>
          </div>

          {estadoParcelamento.mensagem && (
            <div
              className={styles.alert}
              role="status"
              style={{
                background: estadoParcelamento.ok ? "#f0fdf4" : "#fef2f2",
                color: estadoParcelamento.ok ? "#166534" : "#991b1b",
                border: `1px solid ${
                  estadoParcelamento.ok ? "#bbf7d0" : "#fecaca"
                }`,
              }}
            >
              {estadoParcelamento.mensagem}
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={pendenteParcelamento}
            >
              {pendenteParcelamento
                ? "Salvando..."
                : "Salvar parcelamento"}
            </button>
          </div>
        </form>
      </section>
      
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3>Atendimento e entrega</h3>
            <p
              style={{
                marginTop: ".3rem",
                color: "var(--muted)",
                fontSize: ".8rem",
              }}
            >
              Altere os contatos e a mensagem de entrega da PetSister.
            </p>
          </div>
        </div>

        <form action={salvarLoja} className={styles.modalBody}>
          <div className={styles.fg}>
            <label htmlFor="telefone_atendimento">
              Telefone de atendimento
            </label>
            <input
              id="telefone_atendimento"
              name="telefone_atendimento"
              type="text"
              className={styles.fc}
              maxLength={30}
              defaultValue={telefoneInicial}
              placeholder="Ex.: (11) 99999-9999"
            />
          </div>

          <div className={styles.fg}>
            <label htmlFor="whatsapp_atendimento">
              WhatsApp
            </label>
            <input
              id="whatsapp_atendimento"
              name="whatsapp_atendimento"
              type="text"
              className={styles.fc}
              maxLength={30}
              defaultValue={whatsappInicial}
              placeholder="Número com DDD"
            />
          </div>

          <div className={styles.fg}>
            <label htmlFor="mensagem_entrega">
              Mensagem de entrega
            </label>
            <textarea
              id="mensagem_entrega"
              name="mensagem_entrega"
              className={styles.fc}
              maxLength={300}
              rows={3}
              defaultValue={mensagemEntregaInicial}
              placeholder="Ex.: Consulte o prazo de entrega para sua região."
            />
          </div>

          {estadoLoja.mensagem && (
            <div
              className={styles.alert}
              role="status"
              style={{
                background: estadoLoja.ok ? "#f0fdf4" : "#fef2f2",
                color: estadoLoja.ok ? "#166534" : "#991b1b",
                border: `1px solid ${
                  estadoLoja.ok ? "#bbf7d0" : "#fecaca"
                }`,
              }}
            >
              {estadoLoja.mensagem}
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={pendenteLoja}
            >
              {pendenteLoja ? "Salvando..." : "Salvar dados da loja"}
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}
