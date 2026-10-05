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
