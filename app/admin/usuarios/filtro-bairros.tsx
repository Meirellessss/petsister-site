
"use client";

import { useMemo, useState } from "react";
import styles from "../admin.module.css";

interface BairroRow {
  zona: string;
  bairro: string;
  clientes: number | string;
  pedidos_pagos: number | string;
  faturamento_pago: number | string;
}

interface ResumoZona {
  zona: string;
  clientes: number;
  pedidos_pagos: number;
  faturamento_pago: number;
}

function moeda(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function FiltroBairros({
  bairros,
  clientesSemBairro,
}: {
  bairros: BairroRow[];
  clientesSemBairro: number;
}) {
  const [zonaSelecionada, setZonaSelecionada] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState("faturamento");

  const resumoPorZona = useMemo(() => {
    const agrupado = new Map<string, ResumoZona>();

    bairros.forEach((item) => {
      const zona = item.zona || "Localização não informada";

      const atual = agrupado.get(zona) ?? {
        zona,
        clientes: 0,
        pedidos_pagos: 0,
        faturamento_pago: 0,
      };

      atual.clientes += Number(item.clientes || 0);
      atual.pedidos_pagos += Number(item.pedidos_pagos || 0);
      atual.faturamento_pago += Number(item.faturamento_pago || 0);

      agrupado.set(zona, atual);
    });

    return Array.from(agrupado.values()).sort(
      (a, b) => b.faturamento_pago - a.faturamento_pago
    );
  }, [bairros]);

  const zonas = useMemo(
    () => [...new Set(bairros.map((item) => item.zona))].sort(),
    [bairros]
  );

  const totalFaturamento = resumoPorZona.reduce(
    (total, item) => total + item.faturamento_pago,
    0
  );

  const totalClientes = resumoPorZona.reduce(
    (total, item) => total + item.clientes,
    0
  );

  const zonasIdentificadas = resumoPorZona.filter(
    (item) => item.zona !== "Localização não informada"
  );

  const maiorFaturamento = [...zonasIdentificadas].sort(
    (a, b) => b.faturamento_pago - a.faturamento_pago
  )[0];

  const maiorQuantidadeClientes = [...zonasIdentificadas].sort(
    (a, b) => b.clientes - a.clientes
  )[0];

  const bairrosFiltrados = useMemo(() => {
    const resultado =
      zonaSelecionada === "Todas"
        ? [...bairros]
        : bairros.filter((item) => item.zona === zonaSelecionada);

    return resultado.sort((a, b) => {
      switch (ordenacao) {
        case "clientes":
          return (
            Number(b.clientes) - Number(a.clientes) ||
            a.bairro.localeCompare(b.bairro, "pt-BR")
          );

        case "pedidos":
          return (
            Number(b.pedidos_pagos) - Number(a.pedidos_pagos) ||
            a.bairro.localeCompare(b.bairro, "pt-BR")
          );

        case "bairro":
          return a.bairro.localeCompare(b.bairro, "pt-BR");

        default:
          return (
            Number(b.faturamento_pago) -
              Number(a.faturamento_pago) ||
            a.bairro.localeCompare(b.bairro, "pt-BR")
          );
      }
    });
  }, [bairros, zonaSelecionada, ordenacao]);

  return (
    <>
      {/* PAINEL DE DESEMPENHO REGIONAL */}
      <section
        style={{
          marginBottom: 24,
          border: "1px solid #eadfd2",
          borderRadius: 16,
          background: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 5px 20px rgba(15, 30, 74, 0.045)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            background: "#fffaf6",
            borderBottom: "1px solid #f0e3da",
          }}
        >
          <div
            style={{
              color: "#e76b32",
              fontSize: 10,
              fontWeight: 850,
              letterSpacing: 1.4,
            }}
          >
            INTELIGÊNCIA COMERCIAL
          </div>

          <h2
            style={{
              margin: "5px 0",
              color: "#10204b",
              fontSize: 19,
              fontWeight: 850,
            }}
          >
            Desempenho por região
          </h2>

          <p
            style={{
              margin: 0,
              color: "#718096",
              fontSize: 12,
            }}
          >
            Acompanhe as vendas e descubra quais regiões concentram seus clientes.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 24,
            padding: 24,
          }}
        >
          {/* GRÁFICO */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 22,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#10204b",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Faturamento por zona
              </h3>

              <span style={{ color: "#8993a5", fontSize: 10 }}>
                Distribuição das vendas
              </span>
            </div>

            {resumoPorZona.length === 0 ? (
              <p style={{ color: "#718096", fontSize: 13 }}>
                Ainda não existem dados regionais.
              </p>
            ) : (
              resumoPorZona.map((item) => {
                const percentual =
                  totalFaturamento > 0
                    ? (item.faturamento_pago / totalFaturamento) * 100
                    : 0;

                const largura =
                  Math.max(0, Math.min(percentual, 100));

                const semLocalizacao =
                  item.zona === "Localização não informada";

                return (
                  <div key={item.zona} style={{ marginBottom: 23 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <strong
                        style={{
                          color: "#263653",
                          fontSize: 12,
                        }}
                      >
                        {item.zona}
                      </strong>

                      <strong
                        style={{
                          color: "#c64d2e",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {moeda(item.faturamento_pago)}
                      </strong>
                    </div>

                    <div
                      style={{
                        height: 11,
                        borderRadius: 20,
                        background: "#f1ede9",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${largura}%`,
                          borderRadius: 20,
                          background: semLocalizacao
                            ? "#a9b2c1"
                            : "linear-gradient(90deg, #f3a05e, #e65b2f)",
                          transition: "width .3s ease",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 5,
                        color: "#8993a5",
                        fontSize: 10,
                      }}
                    >
                      <span>
                        {item.clientes} clientes · {item.pedidos_pagos} pedidos
                      </span>

                      <span>
                        {percentual.toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        })}
                        %
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESTAQUES */}
          <div
            style={{
              padding: 19,
              border: "1px solid #eee5df",
              borderRadius: 13,
              background: "#fffdfb",
            }}
          >
            <h3
              style={{
                margin: "0 0 17px",
                color: "#10204b",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Destaques regionais
            </h3>

            <div
              style={{
                padding: 15,
                borderRadius: 11,
                background: "#fff1e9",
                marginBottom: 13,
              }}
            >
              <div style={{ color: "#a35b35", fontSize: 11 }}>
                Faturamento total analisado
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 5,
                  color: "#10204b",
                  fontSize: 23,
                  fontWeight: 850,
                }}
              >
                {moeda(totalFaturamento)}
              </strong>
            </div>

            <div
              style={{
                padding: "13px 0",
                borderBottom: "1px solid #eee5df",
              }}
            >
              <div style={{ color: "#8993a5", fontSize: 11 }}>
                Maior faturamento
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 5,
                  color: "#10204b",
                  fontSize: 15,
                }}
              >
                {maiorFaturamento?.zona || "Sem dados"}
              </strong>

              <span style={{ color: "#718096", fontSize: 11 }}>
                {maiorFaturamento
                  ? moeda(maiorFaturamento.faturamento_pago)
                  : "Nenhuma venda localizada"}
              </span>
            </div>

            <div
              style={{
                padding: "13px 0",
                borderBottom: "1px solid #eee5df",
              }}
            >
              <div style={{ color: "#8993a5", fontSize: 11 }}>
                Região com mais clientes
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 5,
                  color: "#10204b",
                  fontSize: 15,
                }}
              >
                {maiorQuantidadeClientes?.zona || "Sem dados"}
              </strong>

              <span style={{ color: "#718096", fontSize: 11 }}>
                {maiorQuantidadeClientes
                  ? `${maiorQuantidadeClientes.clientes} clientes`
                  : "Nenhum cliente localizado"}
              </span>
            </div>

            <div style={{ paddingTop: 13 }}>
              <div style={{ color: "#8993a5", fontSize: 11 }}>
                Clientes analisados
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 4,
                  color: "#10204b",
                  fontSize: 20,
                }}
              >
                {totalClientes}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* RANKING DE BAIRROS */}
      <section
        className={styles.card}
        style={{ marginBottom: 24 }}
      >
        <div className={styles.cardHead}>
          <div>
            <h3>Ranking de bairros</h3>
            <span
              style={{
                display: "block",
                marginTop: 4,
                color: "#8993a5",
                fontSize: 11,
              }}
            >
              Compare o desempenho comercial de cada bairro.
            </span>
          </div>

          <span
            style={{
              color: "#e76b32",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {bairrosFiltrados.length} localidades
          </span>
        </div>

        <div
          className={styles.productAdminFilters}
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            margin: "16px 20px",
          }}
        >
          <select
            className={styles.fc}
            aria-label="Filtrar por zona"
            value={zonaSelecionada}
            onChange={(e) => setZonaSelecionada(e.target.value)}
          >
            <option value="Todas">Todas as zonas</option>

            {zonas.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </select>

          <select
            className={styles.fc}
            aria-label="Ordenar ranking"
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
          >
            <option value="faturamento">Maior faturamento</option>
            <option value="clientes">Mais clientes</option>
            <option value="pedidos">Mais pedidos pagos</option>
            <option value="bairro">Bairro (A–Z)</option>
          </select>
        </div>

        <div className={styles.tw}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Zona</th>
                <th>Bairro</th>
                <th>Clientes</th>
                <th>Pedidos pagos</th>
                <th>Faturamento</th>
              </tr>
            </thead>

            <tbody>
              {bairrosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#8993a5",
                    }}
                  >
                    Nenhum bairro encontrado.
                  </td>
                </tr>
              ) : (
                bairrosFiltrados.map((item) => (
                  <tr key={`${item.zona}-${item.bairro}`}>
                    <td>
                      <span
                        className={styles.badge}
                        style={{
                          background:
                            item.zona === "Localização não informada"
                              ? "#f0f1f3"
                              : "#fff0e7",
                          color:
                            item.zona === "Localização não informada"
                              ? "#687386"
                              : "#b94b13",
                        }}
                      >
                        {item.zona}
                      </span>
                    </td>

                    <td style={{ fontWeight: 700, color: "#10204b" }}>
                      {item.bairro}
                    </td>

                    <td>{Number(item.clientes)}</td>
                    <td>{Number(item.pedidos_pagos)}</td>

                    <td style={{ color: "#c64d2e", fontWeight: 800 }}>
                      {moeda(Number(item.faturamento_pago))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            color: "#718096",
            fontSize: 11,
          }}
        >
          <span>
            Clientes sem bairro identificado:{" "}
            <strong style={{ color: "#10204b" }}>
              {clientesSemBairro}
            </strong>
          </span>

          <span>
            Faturamento regional:{" "}
            <strong style={{ color: "#c64d2e" }}>
              {moeda(totalFaturamento)}
            </strong>
          </span>
        </div>
      </section>
    </>
  );
}
