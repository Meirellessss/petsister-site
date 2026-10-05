"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  Agendamento,
  StatusAgendamento,
} from "@/lib/types";
import { atualizarStatusAgendamento } from "../actions";
import styles from "../admin.module.css";

type Filtro = "todos" | "banho_tosa" | "veterinario";

const HORARIOS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

const SERVICOS_BANHO = [
  "Banho",
  "Tosa",
  "Banho e Tosa",
];

const SERVICOS_VETERINARIO = [
  "Consulta Veterinária",
  "Vacinação",
];

const badgeStyle: Record<
  string,
  { background: string; color: string }
> = {
  agendado: {
    background: "#fff7ed",
    color: "#c2410c",
  },
  concluido: {
    background: "#f0fdf4",
    color: "#166534",
  },
  cancelado: {
    background: "#fef2f2",
    color: "#991b1b",
  },
};

function grupoServico(
  servico: string
): "banho_tosa" | "veterinario" {
  if (SERVICOS_VETERINARIO.includes(servico)) {
    return "veterinario";
  }

  return "banho_tosa";
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}`;
}

function obterProximosDias() {
  const dias: string[] = [];
  const hoje = new Date();

  for (let i = 0; i < 7; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + i);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    dias.push(`${ano}-${mes}-${dia}`);
  }

  return dias;
}

export default function AgendamentosClient({
  agendamentos,
  infoUsuario,
}: {
  agendamentos: Agendamento[];
  infoUsuario: Record<
    string,
    {
      nome: string;
      email: string;
    }
  >;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const proximosDias = useMemo(
    () => obterProximosDias(),
    []
  );

  const [dataSelecionada, setDataSelecionada] =
    useState(proximosDias[0]);

  const [filtro, setFiltro] =
    useState<Filtro>("todos");

  function mudarStatus(
    id: number,
    status: StatusAgendamento
  ) {
    startTransition(async () => {
      const resultado =
        await atualizarStatusAgendamento(id, status);

      if (resultado.ok) {
        router.refresh();
      }
    });
  }

  const agendamentosDoDia = useMemo(() => {
    return agendamentos.filter((a) => {
      return a.data_hora.slice(0, 10) === dataSelecionada;
    });
  }, [agendamentos, dataSelecionada]);

  const agendamentosFiltrados = useMemo(() => {
    if (filtro === "todos") {
      return agendamentosDoDia;
    }

    return agendamentosDoDia.filter(
      (a) => grupoServico(a.servico) === filtro
    );
  }, [agendamentosDoDia, filtro]);

  const totalAgendados = agendamentosDoDia.filter(
    (a) => a.status !== "cancelado"
  ).length;

  const totalBanho = agendamentosDoDia.filter(
    (a) =>
      a.status !== "cancelado" &&
      grupoServico(a.servico) === "banho_tosa"
  ).length;

  const totalVet = agendamentosDoDia.filter(
    (a) =>
      a.status !== "cancelado" &&
      grupoServico(a.servico) === "veterinario"
  ).length;

  function encontrarAgendamento(
    horario: string,
    grupo: "banho_tosa" | "veterinario"
  ) {
    return agendamentosFiltrados.find((a) => {
      const horarioAgendamento =
        a.data_hora.slice(11, 16);

      return (
        horarioAgendamento === horario &&
        grupoServico(a.servico) === grupo
      );
    });
  }

  function renderAgendamento(
    agendamento: Agendamento | undefined,
    grupo: "banho_tosa" | "veterinario"
  ) {
    if (!agendamento) {
      return (
        <div className={styles.freeSlot}>
          <strong>Disponível</strong>
          <span>Horário livre</span>
        </div>
      );
    }

    const usuario =
      infoUsuario[agendamento.usuario_id];

    const nomeCliente =
      usuario?.nome ?? "Cliente";

    const classeGrupo =
      grupo === "banho_tosa"
        ? styles.appointmentBath
        : styles.appointmentVet;

    return (
      <div
        className={`${styles.appointmentCard} ${classeGrupo}`}
      >
        <div className={styles.appointmentTop}>
          <strong>
            {agendamento.servico}
          </strong>

          <span>
            {agendamento.status}
          </span>
        </div>

        <div className={styles.appointmentPet}>
          🐾 {agendamento.pet_nome || "Pet"}
        </div>

        {agendamento.pet_raca && (
          <div className={styles.appointmentClient}>
            {agendamento.pet_raca}
          </div>
        )}

        <div className={styles.appointmentClient}>
          Cliente: {nomeCliente}
        </div>

        <div
          className={styles.appointmentActions}
        >
          <select
            className={styles.fc}
            style={{
              width: "100%",
              padding: ".4rem .5rem",
              fontSize: ".72rem",
            }}
            value={agendamento.status}
            onChange={(e) =>
              mudarStatus(
                agendamento.id,
                e.target.value as StatusAgendamento
              )
            }
          >
            <option value="agendado">
              Agendado
            </option>

            <option value="concluido">
              Concluído
            </option>

            <option value="cancelado">
              Cancelado
            </option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* RESUMO DO DIA */}
      <div className={styles.scheduleStats}>
        <div>
          <span>AGENDAMENTOS DO DIA</span>
          <strong>{totalAgendados}</strong>
        </div>

        <div>
          <span>BANHO / TOSA</span>
          <strong>{totalBanho}</strong>
        </div>

        <div>
          <span>VETERINÁRIO</span>
          <strong>{totalVet}</strong>
        </div>
      </div>

      {/* SELEÇÃO DE DATA E FILTRO */}
      <div className={styles.scheduleToolbar}>
        <div>
          <label>ESCOLHA O DIA</label>

          <div className={styles.scheduleFilters}>
            {proximosDias.map((data, index) => (
              <button
                key={data}
                type="button"
                className={
                  data === dataSelecionada
                    ? styles.scheduleFilterActive
                    : styles.scheduleFilter
                }
                onClick={() =>
                  setDataSelecionada(data)
                }
              >
                {index === 0
                  ? "Hoje"
                  : formatarData(data)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>VISUALIZAÇÃO</label>

          <div className={styles.scheduleFilters}>
            <button
              type="button"
              className={
                filtro === "todos"
                  ? styles.scheduleFilterActive
                  : styles.scheduleFilter
              }
              onClick={() => setFiltro("todos")}
            >
              Todos
            </button>

            <button
              type="button"
              className={
                filtro === "banho_tosa"
                  ? styles.scheduleFilterActive
                  : styles.scheduleFilter
              }
              onClick={() =>
                setFiltro("banho_tosa")
              }
            >
              Banho / Tosa
            </button>

            <button
              type="button"
              className={
                filtro === "veterinario"
                  ? styles.scheduleFilterActive
                  : styles.scheduleFilter
              }
              onClick={() =>
                setFiltro("veterinario")
              }
            >
              Veterinário
            </button>
          </div>
        </div>
      </div>

      {/* AGENDA */}
      <div className={styles.timeline}>
        {/* CABEÇALHO */}
        <div
          className={styles.timelineRow}
          style={{
            minHeight: "auto",
          }}
        >
          <div
            className={styles.timelineTime}
            style={{
              alignItems: "center",
              paddingTop: 0,
              fontSize: ".65rem",
            }}
          >
            HORA
          </div>

          <div
            className={styles.timelineColumn}
            style={{
              fontWeight: 800,
              color: "#0f1e4a",
              background: "#fffaf3",
              fontSize: ".78rem",
            }}
          >
            🛁 BANHO / TOSA
          </div>

          <div
            className={styles.timelineColumn}
            style={{
              fontWeight: 800,
              color: "#0f1e4a",
              background: "#fffaf3",
              fontSize: ".78rem",
            }}
          >
            🩺 VETERINÁRIO
          </div>
        </div>

        {HORARIOS.map((horario) => {
          const banho = encontrarAgendamento(
            horario,
            "banho_tosa"
          );

          const vet = encontrarAgendamento(
            horario,
            "veterinario"
          );

          return (
            <div
              className={styles.timelineRow}
              key={horario}
            >
              <div className={styles.timelineTime}>
                {horario}
              </div>

              <div className={styles.timelineColumn}>
                {renderAgendamento(
                  banho,
                  "banho_tosa"
                )}
              </div>

              <div className={styles.timelineColumn}>
                {renderAgendamento(
                  vet,
                  "veterinario"
                )}
              </div>
            </div>
          );
        })}
      </div>

      {agendamentosFiltrados.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            color: "var(--muted)",
            fontSize: ".85rem",
          }}
        >
          Nenhum agendamento encontrado
          para este dia.
        </div>
      )}
    </div>
  );
}
