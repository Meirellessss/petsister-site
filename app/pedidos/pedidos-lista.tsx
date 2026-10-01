"use client";

import { useState } from "react";
import type { Pedido } from "@/lib/types";
import { detalhePedido } from "./actions";
import styles from "./pedidos.module.css";

const badgeStyle: Record<string, { background: string; color: string }> = {
  pendente: { background: "#fff7ed", color: "#c2410c" },
  pago: { background: "#f0fdf4", color: "#166534" },
  cancelado: { background: "#fef2f2", color: "#991b1b" },
};

function formatarPreco(v: number) {
  return v.toFixed(2).replace(".", ",");
}

type Detalhe = Awaited<ReturnType<typeof detalhePedido>>;

export default function PedidosLista({ pedidos }: { pedidos: (Pedido & { qtd: number })[] }) {
  const [aberto, setAberto] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null);

  async function verPedido(id: number) {
    setAberto(id);
    setDetalhe(null);
    const d = await detalhePedido(id);
    setDetalhe(d);
  }

  return (
    <>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>#{p.id}</strong>
                </td>
                <td>{new Date(p.criado_em).toLocaleString("pt-BR")}</td>
                <td>
                  {p.qtd} item{p.qtd !== 1 ? "s" : ""}
                </td>
                <td style={{ fontWeight: 700, color: "var(--p700)" }}>R$ {formatarPreco(p.total)}</td>
                <td>
                  <span className={styles.badge} style={badgeStyle[p.status]}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className={styles.btnSm} onClick={() => verPedido(p.id)}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <div className={styles.modalBody}>
              {!detalhe ? (
                <p style={{ color: "var(--muted)" }}>Carregando…</p>
              ) : "erro" in detalhe ? (
                <p style={{ color: "var(--muted)" }}>{detalhe.erro}</p>
              ) : (
                <>
                  {detalhe.itens.map((i, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: ".6rem 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <strong>{i.nome}</strong>
                        <br />
                        <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>× {i.quantidade}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--p700)" }}>
                        R$ {formatarPreco(i.preco_unitario * i.quantidade)}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: ".8rem",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: "var(--p700)" }}>R$ {formatarPreco(detalhe.total)}</span>
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
