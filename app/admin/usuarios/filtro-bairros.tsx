
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
    () => [...new Set(bairros.map((item) => item.zona))].sort(),
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
          padding: "1rem",
          marginBottom: "1rem",
          border: "1.5px solid #eadfd2",
          borderRadius: "14px",
          background: "#fff",
        }}
      >
        <label
          htmlFor="filtro-zona"
          style={{
            display: "block",
            marginBottom: ".4rem",
            color: "#64748b",
            fontSize: ".75rem",
            fontWeight: 700,
          }}
        >
          FILTRAR POR ZONA
        </label>

        <select
          id="filtro-zona"
          value={zonaSelecionada}
          onChange={(e) => setZonaSelecionada(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "360px",
            padding: ".7rem",
            border: "1.5px solid #eadfd2",
            borderRadius: "8px",
            background: "#fff",
            color: "#0f1e4a",
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
                  <td>{r.zona}</td>
                  <td style={{ fontWeight: 700 }}>{r.bairro}</td>
                  <td>{Number(r.clientes)}</td>
                  <td>{Number(r.pedidos_pagos)}</td>
                  <td style={{ color: "var(--p700)", fontWeight: 750 }}>
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
