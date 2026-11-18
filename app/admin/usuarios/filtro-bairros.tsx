
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

function moeda(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function FiltroBairros({
  bairros,
}: {
  bairros: BairroRow[];
}) {
  const [zonaSelecionada, setZonaSelecionada] = useState("Todas");

  const zonas = useMemo(
    () =>
      [...new Set(bairros.map((item) => item.zona))]
        .filter((zona) => zona !== "Localização não informada")
        .sort(),
    [bairros]
  );

  const bairrosFiltrados = useMemo(
    () =>
      zonaSelecionada === "Todas"
        ? bairros
        : bairros.filter((item) => item.zona === zonaSelecionada),
    [bairros, zonaSelecionada]
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: ".8rem",
          padding: "1rem 1.2rem",
          background: "#fffaf6",
          borderBottom: "1px solid #f1dfd4",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              color: "#0f1e4a",
              fontSize: ".85rem",
            }}
          >
            Visualizar por região
          </strong>
          <span style={{ color: "#7b8497", fontSize: ".75rem" }}>
            Selecione uma zona para filtrar os bairros
          </span>
        </div>

        <select
          aria-label="Filtrar bairros por zona"
          value={zonaSelecionada}
          onChange={(e) => setZonaSelecionada(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "250px",
            padding: ".65rem 2.2rem .65rem .85rem",
            border: "1px solid #eadfd2",
            borderRadius: "9px",
            background: "#fff",
            color: "#0f1e4a",
            fontSize: ".83rem",
            fontWeight: 600,
            outlineColor: "#ea580c",
            cursor: "pointer",
          }}
        >
          <option value="Todas">Todas as zonas</option>
          {zonas.map((zona) => (
            <option key={zona} value={zona}>
              {zona}
            </option>
          ))}
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
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                  Nenhum bairro encontrado.
                </td>
              </tr>
            ) : (
              bairrosFiltrados.map((r) => (
                <tr key={`${r.zona}-${r.bairro}`}>
                  <td>
                    <span
                      className={styles.badge}
                      style={{
                        background: "#fff0e7",
                        color: "#b94b13",
                      }}
                    >
                      {r.zona}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "#0f1e4a" }}>
                    {r.bairro}
                  </td>
                  <td>{Number(r.clientes)}</td>
                  <td>{Number(r.pedidos_pagos)}</td>
                  <td style={{ color: "#c83b2d", fontWeight: 750 }}>
                    {moeda(Number(r.faturamento_pago))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
