"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";

import {
  criarAgendamento,
  obterHorariosOcupados,
} from "./actions";

import styles from "./agendamentos.module.css";

const SERVICOS = [
  {
    nome: "Banho",
    grupo: "banho_tosa",
    icone: "🛁",
    descricao: "Higiene e cuidado",
  },
  {
    nome: "Tosa",
    grupo: "banho_tosa",
    icone: "✂️",
    descricao: "Estilo e bem-estar",
  },
  {
    nome: "Banho e Tosa",
    grupo: "banho_tosa",
    icone: "🐶",
    descricao: "Cuidado completo",
  },
  {
    nome: "Consulta Veterinária",
    grupo: "veterinario",
    icone: "🩺",
    descricao: "Consulta e avaliação",
  },
  {
    nome: "Vacinação",
    grupo: "veterinario",
    icone: "💉",
    descricao: "Vacinas e prevenção",
  },
] as const;

const HORARIOS = Array.from(
  { length: 21 },
  (_, index) => {
    const minutos = 8 * 60 + index * 30;

    const hora = Math.floor(minutos / 60);
    const minuto = minutos % 60;

    return `${String(hora).padStart(2, "0")}:${String(
      minuto,
    ).padStart(2, "0")}`;
  },
);

function dataLocal(date: Date) {
  const ano = date.getFullYear();
  const mes = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const dia = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarDia(data: string) {
  const [ano, mes, dia] =
    data.split("-").map(Number);

  const date = new Date(
    ano,
    mes - 1,
    dia,
  );

  return {
    semana: date
      .toLocaleDateString("pt-BR", {
        weekday: "short",
      })
      .replace(".", ""),

    dia: String(
      date.getDate(),
    ).padStart(2, "0"),

    mes: date
      .toLocaleDateString("pt-BR", {
        month: "short",
      })
      .replace(".", ""),
  };
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
    useState(dataLocal(new Date()));

  const [horario, setHorario] =
    useState("");

  const [
    horariosOcupados,
    setHorariosOcupados,
  ] = useState<string[]>([]);

  const [carregando, setCarregando] =
    useState(false);

  const servicoAtual = SERVICOS.find(
    (item) =>
      item.nome === servico,
  );

  const proximosDias = useMemo(() => {
    return Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date();

        date.setDate(
          date.getDate() + index,
        );

        return dataLocal(date);
      },
    );
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function carregarHorarios() {
      if (!data || !servicoAtual) {
        setHorariosOcupados([]);
        return;
      }

      setHorario("");
      setCarregando(true);

      const ocupados =
        await obterHorariosOcupados(
          data,
          servicoAtual.grupo,
        );

      if (cancelado) return;

      setHorariosOcupados(
        ocupados,
      );

      setCarregando(false);
    }

    carregarHorarios();

    return () => {
      cancelado = true;
    };
  }, [data, servicoAtual]);

  return (
    <form
      action={formAction}
      className={styles.modernForm}
    >
      {state?.erro && (
        <div className={styles.alertErr}>
          ⚠️ {state.erro}
        </div>
      )}

      {state?.sucesso && (
        <div className={styles.alertOk}>
          ✓ Agendamento realizado
          com sucesso!
        </div>
      )}

      <input
        type="hidden"
        name="data_hora"
        value={
          data && horario
            ? `${data}T${horario}`
            : ""
        }
      />

      {/* SERVIÇO */}

      <section
        className={styles.stepBlock}
      >
        <div
          className={styles.stepTitle}
        >
          <span>1</span>

          <div>
            <strong>
              O que seu pet precisa?
            </strong>

            <small>
              Escolha o tipo de atendimento
            </small>
          </div>
        </div>

        <div
          className={styles.serviceGrid}
        >
          {SERVICOS.map((item) => {
            const ativo =
              servico === item.nome;

            return (
              <button
                key={item.nome}
                type="button"
                className={`${styles.serviceCard} ${
                  ativo
                    ? styles.serviceCardActive
                    : ""
                }`}
                onClick={() => {
                  setServico(item.nome);
                  setHorario("");
                }}
              >
                <span
                  className={
                    styles.serviceIcon
                  }
                >
                  {item.icone}
                </span>

                <strong>
                  {item.nome}
                </strong>

                <small>
                  {item.descricao}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      {/* DATA */}

      <section
        className={styles.stepBlock}
      >
        <div
          className={styles.stepTitle}
        >
          <span>2</span>

          <div>
            <strong>
              Escolha o dia
            </strong>

            <small>
              Selecione uma data
            </small>
          </div>
        </div>

        <div
          className={styles.dateScroller}
        >
          {proximosDias.map((item) => {
            const info =
              formatarDia(item);

            const ativo =
              data === item;

            return (
              <button
                key={item}
                type="button"
                className={`${styles.dateCard} ${
                  ativo
                    ? styles.dateCardActive
                    : ""
                }`}
                onClick={() => {
                  setData(item);
                  setHorario("");
                }}
              >
                <span>
                  {info.semana}
                </span>

                <strong>
                  {info.dia}
                </strong>

                <small>
                  {info.mes}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      {/* HORÁRIO */}

      <section
        className={styles.stepBlock}
      >
        <div
          className={styles.stepTitle}
        >
          <span>3</span>

          <div>
            <strong>
              Escolha o horário
            </strong>

            <small>
              Atendimento das 08:00 às 18:00
            </small>
          </div>
        </div>

        {!servicoAtual ? (
          <div
            className={styles.emptyTime}
          >
            Primeiro escolha o atendimento
            acima.
          </div>
        ) : carregando ? (
          <div
            className={styles.emptyTime}
          >
            Carregando horários...
          </div>
        ) : (
          <>
            <div
              className={styles.timeGrid}
            >
              {HORARIOS.map((item) => {
                const ocupado =
                  horariosOcupados.includes(
                    item,
                  );

                const ativo =
                  horario === item;

                return (
                  <button
                    key={item}
                    type="button"
                    disabled={ocupado}
                    className={`${styles.timeButton} ${
                      ativo
                        ? styles.timeButtonActive
                        : ""
                    } ${
                      ocupado
                        ? styles.timeButtonOccupied
                        : ""
                    }`}
                    onClick={() =>
                      setHorario(item)
                    }
                  >
                    {item}

                    {ocupado && (
                      <small>
                        Ocupado
                      </small>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              className={styles.legend}
            >
              <span>
                <i
                  className={
                    styles.dotAvailable
                  }
                />
                Disponível
              </span>

              <span>
                <i
                  className={
                    styles.dotOccupied
                  }
                />
                Ocupado
              </span>
            </div>
          </>
        )}
      </section>

      {/* PET */}

      <section
        className={styles.stepBlock}
      >
        <div
          className={styles.stepTitle}
        >
          <span>4</span>

          <div>
            <strong>
              Sobre o seu pet
            </strong>

            <small>
              Conte um pouco sobre ele
            </small>
          </div>
        </div>

        <div
          className={styles.petGrid}
        >
          <div className={styles.fg}>
            <label>
              Nome do pet
            </label>

            <input
              type="text"
              name="pet_nome"
              placeholder="Ex.: Thor"
            />
          </div>

          <div className={styles.fg}>
            <label>
              Raça
            </label>

            <input
              type="text"
              name="pet_raca"
              placeholder="Ex.: Labrador"
            />
          </div>

          <div className={styles.fg}>
            <label>
              Porte
            </label>

            <select
              name="pet_porte"
              defaultValue="Medio"
            >
              <option value="Pequeno">
                Pequeno
              </option>

              <option value="Medio">
                Médio
              </option>

              <option value="Grande">
                Grande
              </option>
            </select>
          </div>

          <div className={styles.fg}>
            <label>
              Observações
            </label>

            <input
              type="text"
              name="observacoes"
              placeholder="Alguma informação importante?"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={
          pending ||
          !servico ||
          !data ||
          !horario
        }
        className={
          styles.modernSubmit
        }
      >
        {pending
          ? "Agendando..."
          : `Confirmar agendamento${
              horario
                ? ` · ${horario}`
                : ""
            } →`}
      </button>
    </form>
  );
}
