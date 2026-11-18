import FiltroBairros from "./filtro-bairros";
import { createClient } from "@/lib/supabase/server";
import type { AdminUsuarioRow } from "@/lib/types";
import styles from "../admin.module.css";

interface AdminBairroRow {
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

export default async function UsuariosAdminPage() {
  const supabase = await createClient();

  const [
    { data: usuarios },
    { data: bairros, error: erroBairros },
  ] = await Promise.all([
    supabase.rpc("petsister_admin_usuarios"),
    supabase.rpc("petsister_admin_bairros"),
  ]);

  const lista = (usuarios ?? []) as AdminUsuarioRow[];
  const listaBairros = (bairros ?? []) as AdminBairroRow[];

  const totalClientes = listaBairros.reduce(
    (s, r) => s + Number(r.clientes || 0),
    0
  );

  const clientesSemBairro = listaBairros
    .filter(
      (r) =>
        r.zona === "Localização não informada" ||
        r.bairro === "Bairro não informado" ||
        r.bairro === "Endereço incompleto"
    )
    .reduce((s, r) => s + Number(r.clientes || 0), 0);

  const totalPedidosPagos = listaBairros.reduce(
    (s, r) => s + Number(r.pedidos_pagos || 0),
    0
  );

  const faturamentoRegional = listaBairros.reduce(
    (s, r) => s + Number(r.faturamento_pago || 0),
    0
  );

  const bairrosIdentificados = listaBairros.filter(
    (r) =>
      r.zona !== "Localização não informada" &&
      r.bairro !== "Bairro não informado" &&
      r.bairro !== "Endereço incompleto"
  ).length;

  const resumoPorZona = Array.from(
  listaBairros.reduce(
    (acumulado, bairro) => {
      const zona = bairro.zona || "Localização não informada";

      const atual = acumulado.get(zona) ?? {
        zona,
        clientes: 0,
        pedidos_pagos: 0,
        faturamento_pago: 0,
      };

      atual.clientes += Number(bairro.clientes || 0);
      atual.pedidos_pagos += Number(bairro.pedidos_pagos || 0);
      atual.faturamento_pago += Number(bairro.faturamento_pago || 0);

      acumulado.set(zona, atual);
      return acumulado;
    },
    new Map<
      string,
      {
        zona: string;
        clientes: number;
        pedidos_pagos: number;
        faturamento_pago: number;
      }
    >()
  ).values()
).sort(
  (a, b) => b.faturamento_pago - a.faturamento_pago
);

  return (
    <>
      <div className={styles.topbar}>
        <h2>Clientes e regiões</h2>
        <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>
          {lista.length} usuários cadastrados
        </span>
      </div>

      <div className={styles.content}>
        <div style={{ marginBottom: "1.4rem" }}>
          <span
            style={{
              color: "var(--p600)",
              fontSize: ".7rem",
              fontWeight: 800,
              letterSpacing: ".12em",
            }}
          >
            INTELIGÊNCIA COMERCIAL
          </span>

          <h1
            style={{
              marginTop: ".4rem",
              color: "var(--ink)",
              fontSize: "1.5rem",
              fontWeight: 850,
            }}
          >
            Clientes e vendas por bairro
          </h1>

          <p
            style={{
              marginTop: ".45rem",
              color: "var(--muted)",
              fontSize: ".88rem",
            }}
          >
            Veja onde estão seus clientes no município do Rio de Janeiro
            e quais bairros mais compram.
          </p>
        </div>

        {erroBairros ? (
          <div
            className={styles.card}
            style={{
              padding: "1.2rem",
              marginBottom: "1.2rem",
              color: "#991b1b",
              background: "#fef2f2",
            }}
          >
            Não foi possível carregar o relatório por bairro.
            <p style={{ marginTop: ".5rem", fontSize: ".82rem" }}>
              {erroBairros.message}
            </p>
            Confira a função petsister_admin_bairros e suas permissões
            no Supabase.
          </div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statIc + " " + styles.statIcP}>
                  👥
                </div>
                <div>
                  <div className={styles.statNum}>{totalClientes}</div>
                  <div className={styles.statLbl}>Clientes analisados</div>
                </div>
              </div>

              <div className={styles.stat}>
                <div className={styles.statIc + " " + styles.statIcO}>
                  📍
                </div>
                <div>
                  <div className={styles.statNum}>
                    {bairrosIdentificados}
                  </div>
                  <div className={styles.statLbl}>Bairros identificados</div>
                </div>
              </div>

              <div className={styles.stat}>
                <div className={styles.statIc + " " + styles.statIcB}>
                  🛒
                </div>
                <div>
                  <div className={styles.statNum}>{totalPedidosPagos}</div>
                  <div className={styles.statLbl}>Pedidos pagos</div>
                </div>
              </div>

              <div className={styles.stat}>
                <div className={styles.statIc + " " + styles.statIcG}>
                  💰
                </div>
                <div>
                  <div
                    className={styles.statNum}
                    style={{ fontSize: "1.25rem" }}
                  >
                    {moeda(faturamentoRegional)}
                  </div>
                  <div className={styles.statLbl}>Faturamento regional</div>
                </div>
              </div>
            </div>

            <div className={styles.card} style={{ marginBottom: "1.2rem" }}>
              <div className={styles.cardHead}>
                <h3>Ranking de bairros</h3>
                <div className={styles.card} style={{ marginBottom: "1.2rem" }}>
  <div className={styles.cardHead}>
    <h3>Resumo por zona</h3>
    <span style={{ color: "var(--muted)", fontSize: ".78rem" }}>
      Comparativo de clientes e vendas
    </span>
  </div>

  <div className={styles.tw}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Zona</th>
          <th>Clientes</th>
          <th>Pedidos pagos</th>
          <th>Faturamento</th>
        </tr>
      </thead>

      <tbody>
        {resumoPorZona.map((r) => (
          <tr key={r.zona}>
            <td style={{ fontWeight: 700 }}>
              {r.zona}
            </td>
            <td>{r.clientes}</td>
            <td>{r.pedidos_pagos}</td>
            <td style={{ color: "#c83b2d", fontWeight: 750 }}>
              {moeda(r.faturamento_pago)}
            </td>
          </tr>
        ))}

        {resumoPorZona.length === 0 && (
          <tr>
            <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
              Nenhuma região encontrada.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
                <span style={{ color: "var(--muted)", fontSize: ".78rem" }}>
                 Escolha como deseja ordenar o ranking
                </span>
              </div>

              <FiltroBairros bairros={listaBairros} />

              <div
                style={{
                  padding: "1rem",
                  borderTop: "1px solid var(--border)",
                  color: "var(--muted)",
                  fontSize: ".8rem",
                }}
              >
                Clientes sem bairro identificado:{" "}
                <strong style={{ color: "var(--ink)" }}>
                  {clientesSemBairro}
                </strong>
              </div>
            </div>
          </>
        )}

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3>Todos os clientes cadastrados</h3>
          </div>

          <div className={styles.tw}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Pedidos</th>
                  <th>Total gasto</th>
                  <th>Cadastro</th>
                </tr>
              </thead>

              <tbody>
                {lista.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".6rem",
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background:
                              u.perfil === "admin"
                                ? "var(--p600)"
                                : "var(--p100)",
                            color:
                              u.perfil === "admin" ? "#fff" : "var(--p700)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: ".75rem",
                          }}
                        >
                          {(u.nome || "?").charAt(0).toUpperCase()}
                        </div>

                        <span style={{ fontWeight: 600 }}>
                          {u.nome || "—"}
                        </span>
                      </div>
                    </td>

                    <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                      {u.email}
                    </td>

                    <td>
                      <span
                        className={styles.badge}
                        style={
                          u.perfil === "admin"
                            ? { background: "var(--p100)", color: "var(--p700)" }
                            : { background: "#f3f4f6", color: "#6b7280" }
                        }
                      >
                        {u.perfil}
                      </span>
                    </td>

                    <td>{u.total_pedidos}</td>

                    <td style={{ fontWeight: 700, color: "var(--p700)" }}>
                      {moeda(Number(u.total_gasto))}
                    </td>

                    <td style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                      {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}

                {lista.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
