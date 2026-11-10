
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Pedido, StatusPedido } from "@/lib/types";
import { atualizarStatusPedido } from "../actions";
import { detalhePedido } from "@/app/pedidos/actions";
import styles from "../admin.module.css";

const badgeStyle: Record<
  string,
  { background: string; color: string }
> = {
  pendente: { background: "#fff7ed", color: "#c2410c" },
  pago: { background: "#f0fdf4", color: "#166534" },
  cancelado: { background: "#fef2f2", color: "#991b1b" },
};

const statusLabel: Record<StatusPedido, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
};

type Detalhe = Awaited<ReturnType<typeof detalhePedido>> | { erro: string };

function formatarMoeda(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PedidosClient({
  pedidos,
  infoUsuario,
  statusInicial,
}: {
  pedidos: Pedido[];
  infoUsuario: Record<string, { nome: string; email: string }>;
  statusInicial: "" | StatusPedido;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [erroStatus, setErroStatus] = useState("");
  const [aberto, setAberto] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  const termo = busca.trim().toLocaleLowerCase("pt-BR");

  const pedidosFiltrados = pedidos.filter((p) => {
    const totalPendentes = pedidos.filter((p) => p.status === "pendente").length;
    const totalPagos = pedidos.filter((p) => p.status === "pago").length;
    const totalCancelados = pedidos.filter((p) => p.status === "cancelado").length;   
    const cliente = infoUsuario[p.usuario_id];
    const texto = [
      String(p.id),
      cliente?.nome ?? "",
      cliente?.email ?? "",
      statusLabel[p.status],
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    return texto.includes(termo);
  });

  function mudarStatus(id: number, status: StatusPedido) {
    setErroStatus("");
    setSalvandoId(id);

    startTransition(async () => {
      try {
        const resultado = await atualizarStatusPedido(id, status);

        if (!resultado.ok) {
          setErroStatus(resultado.error);
          return;
        }

        router.refresh();
      } catch {
        setErroStatus(
          "Não foi possível atualizar o pedido. Tente novamente."
        );
      } finally {
        setSalvandoId(null);
      }
    });
  }

  async function ver(id: number) {
    setAberto(id);
    setDetalhe(null);
    setCarregandoDetalhe(true);

    try {
      const resultado = await detalhePedido(id);
      setDetalhe(resultado);
    } catch {
      setDetalhe({ erro: "Não foi possível carregar os detalhes do pedido." });
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  return (
    <>
     
<section className={styles.ordersStats}>
  <div className={styles.ordersStat}>
    <span className={styles.ordersStatLabel}>Total de pedidos</span>
    <strong className={styles.ordersStatValue}>{pedidos.length}</strong>
    <span className={styles.ordersStatHint}>Pedidos cadastrados</span>
  </div>

  <div className={styles.ordersStat}>
    <span className={styles.ordersStatLabel}>Pendentes</span>
    <strong className={styles.ordersStatValue}>{totalPendentes}</strong>
    <span className={styles.ordersStatHint}>Aguardando pagamento</span>
  </div>

  <div className={styles.ordersStat}>
    <span className={styles.ordersStatLabel}>Pagos</span>
    <strong className={styles.ordersStatValue}>{totalPagos}</strong>
    <span className={styles.ordersStatHint}>Pagamentos confirmados</span>
  </div>

  <div className={styles.ordersStat}>
    <span className={styles.ordersStatLabel}>Cancelados</span>
    <strong className={styles.ordersStatValue}>{totalCancelados}</strong>
    <span className={styles.ordersStatHint}>Pedidos cancelados</span>
  </div>
</section>

<section className={styles.ordersToolbar}>
  <div className={styles.ordersToolbarText}>
    <h3>Lista de pedidos</h3>
    <p>
      {pedidosFiltrados.length} de {pedidos.length} pedido(s) exibidos
    </p>
  </div>

  <div className={styles.ordersSearch}>
    <input
      type="search"
      className={styles.fc}
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
      placeholder="Buscar pedido, cliente ou e-mail..."
      aria-label="Buscar pedidos"
    />
  </div>
</section>

      {erroStatus && (
  <div role="alert" className={styles.ordersError}>
          {erroStatus}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.tw}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--muted)",
                    }}
                  >
                    {busca
                      ? "Nenhum pedido corresponde à busca."
                      : "Ainda não há pedidos cadastrados."}
                  </td>
                </tr>
              )}

              {pedidosFiltrados.map((p) => {
                const cliente = infoUsuario[p.usuario_id];
                const salvando = salvandoId === p.id;

                return (
                  <tr key={p.id}>
                    <td>
                      <strong>#{p.id}</strong>
                    </td>

                    <td>
                      <div style={{ fontWeight: 650 }}>
                        {cliente?.nome ?? "Cliente não identificado"}
                      </div>
                      <div
                        style={{
                          marginTop: ".2rem",
                          fontSize: ".75rem",
                          color: "var(--muted)",
                        }}
                      >
                        {cliente?.email ?? ""}
                      </div>
                    </td>

                    <td
                      style={{
                        fontWeight: 750,
                        color: "var(--p700)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatarMoeda(p.total)}
                    </td>

                    <td>
                      <span
                        className={styles.badge}
                        style={badgeStyle[p.status] ?? badgeStyle.pendente}
                      >
                        {statusLabel[p.status] ?? p.status}
                      </span>
                    </td>

                    <td
                      style={{
                        fontSize: ".8rem",
                        color: "var(--muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(p.criado_em).toLocaleString("pt-BR")}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: ".4rem",
                          alignItems: "center",
                        }}
                      >
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                          onClick={() => ver(p.id)}
                        >
                          Ver detalhes
                        </button>

                        <select
                          aria-label={`Status do pedido ${p.id}`}
                          className={styles.fc}
                          style={{
                            padding: ".35rem .45rem",
                            fontSize: ".78rem",
                            width: "auto",
                            minWidth: "120px",
                          }}
                          value={p.status}
                          disabled={salvando}
                          onChange={(e) =>
                            mudarStatus(
                              p.id,
                              e.target.value as StatusPedido
                            )
                          }
                        >
                          <option value="pendente">Pendente</option>
                          <option value="pago">Pago</option>
                          <option value="cancelado">Cancelado</option>
                        </select>

                        {salvando && (
                          <span
                            style={{
                              color: "var(--muted)",
                              fontSize: ".72rem",
                            }}
                          >
                            Salvando...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {aberto !== null && (
        <div
          className={styles.overlay}
          onClick={() => {
            setAberto(null);
            setDetalhe(null);
          }}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <h3>Detalhes do pedido #{aberto}</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setAberto(null);
                  setDetalhe(null);
                }}
                aria-label="Fechar detalhes"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody} style={{ gap: ".5rem" }}>
              {carregandoDetalhe || !detalhe ? (
                <p style={{ color: "var(--muted)" }}>
                  Carregando detalhes...
                </p>
              ) : "erro" in detalhe ? (
                <p role="alert" style={{ color: "#b91c1c" }}>
                  {detalhe.erro}
                </p>
              ) : (
                <>
                  {detalhe.itens.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                        padding: ".75rem 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: ".9rem" }}>
                          {item.nome}
                        </strong>
                        <div
                          style={{
                            marginTop: ".2rem",
                            fontSize: ".78rem",
                            color: "var(--muted)",
                          }}
                        >
                          Quantidade: {item.quantidade}
                        </div>
                      </div>

                      <span
                        style={{
                          fontWeight: 750,
                          color: "var(--p700)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatarMoeda(
                          item.preco_unitario * item.quantidade
                        )}
                      </span>
                    </div>
                  ))}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      paddingTop: ".8rem",
                    }}
                  >
                    <span>Total do pedido</span>
                    <span style={{ color: "var(--p700)" }}>
                      {formatarMoeda(detalhe.total)}
                    </span>
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
