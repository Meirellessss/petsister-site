"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import {
  criarAgendamento,
  obterHorariosOcupados,
} from "./actions";
import styles from "./agendamentos.module.css";

const SERVICOS = [
  "Banho",
  "Tosa",
  "Banho e Tosa",
  "Consulta Veterinária",
  "Vacinação",
];

const SERVICOS_BANHO_TOSA = [
  "Banho",
  "Tosa",
  "Banho e Tosa",
];

const SERVICOS_VETERINARIO = [
  "Consulta Veterinária",
  "Vacinação",
];

const HORARIOS = Array.from({ length: 21 }, (_, index) => {
  const minutos = 8 * 60 + index * 30;
  const hora = Math.floor(minutos / 60);
  const minuto = minutos % 60;

  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
});

function obterCategoriaServico(
  servico: string,
): "banho_tosa" | "veterinario" | null {
  if (SERVICOS_BANHO_TOSA.includes(servico)) {
    return "banho_tosa";
  }

  if (SERVICOS_VETERINARIO.includes(servico)) {
    return "veterinario";
  }

  return null;
}

function obterHoje() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(
    agora.getMonth() + 1,
  ).padStart(2, "0");

  const dia = String(
    agora.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export default function AgendamentoForm() {
  const [state, formAction, pending] =
    useActionState(
      criarAgendamento,
      undefined,
    );

  const [servico, setServico] =
    useState("");

  const [data, setData] =
    useState(obterHoje());

  const [horario, setHorario] =
    useState("");

  const [
    horariosOcupados,
    setHorariosOcupados,
  ] = useState<string[]>([]);

  const [
    carregandoHorarios,
    setCarregandoHorarios,
  ] = useState(false);

  const categoria =
    obterCategoriaServico(servico);

  useEffect(() => {
    let cancelado = false;

    async function carregarHorarios() {
      setHorario("");

      if (!data || !categoria) {
        setHorariosOcupados([]);
        return;
      }

      setCarregandoHorarios(true);

      const ocupados =
        await obterHorariosOcupados(
          data,
          categoria,
        );

      if (cancelado) {
        return;
      }

      setHorariosOcupados(ocupados);
      setCarregandoHorarios(false);
    }

    carregarHorarios();

    return () => {
      cancelado = true;
    };
  }, [data, categoria]);

  return (
    <form
      action={formAction}
      className={styles.formBody}
    >
      {state?.sucesso && (
        <div className={styles.alertOk}>
          ✓ Agendado com sucesso!
        </div>
      )}

      {state?.erro && (
        <div className={styles.alertErr}>
          ⚠ {state.erro}
        </div>
      )}

      <div className={styles.fg}>
        <label>Serviço *</label>

        <select
          name="servico"
          value={servico}
          onChange={(event) => {
            setServico(event.target.value);
            setHorario("");
          }}
          required
        >
          <option value="">
            Selecione…
          </option>

          {SERVICOS.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: ".8rem",
        }}
      >
        <div className={styles.fg}>
          <label>Nome do pet</label>

          <input
            type="text"
            name="pet_nome"
            placeholder="Ex: Thor"
          />
        </div>

        <div className={styles.fg}>
          <label>Raça</label>

          <input
            type="text"
            name="pet_raca"
            placeholder="Ex: Labrador"
          />
        </div>
      </div>

      <div className={styles.fg}>
        <label>Porte do cão</label>

        <select
          name="pet_porte"
          defaultValue="Medio"
        >
          <option value="Pequeno">
            Pequeno (até 10kg)
          </option>

          <option value="Medio">
            Médio (10–25kg)
          </option>

          <option value="Grande">
            Grande (acima de 25kg)
          </option>
        </select>
      </div>

      <div className={styles.fg}>
        <label>Data *</label>

        <input
          type="date"
          name="data"
          value={data}
          min={obterHoje()}
          onChange={(event) => {
            setData(event.target.value);
            setHorario("");
          }}
          required
        />
      </div>

      <div className={styles.fg}>
        <label>Horário *</label>

        <select
          value={horario}
          onChange={(event) =>
            setHorario(event.target.value)
          }
          disabled={
            !categoria ||
            carregandoHorarios
          }
          required
        >
          <option value="">
            {!categoria
              ? "Escolha o serviço primeiro"
              : carregandoHorarios
                ? "Carregando horários…"
                : "Selecione um horário…"}
          </option>

          {HORARIOS.map((item) => {
            const ocupado =
              horariosOcupados.includes(item);

            return (
              <option
                key={item}
                value={item}
                disabled={ocupado}
              >
                {item}
                {ocupado
                  ? " — ocupado"
                  : ""}
              </option>
            );
          })}
        </select>

        <input
          type="hidden"
          name="data_hora"
          value={
            data && horario
              ? `${data}T${horario}`
              : ""
          }
        />
      </div>

      <div className={styles.fg}>
        <label>Observações</label>

        <textarea
          name="observacoes"
          placeholder="Tamanho, temperamento, preferências…"
        />
      </div>

      <button
        type="submit"
        className={styles.btnFull}
        disabled={
          pending ||
          carregandoHorarios ||
          !servico ||
          !horario
        }
      >
        {pending
          ? "Agendando…"
          : "Agendar →"}
      </button>
    </form>
  );
}
