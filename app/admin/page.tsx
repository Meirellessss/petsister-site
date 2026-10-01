import { createClient } from "@/lib/supabase/server";
import styles from "./admin.module.css";

const badgeStyle: Record<string, { background: string; color: string }> = {
  pendente: { background: "#fff7ed", color: "#c2410c" },
  pago: { background: "#f0fdf4", color: "#166534" },
  cancelado: { background: "#fef2f2", color: "#991b1b" },
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: clientes }, { count: produtos }, { count: pedidosTotal }, { data: pagos }, { count: agends }] =
    await Promise.all([
      supabase.from("petsister_profiles").select("*", { count: "exact", head: true }).eq("perfil", "cliente"),
      supabase.from("petsister_produtos").select("*", { count: "exact", head: true }),
      supabase.from("petsister_pedidos").select("*", { count: "exact", head: true }),
      supabase.from("petsister_pedidos").select("total").eq("status", "pago"),
      supabase
        .from("petsister_agendamentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "agendado"),
    ]);

  const receita = (pagos ?? []).reduce((s, p) => s + p.total, 0);

  const { data: recentesPedidos } = await supabase
    .from("petsister_pedidos")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(6);

  const { data: proxAgendamentos } = await supabase
    .from("petsister_agendamentos")
    .select("*")
    .eq("status", "agendado")
    .order("data_hora", { ascending: true })
    .limit(6);

  const idsUsuarios = [
    ...new Set([...(recentesPedidos ?? []).map((p) => p.usuario_id), ...(proxAgendamentos ?? []).map((a) => a.usuario_id)]),
  ];
  const { data: perfis } = idsUsuarios.length
    ? await supabase.from("petsister_profiles").select("id,nome").in("id", idsUsuarios)
    : { data: [] };
  const nomeDe = (id: string) => perfis?.find((p) => p.id === id)?.nome ?? "—";

  return (
    <>
      <div className={styles.topbar}>
        <h2>Dashboard</h2>
        <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>
          {new Date().toLocaleString("pt-BR")}
        </span>
      </div>
      <div className={styles.content}>
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcP}`}>👥</div>
            <div>
              <div className={styles.statNum}>{clientes ?? 0}</div>
              <div className={styles.statLbl}>Clientes</div>
            </div>
          </div>
          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcG}`}>📦</div>
            <div>
              <div className={styles.statNum}>{produtos ?? 0}</div>
              <div className={styles.statLbl}>Produtos</div>
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
                R$ {receita.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </div>
              <div className={styles.statLbl}>Receita (pagos)</div>
            </div>
          </div>
          <div className={styles.stat}>
            <div className={`${styles.statIc} ${styles.statIcP}`}>📅</div>
            <div>
              <div className={styles.statNum}>{agends ?? 0}</div>
              <div className={styles.statLbl}>Agend. pendentes</div>
            </div>
          </div>
        </div>
        <div className={styles.grid2}>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h3>Pedidos recentes</h3>
              <a href="/admin/pedidos" style={{ fontSize: ".8rem", color: "var(--p600)", fontWeight: 600 }}>
                Ver todos →
              </a>
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
                  {(recentesPedidos ?? []).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>#{p.id}</strong>
                      </td>
                      <td>{nomeDe(p.usuario_id)}</td>
                      <td style={{ fontWeight: 700, color: "var(--p700)" }}>
                        R$ {p.total.toFixed(2).replace(".", ",")}
                      </td>
                      <td>
                        <span className={styles.badge} style={badgeStyle[p.status]}>
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
              <a href="/admin/agendamentos" style={{ fontSize: ".8rem", color: "var(--p600)", fontWeight: 600 }}>
                Ver todos →
              </a>
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
                      <td colSpan={3} style={{ textAlign: "center", padding: "1.5rem", color: "var(--muted)" }}>
                        Nenhum agendamento pendente
                      </td>
                    </tr>
                  )}
                  {(proxAgendamentos ?? []).map((a) => (
                    <tr key={a.id}>
                      <td>{nomeDe(a.usuario_id)}</td>
                      <td>{a.servico}</td>
                      <td style={{ fontSize: ".82rem" }}>
                        {new Date(a.data_hora).toLocaleDateString("pt-BR")}{" "}
                        {new Date(a.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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
