"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Pedido, StatusPedido } from "@/lib/types";
import { atualizarStatusPedido } from "../actions";
import { detalhePedido } from "@/app/pedidos/actions";
import styles from "../admin.module.css";

const badgeStyle: Record<string, { background: string; color: string }> = {
  pendente: { background: "#fff7ed", color: "#c2410c" },
  pago: { background: "#f0fdf4", color: "#166534" },
  cancelado: { background: "#fef2f2", color: "#991b1b" },
};

type Detalhe = Awaited<ReturnType<typeof detalhePedido>>;

export default function PedidosClient({
  pedidos,
  infoUsuario,
}: {
  pedidos: Pedido[];
  infoUsuario: Record<string, { nome: string; email: string }>;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [aberto, setAberto] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null);

  function mudarStatus(id: number, status: StatusPedido) {
    startTransition(async () => {
      await atualizarStatusPedido(id, status);
      router.refresh();
    });
  }

  async function ver(id: number) {
    setAberto(id);
    setDetalhe(null);
    setDetalhe(await detalhePedido(id));
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.tw}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                    Nenhum pedido
                  </td>
                </tr>
              )}
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>#{p.id}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{infoUsuario[p.usuario_id]?.nome ?? "—"}</div>
                    <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{infoUsuario[p.usuario_id]?.email ?? ""}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--p700)" }}>R$ {p.total.toFixed(2).replace(".", ",")}</td>
                  <td>
                    <span className={styles.badge} style={badgeStyle[p.status]}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    {new Date(p.criado_em).toLocaleString("pt-BR")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
                      <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} onClick={() => ver(p.id)}>
                        Ver
                      </button>
                      <select
                        className={styles.fc}
                        style={{ padding: ".3rem .5rem", fontSize: ".78rem", width: "auto" }}
                        defaultValue={p.status}
                        onChange={(e) => mudarStatus(p.id, e.target.value as StatusPedido)}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {aberto !== null && (
        <div className={styles.overlay} onClick={() => setAberto(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Pedido #{aberto}</h3>
              <button className={styles.modalClose} onClick={() => setAberto(null)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody} style={{ gap: ".1rem" }}>
              {!detalhe ? (
                <p style={{ color: "var(--muted)" }}>Carregando…</p>
              ) : "erro" in detalhe ? (
                <p style={{ color: "var(--muted)" }}>{detalhe.erro}</p>
              ) : (
                <>
                  {detalhe.itens.map((i, idx) => (
                    <div
                      key={idx}
                      style={{ display: "flex", justifyContent: "space-between", padding: ".55rem 0", borderBottom: "1px solid var(--border)" }}
                    >
                      <div>
                        <strong style={{ fontSize: ".9rem" }}>{i.nome}</strong>
                        <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>× {i.quantidade}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--p700)" }}>
                        R$ {(i.preco_unitario * i.quantidade).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 700, paddingTop: ".7rem" }}>
                    <span>Total</span>
                    <span style={{ color: "var(--p700)" }}>R$ {detalhe.total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
