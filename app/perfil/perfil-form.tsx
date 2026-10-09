
"use client";

import { useActionState, useState } from "react";
import { salvarPerfil, type EstadoPerfil } from "./actions";
import styles from "./perfil.module.css";

type DadosPerfil = {
  nome: string | null;
  telefone: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
};

type Props = {
  email: string;
  perfil: DadosPerfil | null;
};

export default function PerfilForm({ email, perfil }: Props) {
  const [estadoForm, formAction, pendente] = useActionState<
    EstadoPerfil,
    FormData
  >(salvarPerfil, {});

  const [dados, setDados] = useState({
    nome: perfil?.nome ?? "",
    telefone: perfil?.telefone ?? "",
    cep: perfil?.cep ?? "",
    rua: perfil?.rua ?? "",
    numero: perfil?.numero ?? "",
    complemento: perfil?.complemento ?? "",
    bairro: perfil?.bairro ?? "",
    cidade: perfil?.cidade ?? "",
    estado: perfil?.estado ?? "",
  });

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState("");

  function atualizar(
    campo: keyof typeof dados,
    valor: string,
  ) {
    setDados((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function buscarCep() {
    const cep = dados.cep.replace(/\D/g, "");

    setAvisoCep("");

    if (!cep) return;

    if (cep.length !== 8) {
      setAvisoCep("Digite um CEP com 8 números.");
      return;
    }

    setBuscandoCep(true);

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`,
      );

      if (!resposta.ok) {
        throw new Error("Falha ao consultar o CEP.");
      }

      const endereco = await resposta.json();

      if (endereco.erro) {
        setAvisoCep("CEP não encontrado. Confira os números.");
        return;
      }

      setDados((anterior) => ({
        ...anterior,
        rua: endereco.logradouro || anterior.rua,
        bairro: endereco.bairro || anterior.bairro,
        cidade: endereco.localidade || anterior.cidade,
        estado: endereco.uf || anterior.estado,
      }));

      setAvisoCep("Endereço localizado! Confira os dados.");
    } catch {
      setAvisoCep(
        "Não foi possível consultar o CEP agora. Preencha o endereço manualmente.",
      );
    } finally {
      setBuscandoCep(false);
    }
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sideCard}>
        <div className={styles.avatar} aria-hidden="true">
          {dados.nome.trim().charAt(0).toUpperCase() || "☺"}
        </div>

        <h2 className={styles.sideTitle}>
          {dados.nome || "Meu perfil"}
        </h2>

        <p className={styles.sideEmail}>{email}</p>

        <div className={styles.sideDivider} />

        <p className={styles.sideHint}>
          Mantenha seus dados atualizados para facilitar suas
          compras e entregas.
        </p>

        <div className={styles.sideDivider} />

        <p className={styles.sideHint}>
          <strong>🐾 Dica:</strong> confira o endereço antes de
          salvar para ajudar a garantir uma entrega tranquila.
        </p>
      </aside>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Dados pessoais</h2>

        <p className={styles.sectionDescription}>
          Informe seus dados para manter seu cadastro atualizado.
        </p>

        <form action={formAction} className={styles.form}>
          <div className={styles.fields}>
            <label className={`${styles.field} ${styles.full}`}>
              <span className={styles.label}>Nome completo *</span>
              <input
                className={styles.input}
                name="nome"
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                value={dados.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                required
                maxLength={120}
              />
            </label>

            <label className={`${styles.field} ${styles.full}`}>
              <span className={styles.label}>E-mail</span>
              <input
                className={`${styles.input} ${styles.readonly}`}
                type="email"
                value={email}
                readOnly
                aria-readonly="true"
              />
              <span className={styles.helper}>
                O e-mail da conta não pode ser alterado por aqui.
              </span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Telefone / WhatsApp</span>
              <input
                className={styles.input}
                name="telefone"
                type="tel"
                autoComplete="tel"
                placeholder="(21) 99999-9999"
                value={dados.telefone}
                onChange={(e) => atualizar("telefone", e.target.value)}
                maxLength={25}
              />
            </label>
          </div>

          <div className={styles.separator} />

          <div>
            <h2 className={styles.sectionTitle}>
              Endereço de entrega
            </h2>

            <p className={styles.sectionDescription}>
              Consulte o CEP para preencher parte do endereço
              automaticamente.
            </p>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cep">
                CEP
              </label>
              <input
                className={styles.input}
                id="cep"
                name="cep"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                value={dados.cep}
                onChange={(e) => atualizar("cep", e.target.value)}
                onBlur={buscarCep}
                maxLength={9}
              />
              <span className={styles.helper}>
                {buscandoCep
                  ? "Consultando CEP..."
                  : "Preencha o CEP para localizar o endereço."}
              </span>
              {avisoCep && (
                <span role="status" className={styles.helper}>
                  {avisoCep}
                </span>
              )}
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Estado</span>
              <input
                className={styles.input}
                name="estado"
                type="text"
                autoComplete="address-level1"
                placeholder="RJ"
                value={dados.estado}
                onChange={(e) => atualizar("estado", e.target.value.toUpperCase())}
                maxLength={2}
              />
            </label>

            <label className={`${styles.field} ${styles.full}`}>
              <span className={styles.label}>Rua / Avenida</span>
              <input
                className={styles.input}
                name="rua"
                type="text"
                autoComplete="street-address"
                placeholder="Nome da rua ou avenida"
                value={dados.rua}
                onChange={(e) => atualizar("rua", e.target.value)}
                maxLength={180}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Número</span>
              <input
                className={styles.input}
                name="numero"
                type="text"
                placeholder="Número da residência"
                value={dados.numero}
                onChange={(e) => atualizar("numero", e.target.value)}
                maxLength={20}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Complemento</span>
              <input
                className={styles.input}
                name="complemento"
                type="text"
                autoComplete="address-line2"
                placeholder="Apartamento, bloco etc."
                value={dados.complemento}
                onChange={(e) => atualizar("complemento", e.target.value)}
                maxLength={100}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Bairro</span>
              <input
                className={styles.input}
                name="bairro"
                type="text"
                autoComplete="address-level3"
                placeholder="Seu bairro"
                value={dados.bairro}
                onChange={(e) => atualizar("bairro", e.target.value)}
                maxLength={100}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Cidade</span>
              <input
                className={styles.input}
                name="cidade"
                type="text"
                autoComplete="address-level2"
                placeholder="Sua cidade"
                value={dados.cidade}
                onChange={(e) => atualizar("cidade", e.target.value)}
                maxLength={100}
              />
            </label>
          </div>

          {estadoForm.erro && (
            <div
              className={`${styles.feedback} ${styles.error}`}
              role="alert"
            >
              {estadoForm.erro}
            </div>
          )}

          {estadoForm.sucesso && (
            <div
              className={`${styles.feedback} ${styles.success}`}
              role="status"
            >
              {estadoForm.sucesso}
            </div>
          )}

          <div className={styles.separator} />

          <div className={styles.submitRow}>
            <p className={styles.submitHint}>
              Seus dados serão usados para seu cadastro e para
              facilitar suas entregas.
            </p>

            <button
              className={styles.button}
              type="submit"
              disabled={pendente || buscandoCep}
            >
              {pendente
                ? "Salvando..."
                : "Salvar minhas informações"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
