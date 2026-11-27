
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminUsuarioRow,
  Pedido,
  Agendamento,
  Produto,
} from "@/lib/types";
import styles from "./admin.module.css";

interface BairroRow {
  zona: string;
  bairro: string;
  clientes: number | string;
  pedidos_pagos: number | string;
  faturamento_pago: number | string;
}

interface ProdutoDashboard {
  id: number;
  nome: string;
  estoque: number;
}

const ZONAS = [
  "Localização não informada",
  "Zona Oeste",
  "Zona Sudoeste",
  "Zona Sul",
  "Zona Norte",
  "Centro",
];

function moeda(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataHora(valor: string) {
  return new Date(valor).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dataCadastro(valor: string) {
  return new Date(valor).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { data: usuarios, error: erroUsuarios },
    { data: bairros, error: erroBairros },
    { data: pedidos, error: erroPedidos },
    { data: produtos, error: erroProdutos },
    { data: agendamentos, error: erroAgendamentos },
    { data: configuracao },
  ] = await Promise.all([
    supabase.rpc("petsister_admin_usuarios"),
    supabase.rpc("petsister_admin_bairros"),
    supabase
      .from("petsister_pedidos")
      .select("id, usuario_id, total, status, criado_em")
      .order("criado_em", { ascending: false }),
    supabase
      .from("petsister_produtos")
      .select("id, nome, estoque"),
    supabase
      .from("petsister_agendamentos")
      .select("id, usuario_id, servico, pet_nome, data_hora, status")
      .order("data_hora", { ascending: true }),
    supabase
      .from("petsister_configuracoes")
      .select("configuracoes")
      .eq("id", "global")
      .maybeSingle(),
  ]);

  const listaUsuarios = (usuarios ?? []) as AdminUsuarioRow[];
  const listaBairros = (bairros ?? []) as BairroRow[];
  const listaPedidos = (pedidos ?? []) as Pedido[];
  const listaProdutos = (produtos ?? []) as ProdutoDashboard[];
  const listaAgendamentos = (agendamentos ?? []) as Agendamento[];

  const clientes = listaUsuarios
    .filter((usuario) => usuario.perfil === "cliente")
    .sort(
      (a, b) =>
        new Date(b.criado_em).getTime() -
        new Date(a.criado_em).getTime()
    );

  const pedidosPagos = listaPedidos.filter(
    (pedido) => pedido.status === "pago"
  );

  const pedidosPendentes = listaPedidos.filter(
    (pedido) => pedido.status === "pendente"
  );

  const faturamento = pedidosPagos.reduce(
    (total, pedido) => total + Number(pedido.total || 0),
    0
  );

  const dadosConfiguracao =
    configuracao?.configuracoes &&
    typeof configuracao.configuracoes === "object" &&
    !Array.isArray(configuracao.configuracoes)
      ? configuracao.configuracoes as Record<string, unknown>
      : {};

  const limiteSalvo = Number(
    dadosConfiguracao.estoque_limite_baixo ?? 8
  );

  const limiteEstoque =
    Number.isInteger(limiteSalvo) && limiteSalvo >= 0
      ? limiteSalvo
      : 8;

  const estoqueBaixo = listaProdutos.filter(
    (produto) => Number(produto.estoque) <= limiteEstoque
  );

  const agora = Date.now();

  const hoje = new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  const agendamentosHoje = listaAgendamentos.filter(
    (item) =>
      item.status === "agendado" &&
      new Date(item.data_hora).toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }) === hoje
  );

  const proximosAgendamentos = listaAgendamentos
    .filter(
      (item) =>
        item.status === "agendado" &&
        new Date(item.data_hora).getTime() >= agora
    )
    .slice(0, 5);

  const nomesUsuarios = new Map(
    listaUsuarios.map((usuario) => [
      usuario.id,
      usuario.nome || "Cliente",
    ])
  );

  const resumoMap = new Map<
    string,
    {
      zona: string;
      clientes: number;
      pedidos_pagos: number;
      faturamento_pago: number;
    }
  >();

  ZONAS.forEach((zona) => {
    resumoMap.set(zona, {
      zona,
      clientes: 0,
      pedidos_pagos: 0,
      faturamento_pago: 0,
    });
  });

  listaBairros.forEach((item) => {
    const zona = item.zona || "Localização não informada";

    const atual = resumoMap.get(zona) ?? {
      zona,
      clientes: 0,
      pedidos_pagos: 0,
      faturamento_pago: 0,
    };

    atual.clientes += Number(item.clientes || 0);
    atual.pedidos_pagos += Number(item.pedidos_pagos || 0);
    atual.faturamento_pago += Number(item.faturamento_pago || 0);

    resumoMap.set(zona, atual);
  });

  const resumoRegioes = Array.from(resumoMap.values());

  const maiorFaturamento = [...resumoRegioes].sort(
    (a, b) => b.faturamento_pago - a.faturamento_pago
  )[0];

  const maiorQuantidadeClientes = [...resumoRegioes].sort(
    (a, b) => b.clientes - a.clientes
  )[0];

  const regioesComVenda = resumoRegioes.filter(
    (item) => item.faturamento_pago > 0
  );

  const totalRegional = resumoRegioes.reduce(
    (total, item) => total + item.faturamento_pago,
    0
  );

  const concentracao =
    totalRegional > 0 && maiorFaturamento
      ? (maiorFaturamento.faturamento_pago / totalRegional) * 100
      : 0;

  const valorMaximoGrafico = Math.max(
    ...resumoRegioes.map((item) => item.faturamento_pago),
    1
  );

  const rankingBairros = [...listaBairros]
    .sort(
      (a, b) =>
        Number(b.faturamento_pago) -
        Number(a.faturamento_pago)
    )
    .slice(0, 5);

  const clientesSemLocalizacao = listaBairros
    .filter(
      (item) =>
        item.zona === "Localização não informada"
    )
    .reduce(
      (total, item) => total + Number(item.clientes || 0),
      0
    );

  const erros = [
    erroUsuarios?.message,
    erroBairros?.message,
    erroPedidos?.message,
    erroProdutos?.message,
    erroAgendamentos?.message,
  ].filter(Boolean);

  return (
    <>
      <div className={styles.topbar}>
        <h2>Dashboard</h2>

        <span className={styles.dashboardDate}>
          Visão geral da PetSister
        </span>
      </div>

      <main className={styles.content}>
        {/* BOAS-VINDAS */}
        <section className={styles.dashboardWelcome}>
          <div>
            <span className={styles.attentionEyebrow}>
              PAINEL ADMINISTRATIVO
            </span>

            <h1>Olá, Admin! 👋</h1>

            <p>
              Aqui está o resumo do seu negócio e das atividades da PetSister.
            </p>
          </div>

          <Link
            href="/"
            className={styles.dashboardStoreLink}
          >
            Abrir loja ↗
          </Link>
        </section>

        {erros.length > 0 && (
          <div
            className={`${styles.alert} ${styles.aInfo}`}
            style={{ marginBottom: 20 }}
          >
            Alguns dados não puderam ser carregados. Confira as permissões
            das consultas administrativas do Supabase.
          </div>
        )}

        {/* INDICADORES */}
        <section className={styles.statsGrid}>
          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcP}`}>
              💰
            </div>
            <div>
              <div className={styles.statNum}>
                {moeda(faturamento)}
              </div>
              <div className={styles.statLbl}>
                Faturamento de pedidos pagos
              </div>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcO}`}>
              🛒
            </div>
            <div>
              <div className={styles.statNum}>
                {pedidosPagos.length}
              </div>
              <div className={styles.statLbl}>
                Pedidos pagos
              </div>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcB}`}>
              👥
            </div>
            <div>
              <div className={styles.statNum}>
                {clientes.length}
              </div>
              <div className={styles.statLbl}>
                Clientes cadastrados
              </div>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcG}`}>
              🐾
            </div>
            <div>
              <div className={styles.statNum}>
                {listaProdutos.length}
              </div>
              <div className={styles.statLbl}>
                Produtos cadastrados
              </div>
            </div>
          </div>
        </section>

        {/* DESEMPENHO E DESTAQUES */}
        <section className={styles.grid2} style={{ marginBottom: 22 }}>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h3>Desempenho por região</h3>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>
                  Faturamento de vendas por zona
                </span>
              </div>
            </div>

            <div className={styles.dashboardChartViewport}>
  <div className={styles.dashboardChart}>
    {resumoRegioes.map((item) => {
      const altura =
        item.faturamento_pago > 0
          ? Math.max(
              5,
              (item.faturamento_pago / valorMaximoGrafico) * 100
            )
          : 2;

      const semLocalizacao =
        item.zona === "Localização não informada";

      return (
        <div
          key={item.zona}
          className={styles.dashboardChartItem}
        >
          <strong className={styles.dashboardChartValue}>
            {moeda(item.faturamento_pago)}
          </strong>

          <div className={styles.dashboardChartBarArea}>
            <div
              className={styles.dashboardChartBar}
              style={{
                height: `${altura}%`,
                background: semLocalizacao
                  ? "#aab4c3"
                  : "linear-gradient(180deg, #f08030, #e84030)",
              }}
            />
          </div>

          <span className={styles.dashboardChartLabel}>
            {semLocalizacao
              ? "Sem localização"
              : item.zona}
          </span>
        </div>
      );
    })}
  </div>
