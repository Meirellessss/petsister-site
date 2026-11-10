import { createClient } from "@/lib/supabase/server";
import type { AdminUsuarioRow, Pedido, StatusPedido } from "@/lib/types";
import PedidosClient from "./pedidos-client";
import styles from "../admin.module.css";

export default async function PedidosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { status } = await searchParams;

  const statusFiltro: "" | StatusPedido =
  status === "pendente" || status === "pago" || status === "cancelado"
    ? status
    : "";

const { data: pedidos } = await supabase
  .from("petsister_pedidos")
  .select("*")
  .order("criado_em", { ascending: false });

  const { data: usuarios } = await supabase.rpc("petsister_admin_usuarios");
  const infoUsuario = new Map(
    ((usuarios ?? []) as AdminUsuarioRow[]).map((u) => [u.id, { nome: u.nome, email: u.email }]),
  );

  return (
    <>
     <div className={styles.topbar}>
  <div className={styles.pageHeading}>
    <h2>Pedidos</h2>
    <p className={styles.pageSubtitle}>
      Acompanhe as vendas, pagamentos e situação dos pedidos da PetSister.
    </p>
  </div>
  <div className={styles.ordersFilters}>
          {[
            ["", "Todos"],
            ["pendente", "Pendentes"],
            ["pago", "Pagos"],
            ["cancelado", "Cancelados"],
          ].map(([v, l]) => (
            <a
              key={v}
              href={`/admin/pedidos${v ? `?status=${v}` : ""}`}
              className={`${styles.btn} ${styles.btnSm} ${statusFiltro === v ? styles.btnPrimary : styles.btnOutline}`}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <PedidosClient
          pedidos={(pedidos as Pedido[]) ?? []}
          infoUsuario={Object.fromEntries(infoUsuario)}
          statusInicial={statusFiltro}
        />
      </div>
    </>
  );
}
