import AreaHeader from "@/components/AreaHeader";
import Link from "next/link";
import { getMeusPedidos, getUsuarioAtual } from "@/lib/queries";
import PedidosLista from "./pedidos-lista";
import styles from "./pedidos.module.css";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const usuario = await getUsuarioAtual();
  if (!usuario) return null;

  const pedidos = await getMeusPedidos(usuario.id);
  const { ok } = await searchParams;

  return (
    <div>
     <AreaHeader />
      <div className={styles.page}>
        <div className={styles.ph}>
          <h1>Meus pedidos</h1>
          <p>Histórico completo de compras</p>
        </div>
        {ok && <div className={styles.alertOk}>✓ Pedido finalizado com sucesso!</div>}
        {pedidos.length === 0 ? (
          <div className={styles.card}>
            <div className={styles.empty}>
              <p>
                Nenhum pedido ainda.{" "}
                <Link href="/" style={{ color: "var(--p600)", fontWeight: 600 }}>
                  Ver produtos →
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <PedidosLista pedidos={pedidos} />
        )}
      </div>
    </div>
  );
}