</div>
                  

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 8,
                  marginTop: 18,
                  padding: 14,
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "#fffaf6",
                  textAlign: "center",
                }}
              >
                <div>
                  <strong style={{ color: "var(--p900)", fontSize: 15 }}>
                    {moeda(totalRegional)}
                  </strong>
                  <div style={{ color: "var(--muted)", fontSize: 10 }}>
                    Faturamento regional
                  </div>
                </div>

                <div>
                  <strong style={{ color: "var(--p900)", fontSize: 17 }}>
                    {regioesComVenda.length}
                  </strong>
                  <div style={{ color: "var(--muted)", fontSize: 10 }}>
                    Regiões com vendas
                  </div>
                </div>

                <div>
                  <strong style={{ color: "var(--p900)", fontSize: 17 }}>
                    {concentracao.toLocaleString("pt-BR", {
                      maximumFractionDigits: 1,
                    })}%
                  </strong>
                  <div style={{ color: "var(--muted)", fontSize: 10 }}>
                    Maior concentração
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className={styles.attentionSection}>
            <div className={styles.attentionHeading}>
              <div>
                <span className={styles.attentionEyebrow}>
                  ACOMPANHAMENTO
                </span>
                <h3>Destaques da loja</h3>
                <p>O que merece sua atenção hoje.</p>
              </div>
            </div>

           <div className={styles.dashboardHighlightsList}>
  <Link
    href="/admin/pedidos?status=pendente"
    className={styles.dashboardHighlightRow}
  >
    <div className={styles.dashboardHighlightIcon}>🛒</div>

    <div className={styles.dashboardHighlightText}>
      <strong>Pedidos pendentes</strong>
      <span>Aguardando pagamento ou processamento</span>
    </div>

    <strong className={styles.dashboardHighlightCount}>
      {pedidosPendentes.length}
    </strong>
  </Link>

  <Link
    href="/admin/produtos"
    className={styles.dashboardHighlightRow}
  >
    <div className={styles.dashboardHighlightIcon}>⚠️</div>

    <div className={styles.dashboardHighlightText}>
      <strong>Estoque baixo</strong>
      <span>Produtos no limite de estoque</span>
    </div>

    <strong className={styles.dashboardHighlightCount}>
      {estoqueBaixo.length}
    </strong>
  </Link>

  <Link
    href="/admin/agendamentos"
    className={styles.dashboardHighlightRow}
  >
    <div className={`${styles.dashboardHighlightIcon} ${styles.dashboardHighlightIconBlue}`}>
      📅
    </div>

    <div className={styles.dashboardHighlightText}>
      <strong>Agendamentos de hoje</strong>
      <span>Atendimentos previstos para hoje</span>
    </div>

    <strong className={styles.dashboardHighlightCount}>
      {agendamentosHoje.length}
    </strong>
  </Link>
