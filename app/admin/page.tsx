
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./admin.module.css";

const badgeStyle: Record<string, { background: string; color: string }> = {
  pendente: { background: "#fff7ed", color: "#c2410c" },
  pago: { background: "#f0fdf4", color: "#166534" },
  cancelado: { background: "#fef2f2", color: "#991b1b" },
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const agora = new Date().toISOString();
  
const { data: registroConfiguracao } = await supabase
  .from("petsister_configuracoes")
  .select("configuracoes")
  .eq("id", "global")
  .maybeSingle();

const configuracoes =
  registroConfiguracao?.configuracoes &&
  typeof registroConfiguracao.configuracoes === "object" &&
  !Array.isArray(registroConfiguracao.configuracoes)
    ? registroConfiguracao.configuracoes as Record<string, unknown>
    : {};

const valorLimite = Number(
  configuracoes.estoque_limite_baixo ?? 8
);

const limiteEstoqueBaixo =
  Number.isInteger(valorLimite) &&
  valorLimite >= 0 &&
  valorLimite <= 10000
    ? valorLimite
    : 8;


  const [
    { count: clientes },
    { count: produtos },
    { count: pedidosTotal },
    { data: pagos },
    { count: agends },
    { count: pedidosPendentes },
    { count: estoqueBaixoTotal },
    { count: produtosEsgotados },
    { data: produtosBaixo },
  ] = await Promise.all([
    supabase
      .from("petsister_profiles")
      .select("*", { count: "exact", head: true })
      .eq("perfil", "cliente"),

    supabase
      .from("petsister_produtos")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("petsister_pedidos")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("petsister_pedidos")
      .select("total")
      .eq("status", "pago"),

    supabase
      .from("petsister_agendamentos")
      .select("*", { count: "exact", head: true })
      .eq("status", "agendado")
      .gte("data_hora", agora),

    supabase
      .from("petsister_pedidos")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendente"),

    supabase
      .from("petsister_produtos")
      .select("*", { count: "exact", head: true })
     .lte("estoque", limiteEstoqueBaixo),

    supabase
      .from("petsister_produtos")
      .select("*", { count: "exact", head: true })
      .lte("estoque", 0),

    supabase
      .from("petsister_produtos")
      .select("id,nome,estoque,categoria")
      .lte("estoque", limiteEstoqueBaixo)
      .order("estoque", { ascending: true })
      .limit(5),
  ]);

  const receita = (pagos ?? []).reduce(
    (s, p) => s + Number(p.total ?? 0),
    0
  );

  const { data: recentesPedidos } = await supabase
    .from("petsister_pedidos")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(6);

  const { data: proxAgendamentos } = await supabase
    .from("petsister_agendamentos")
    .select("*")
    .eq("status", "agendado")
    .gte("data_hora", agora)
    .order("data_hora", { ascending: true })
    .limit(6);

  const idsUsuarios = [
    ...new Set([
      ...(recentesPedidos ?? []).map((p) => p.usuario_id),
      ...(proxAgendamentos ?? []).map((a) => a.usuario_id),
    ]),
  ];

  const { data: perfis } = idsUsuarios.length
    ? await supabase
        .from("petsister_profiles")
        .select("id,nome")
        .in("id", idsUsuarios)
    : { data: [] };

  const nomeDe = (id: string) =>
    perfis?.find((p) => p.id === id)?.nome ?? "—";

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className={styles.topbar}>
        <div>
          <h2>Dashboard</h2>
          <span className={styles.dashboardDate}>{dataHoje}</span>
        </div>
        <Link href="/" className={styles.dashboardStoreLink}>
          Ver loja ↗
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.dashboardWelcome}>
          <div>
            <span className={styles.attentionEyebrow}>
              PAINEL DE GESTÃO
            </span>
            <h1>Visão geral da PetSister</h1>
            <p>
              Acompanhe as vendas, os produtos e os atendimentos da sua loja.
            </p>
          </div>
          <div className={styles.welcomePaw} aria-hidden="true">
            🐾
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcP}`}>👥</div>
            <div>
              <div className={styles.statNum}>{clientes ?? 0}</div>
              <div className={styles.statLbl}>Clientes cadastrados</div>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcG}`}>📦</div>
            <div>
              <div className={styles.statNum}>{produtos ?? 0}</div>
              <div className={styles.statLbl}>Produtos cadastrados</div>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcO}`}>🛒</div>
            <div>
              <div className={styles.statNum}>{pedidosTotal ?? 0}</div>
              <div className={styles.statLbl}>Pedidos totais</div>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcB}`}>💰</div>
            <div>
              <div className={styles.statNum} style={{ fontSize: "1.25rem" }}>
                {receita.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div className={styles.statLbl}>Total de pedidos pagos</div>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcP}`}>📅</div>
            <div>
              <div className={styles.statNum}>{agends ?? 0}</div>
              <div className={styles.statLbl}>Agendamentos futuros</div>
            </div>
          </div>
        </div>

        <section className={styles.attentionSection}>
          <div className={styles.attentionHeading}>
            <div>
              <span className={styles.attentionEyebrow}>
                GESTÃO DO DIA
              </span>
              <h3>Central de atenção PetSister</h3>
              <p>
                Pendências e avisos para ajudar você a manter a loja em dia.
              </p>
            </div>
          </div>

          <div className={styles.attentionGrid}>
            <article className={styles.attentionCard}>
              <div className={styles.attentionCardTop}>
                <span
                  className={`${styles.attentionIcon} ${styles.attentionIconOrange}`}
                >
                  🛒
                </span>
                <span className={styles.attentionCount}>
                  {pedidosPendentes ?? 0}
                </span>
              </div>

              <h4>Pedidos pendentes</h4>
              <p>
                {(pedidosPendentes ?? 0) > 0
                  ? "Existem pedidos aguardando conferência."
                  : "Nenhum pedido está marcado como pendente."}
              </p>

              <Link href="/admin/pedidos" className={styles.attentionLink}>
                Conferir pedidos <span aria-hidden="true">→</span>
              </Link>
            </article>

            <article className={styles.attentionCard}>
              <div className={styles.attentionCardTop}>
                <span
                  className={`${styles.attentionIcon} ${styles.attentionIconBlue}`}
                >
                  📦
                </span>
                <span className={styles.attentionCount}>
                  {estoqueBaixoTotal ?? 0}
                </span>
              </div>

              <h4>Estoque para acompanhar</h4>
              <p>
                {(produtosEsgotados ?? 0) > 0
                  ? `${produtosEsgotados} produto(s) sem estoque.`
                  : "Nenhum produto está com estoque zerado."}
                {" "}
                {limiteEstoqueBaixo === 0
  ? "O alerta considera produtos sem estoque."
  : `O alerta considera ${limiteEstoqueBaixo} unidades ou menos.`}
              </p>

              {(produtosBaixo ?? []).length > 0 && (
                <div className={styles.attentionStockList}>
                  {(produtosBaixo ?? []).map((item) => (
                    <div className={styles.attentionStockRow} key={item.id}>
                      <span className={styles.attentionStockName}>
                        {item.nome}
                      </span>
                      <span
                        className={
                          item.estoque <= 0
                            ? styles.attentionQtyCritical
                            : styles.attentionQty
                        }
                      >
                        {item.estoque <= 0
                          ? "Esgotado"
                          : `${item.estoque} un.`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Link href="/admin/produtos" className={styles.attentionLink}>
                Gerenciar produtos <span aria-hidden="true">→</span>
              </Link>
            </article>

            <article className={styles.attentionCard}>
              <div className={styles.attentionCardTop}>
                <span
                  className={`${styles.attentionIcon} ${styles.attentionIconBlue}`}
                >
                  📅
                </span>
                <span className={styles.attentionCount}>
                  {agends ?? 0}
                </span>
              </div>

              <h4>Próximos atendimentos</h4>
              <p>
                {(agends ?? 0) > 0
                  ? "Confira os horários futuros e prepare os atendimentos."
                  : "Não há agendamentos futuros com status agendado."}
              </p>

              <Link
                href="/admin/agendamentos"
                className={styles.attentionLink}
              >
                Abrir agenda <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </section>

        <div className={styles.grid2}>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h3>Pedidos recentes</h3>
              <Link
                href="/admin/pedidos"
                className={styles.dashboardTableLink}
              >
                Ver todos →
              </Link>
            </div>

            <div className={styles.tw}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentesPedidos ?? []).length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className={styles.dashboardEmpty}
                      >
                        Ainda não há pedidos cadastrados.
                      </td>
                    </tr>
                  )}

                  {(recentesPedidos ?? []).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>#{p.id}</strong>
                      </td>
                      <td>{nomeDe(p.usuario_id)}</td>
                      <td className={styles.dashboardMoney}>
                        {Number(p.total).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td>
                        <span
                          className={styles.badge}
                          style={badgeStyle[p.status] ?? badgeStyle.pendente}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h3>Próximos agendamentos</h3>
              <Link
                href="/admin/agendamentos"
                className={styles.dashboardTableLink}
              >
                Ver todos →
              </Link>
            </div>

            <div className={styles.tw}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {(proxAgendamentos ?? []).length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className={styles.dashboardEmpty}
                      >
                        Nenhum agendamento futuro pendente.
                      </td>
                    </tr>
                  )}

                  {(proxAgendamentos ?? []).map((a) => (
                    <tr key={a.id}>
                      <td>{nomeDe(a.usuario_id)}</td>
                      <td>{a.servico}</td>
                      <td className={styles.dashboardDateCell}>
                        {new Date(a.data_hora).toLocaleDateString("pt-BR")}{" "}
                        {new Date(a.data_hora).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
