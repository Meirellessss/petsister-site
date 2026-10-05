"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Agendamento, StatusAgendamento } from "@/lib/types";
import { atualizarStatusAgendamento } from "../actions";
import styles from "../admin.module.css";

const badgeStyle: Record<string, { background: string; color: string }> = {
  agendado: { background: "#fff7ed", color: "#c2410c" },
  concluido: { background: "#f0fdf4", color: "#166534" },
  cancelado: { background: "#fef2f2", color: "#991b1b" },
};

export default function AgendamentosClient({
  agendamentos,
  infoUsuario,
}: {
  agendamentos: Agendamento[];
  infoUsuario: Record<string, { nome: string; email: string }>;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  function mudarStatus(id: number, status: StatusAgendamento) {
    startTransition(async () => {
      await atualizarStatusAgendamento(id, status);
      router.refresh();
    });
  }

  return (
    <div className={styles.card}>
      <div className={styles.tw}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Pet</th>
              <th>Serviço</th>
              <th>Data / Hora</th>
              <th>Obs</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                  Nenhum agendamento
                </td>
              </tr>
            )}
            {agendamentos.map((a) => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{infoUsuario[a.usuario_id]?.nome ?? "—"}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{infoUsuario[a.usuario_id]?.email ?? ""}</div>
                </td>
                <td>
                  {a.pet_nome ? (
                    <>
                      {a.pet_nome}
                      {a.pet_raca && <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{a.pet_raca}</div>}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{a.servico}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{new Date(a.data_hora).toLocaleDateString("pt-BR")}</div>
                  <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                    {new Date(a.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>
                <td style={{ fontSize: ".78rem", color: "var(--muted)", maxWidth: 120 }}>
                  {(a.observacoes ?? "—").slice(0, 50)}
                </td>
                <td>
                  <span className={styles.badge} style={badgeStyle[a.status]}>
                    {a.status}
                  </span>
                </td>
                <td>
                  <select
                    className={styles.fc}
                    style={{ padding: ".3rem .5rem", fontSize: ".78rem", width: "auto" }}
                    defaultValue={a.status}
                    onChange={(e) => mudarStatus(a.id, e.target.value as StatusAgendamento)}
                  >
                    <option value="agendado">Agendado</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
/* =========================================
   PETSISTER - AGENDA ADMIN
   ========================================= */

.scheduleStats {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 1rem;

  margin-bottom: 1rem;
}

.scheduleStats > div {
  padding: 1rem 1.2rem;

  border: 1.5px solid #eadfd2;

  border-radius: 14px;

  background: #ffffff;
}

.scheduleStats span {
  display: block;

  color: #64748b;

  font-size: 0.72rem;
}

.scheduleStats strong {
  display: block;

  margin-top: 0.2rem;

  color: #0f1e4a;

  font-size: 1.6rem;
}

.scheduleToolbar {
  display: flex;

  align-items: end;

  justify-content: space-between;

  gap: 1rem;

  padding: 1rem;

  margin-bottom: 1rem;

  border: 1.5px solid #eadfd2;

  border-radius: 14px;

  background: #ffffff;
}

.scheduleToolbar label {
  display: block;

  margin-bottom: 0.3rem;

  color: #64748b;

  font-size: 0.7rem;

  font-weight: 700;
}

.scheduleFilters {
  display: flex;

  gap: 0.45rem;

  flex-wrap: wrap;
}

.scheduleFilter,
.scheduleFilterActive {
  padding: 0.5rem 0.8rem;

  border: 1.5px solid #eadfd2;

  border-radius: 9px;

  background: #ffffff;

  color: #64748b;

  font-size: 0.75rem;

  font-weight: 700;

  cursor: pointer;
}

.scheduleFilterActive {
  border-color: #ea580c;

  background: #ea580c;

  color: #ffffff;
}

.timeline {
  overflow: hidden;

  border: 1.5px solid #eadfd2;

  border-radius: 16px;

  background: #ffffff;
}

.timelineRow {
  display: grid;

  grid-template-columns:
    70px 1fr 1fr;

  min-height: 120px;

  border-bottom: 1px solid #eadfd2;
}

.timelineRow:last-child {
  border-bottom: none;
}

.timelineTime {
  display: flex;

  align-items: flex-start;

  justify-content: center;

  padding-top: 1rem;

  background: #fffaf3;

  color: #64748b;

  font-size: 0.76rem;

  font-weight: 800;

  border-right: 1px solid #eadfd2;
}

.timelineColumn {
  padding: 0.65rem;

  border-right: 1px solid #eadfd2;
}

.appointmentCard {
  height: 100%;

  padding: 0.8rem;

  border-radius: 12px;
}

.appointmentBath {
  background: #fff7ed;

  border: 1px solid #fed7aa;
}

.appointmentVet {
  background: #eff6ff;

  border: 1px solid #bfdbfe;
}

.appointmentTop {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 0.5rem;
}

.appointmentTop strong {
  color: #0f1e4a;

  font-size: 0.8rem;
}

.appointmentTop span {
  color: #64748b;

  font-size: 0.6rem;

  font-weight: 700;

  text-transform: uppercase;
}

.appointmentPet {
  margin-top: 0.45rem;

  color: #0f1e4a;

  font-size: 0.85rem;

  font-weight: 800;
}

.appointmentClient {
  margin-top: 0.1rem;

  color: #64748b;

  font-size: 0.7rem;
}

.appointmentActions {
  margin-top: 0.6rem;
}

.freeSlot {
  height: 100%;

  min-height: 85px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  border: 1px dashed #eadfd2;

  border-radius: 12px;

  background: #fffaf3;

  color: #94a3b8;
}

.freeSlot strong {
  font-size: 0.75rem;
}

.freeSlot span {
  margin-top: 0.1rem;

  font-size: 0.65rem;
}

@media (max-width: 850px) {
  .scheduleStats {
    grid-template-columns: 1fr;
  }

  .scheduleToolbar {
    flex-direction: column;

    align-items: stretch;
  }

  .timelineRow {
    grid-template-columns:
      55px 1fr;
  }

  .timelineColumn:last-child {
    grid-column: 2;

    border-top: 1px solid #eadfd2;
  }
}