</div>
                <div className={styles.attentionCardTop}>
                  <div className={`${styles.attentionIcon} ${styles.attentionIconOrange}`}>
                    🛒
                  </div>
                  <strong className={styles.attentionCount}>
                    {pedidosPendentes.length}
                  </strong>
                </div>
                <h4>Pedidos pendentes</h4>
                <p>Aguardando pagamento ou processamento.</p>
                <span className={styles.attentionLink}>
                  Ver pedidos →
                </span>
              </Link>

              <Link
                href="/admin/produtos"
                className={styles.attentionCard}
                style={{ textDecoration: "none" }}
              >
                <div className={styles.attentionCardTop}>
                  <div className={`${styles.attentionIcon} ${styles.attentionIconOrange}`}>
                    ⚠️
                  </div>
                  <strong className={styles.attentionCount}>
                    {estoqueBaixo.length}
                  </strong>
                </div>
                <h4>Estoque baixo</h4>
                <p>
                  Produtos com estoque igual ou inferior a {limiteEstoque} unidades.
                </p>
                <span className={styles.attentionLink}>
                  Ver catálogo →
                </span>
              </Link>

              <Link
                href="/admin/agendamentos"
                className={styles.attentionCard}
                style={{ textDecoration: "none" }}
              >
                <div className={styles.attentionCardTop}>
                  <div className={`${styles.attentionIcon} ${styles.attentionIconBlue}`}>
                    📅
                  </div>
                  <strong className={styles.attentionCount}>
                    {agendamentosHoje.length}
                  </strong>
                </div>
                <h4>Agendamentos de hoje</h4>
                <p>Atendimentos previstos para hoje.</p>
                <span className={styles.attentionLink}>
                  Abrir agenda →
                </span>
              </Link>
            </div>
          </section>
        </section>

        {/* RANKING E CLIENTES */}
        <section className={styles.grid2} style={{ marginBottom: 22 }}>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h3>Ranking de bairros</h3>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>
                  Bairros que mais geram faturamento
                </span>
              </div>

              <Link
                href="/admin/usuarios"
                className={styles.dashboardTableLink}
              >
                Ver relatório →
              </Link>
            </div>

            <div className={styles.tw}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Zona</th>
                    <th>Bairro</th>
                    <th>Clientes</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>

                <tbody>
                  {rankingBairros.map((item) => (
                    <tr key={`${item.zona}-${item.bairro}`}>
                      <td>{item.zona}</td>
                      <td style={{ fontWeight: 700 }}>
                        {item.bairro}
                      </td>
                      <td>{Number(item.clientes)}</td>
                      <td className={styles.dashboardMoney}>
                        {moeda(Number(item.faturamento_pago))}
                      </td>
                    </tr>
                  ))}

                  {rankingBairros.length === 0 && (
                    <tr>
                      <td colSpan={4} className={styles.dashboardEmpty}>
                        Ainda não existem dados por bairro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h3>Clientes recentes</h3>
              <Link
                href="/admin/usuarios"
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
                    <th>Pedidos</th>
                    <th>Total gasto</th>
                  </tr>
                </thead>

                <tbody>
                  {clientes.slice(0, 5).map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <strong>{cliente.nome || "Cliente"}</strong>
                        <div
                          style={{
                            color: "var(--muted)",
                            fontSize: 10,
                          }}
                        >
                          {cliente.email}
                        </div>
                      </td>
                      <td>{cliente.total_pedidos}</td>
                      <td className={styles.dashboardMoney}>
                        {moeda(Number(cliente.total_gasto))}
                      </td>
                    </tr>
                  ))}

                  {clientes.length === 0 && (
                    <tr>
                      <td colSpan={3} className={styles.dashboardEmpty}>
                        Nenhum cliente cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PEDIDOS E AGENDAMENTOS */}
        <section className={styles.grid2}>
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
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {listaPedidos.slice(0, 5).map((pedido) => {
                    const pago = pedido.status === "pago";
                    const pendente = pedido.status === "pendente";

                    return (
                      <tr key={pedido.id}>
                        <td>#{pedido.id}</td>
                        <td>
                          {nomesUsuarios.get(pedido.usuario_id) || "Cliente"}
                        </td>
                        <td>
                          <span
                            className={styles.badge}
                            style={{
                              background: pago
                                ? "#e7f7ed"
                                : pendente
                                  ? "#fff2df"
                                  : "#fdeaea",
                              color: pago
                                ? "#168348"
                                : pendente
                                  ? "#ad6500"
                                  : "#b42318",
                            }}
                          >
                            {pedido.status}
                          </span>
                        </td>
                        <td className={styles.dashboardMoney}>
                          {moeda(Number(pedido.total))}
                        </td>
                      </tr>
                    );
                  })}

                  {listaPedidos.length === 0 && (
                    <tr>
                      <td colSpan={4} className={styles.dashboardEmpty}>
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  )}
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
                    <th>Data e hora</th>
                    <th>Serviço</th>
                    <th>Pet</th>
                    <th>Cliente</th>
                  </tr>
                </thead>

                <tbody>
                  {proximosAgendamentos.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.dashboardDateCell}>
                        {dataHora(item.data_hora)}
                      </td>
                      <td>{item.servico}</td>
                      <td>{item.pet_nome || "—"}</td>
                      <td>
                        {nomesUsuarios.get(item.usuario_id) || "Cliente"}
                      </td>
                    </tr>
                  ))}

                  {proximosAgendamentos.length === 0 && (
                    <tr>
                      <td colSpan={4} className={styles.dashboardEmpty}>
                        Nenhum agendamento futuro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* AVISO DE CADASTRO */}
        {clientesSemLocalizacao > 0 && (
          <div
            className={styles.dashboardWelcome}
            style={{
              marginTop: 22,
              borderLeftColor: "#f08030",
              background: "#fffaf6",
            }}
          >
            <div>
              <span className={styles.attentionEyebrow}>
                DICA PETSISTER
              </span>

              <h3 style={{ marginTop: 5, color: "var(--p900)" }}>
                Complete os endereços dos seus clientes
              </h3>

              <p>
                Existem {clientesSemLocalizacao} clientes sem localização
                identificada. Atualizar esses dados ajuda a entender melhor
                as regiões de atendimento.
              </p>
            </div>

            <Link
              href="/admin/usuarios"
              className={styles.dashboardStoreLink}
            >
              Ver clientes →
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
