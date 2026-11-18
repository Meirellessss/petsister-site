
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
    { data: usuarios, error: erroUsuarios },
    { data: bairros, error: erroBairros },
  ] = await Promise.all([
    supabase.rpc("petsister_admin_usuarios"),
    supabase.rpc("petsister_admin_bairros"),
  ]);

  const lista = (usuarios ?? []) as AdminUsuarioRow[];
  const listaBairros = (bairros ?? []) as AdminBairroRow[];

  const totalClientes = listaBairros.reduce(
    (total, item) => total + Number(item.clientes || 0),
    0
  );

  const clientesSemBairro = listaBairros
    .filter(
      (item) =>
        item.zona === "Localização não informada" ||
        item.bairro === "Bairro não informado" ||
        item.bairro === "Endereço incompleto"
    )
    .reduce(
      (total, item) => total + Number(item.clientes || 0),
      0
    );

  const totalPedidosPagos = listaBairros.reduce(
    (total, item) => total + Number(item.pedidos_pagos || 0),
    0
  );

  const faturamentoRegional = listaBairros.reduce(
    (total, item) => total + Number(item.faturamento_pago || 0),
    0
  );

  const bairrosIdentificados = listaBairros.filter(
    (item) =>
      item.zona !== "Localização não informada" &&
      item.bairro !== "Bairro não informado" &&
      item.bairro !== "Endereço incompleto"
  ).length;

  return (
    <>
      <div className={styles.topbar}>
        <h2>Clientes e regiões</h2>

        <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>
          {lista.length} usuários cadastrados
        </span>
      </div>

      <main className={styles.content}>
        <div style={{ marginBottom: 26 }}>
          <span
            style={{
              color: "#e76b32",
              fontSize: ".7rem",
              fontWeight: 850,
              letterSpacing: ".13em",
            }}
          >
            INTELIGÊNCIA COMERCIAL
          </span>

          <h1
            style={{
              marginTop: ".4rem",
              color: "#10204b",
              fontSize: "1.55rem",
              fontWeight: 850,
            }}
          >
            Clientes e vendas por região
          </h1>

          <p
            style={{
              marginTop: ".45rem",
              color: "var(--muted)",
              fontSize: ".88rem",
            }}
          >
            Entenda onde estão seus clientes e quais bairros movimentam as vendas.
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
            Não foi possível carregar os dados regionais.

            <p style={{ marginTop: ".5rem", fontSize: ".82rem" }}>
              {erroBairros.message}
            </p>
          </div>
        ) : (
          <>
            {/* INDICADORES PRINCIPAIS */}
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statIc + " " + styles.statIcP}>
                  👥
                </div>

                <div>
                  <div className={styles.statNum}>{totalClientes}</div>
                  <div className={styles.statLbl}>
                    Clientes analisados
                  </div>
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
                  <div className={styles.statLbl}>
                    Bairros identificados
                  </div>
                </div>
              </div>

              <div className={styles.stat}>
                <div className={styles.statIc + " " + styles.statIcB}>
                  🛒
                </div>

                <div>
                  <div className={styles.statNum}>
                    {totalPedidosPagos}
                  </div>
                  <div className={styles.statLbl}>
                    Pedidos pagos
                  </div>
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

                  <div className={styles.statLbl}>
                    Faturamento regional
                  </div>
                </div>
              </div>
            </div>

            {/* GRÁFICO E RANKING */}
            <FiltroBairros
              bairros={listaBairros}
              clientesSemBairro={clientesSemBairro}
            />
          </>
        )}

        {/* TABELA DE CLIENTES */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3>Todos os clientes cadastrados</h3>
              <span
                style={{
                  display: "block",
                  color: "#8993a5",
                  fontSize: 11,
                  marginTop: 4,
                }}
              >
                Consulte os dados e o histórico de compras dos usuários.
              </span>
            </div>
          </div>

          {erroUsuarios ? (
            <div style={{ padding: 20, color: "#991b1b", fontSize: 13 }}>
              Não foi possível carregar a lista de clientes:{" "}
              {erroUsuarios.message}
            </div>
          ) : (
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
                  {lista.map((usuario) => (
                    <tr key={usuario.id}>
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
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background:
                                usuario.perfil === "admin"
                                  ? "var(--p600)"
                                  : "var(--p100)",
                              color:
                                usuario.perfil === "admin"
                                  ? "#fff"
                                  : "var(--p700)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: ".78rem",
                              flexShrink: 0,
                            }}
                          >
                            {(usuario.nome || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span style={{ fontWeight: 650 }}>
                            {usuario.nome || "—"}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{
                          fontSize: ".82rem",
                          color: "var(--muted)",
                        }}
                      >
                        {usuario.email}
                      </td>

                      <td>
                        <span
                          className={styles.badge}
                          style={
                            usuario.perfil === "admin"
                              ? {
                                  background: "var(--p100)",
                                  color: "var(--p700)",
                                }
                              : {
                                  background: "#f3f4f6",
                                  color: "#6b7280",
                                }
                          }
                        >
                          {usuario.perfil}
                        </span>
                      </td>

                      <td>{usuario.total_pedidos}</td>

                      <td
                        style={{
                          fontWeight: 750,
                          color: "var(--p700)",
                        }}
                      >
                        {moeda(Number(usuario.total_gasto))}
                      </td>

                      <td
                        style={{
                          fontSize: ".8rem",
                          color: "var(--muted)",
                        }}
                      >
                        {new Date(usuario.criado_em).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                    </tr>
                  ))}

                  {lista.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                        }}
                      >
                        Nenhum usuário cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
