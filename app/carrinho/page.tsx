import Link from "next/link";
import { getPedidoPendente, getUsuarioAtual } from "@/lib/queries";
import CarrinhoInterativo from "./carrinho-interativo";
import styles from "./carrinho.module.css";

export default async function CarrinhoPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) return null; // proxy já redireciona

  const { pedido, itens } = await getPedidoPendente(usuario.id);
  const subtotal = itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0);

  return (
    <div>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.jpg" alt="Pet Sister" />
        </Link>
        <Link href="/">← Continuar comprando</Link>
      </nav>
      <div className={styles.page}>
        <div className={styles.ph}>
          <h1>Seu carrinho</h1>
          <p>
            {itens.length} item{itens.length !== 1 ? "s" : ""} selecionado{itens.length !== 1 ? "s" : ""}
          </p>
        </div>

        {itens.length === 0 ? (
          <div className={styles.card}>
            <div className={styles.empty}>
              <div className={styles.ic}>🛒</div>
              <h3>Carrinho vazio</h3>
              <p>Adicione produtos para continuar.</p>
              <Link href="/" className={styles.btnLink}>
                Ver produtos
              </Link>
            </div>
          </div>
        ) : (
          <CarrinhoInterativo itens={itens} pedidoId={pedido!.id} subtotal={subtotal} />
        )}
      </div>
    </div>
  );
}
