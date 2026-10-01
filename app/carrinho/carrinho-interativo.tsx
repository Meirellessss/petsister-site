"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ItemPedidoComProduto } from "@/lib/types";
import { removerItem, finalizarPedido } from "./actions";
import styles from "./carrinho.module.css";

function formatarPreco(v: number) {
  return v.toFixed(2).replace(".", ",");
}

export default function CarrinhoInterativo({
  itens,
  pedidoId,
  subtotal,
}: {
  itens: ItemPedidoComProduto[];
  pedidoId: number;
  subtotal: number;
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const router = useRouter();

  function remover(itemId: number) {
    if (!confirm("Remover item?")) return;
    startTransition(async () => {
      await removerItem(itemId, pedidoId);
      router.refresh();
    });
  }

  function checkout() {
    startTransition(async () => {
      const res = await finalizarPedido();
      if (res.ok) {
        router.push("/pedidos?ok=1");
      } else {
        setErro(res.error);
      }
    });
  }

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.cardHead}>Itens</div>
        {itens.map((it) => (
          <div className={styles.item} key={it.id}>
            <div className={styles.itemIcon}>
              {it.imagem ? <img src={it.imagem} alt="" /> : "🐾"}
            </div>
            <div className={styles.itemInfo}>
              <strong>{it.nome}</strong>
              <span>
                R$ {formatarPreco(it.preco_unitario)} × {it.quantidade}
              </span>
            </div>
            <div className={styles.itemPrice}>
              R$ {formatarPreco(it.preco_unitario * it.quantidade)}
              <button className={styles.delBtn} onClick={() => remover(it.id)} disabled={pending}>
                ✕ remover
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.card}>
        <div className={styles.cardHead}>Resumo</div>
        <div className={styles.sumBody}>
          <div className={styles.sumRow}>
            <span>Subtotal</span>
            <span>R$ {formatarPreco(subtotal)}</span>
          </div>
          <div className={styles.sumRow}>
            <span>Frete</span>
            <span style={{ color: "#166534", fontWeight: 600 }}>Grátis</span>
          </div>
          <div className={styles.sumTotal}>
            <span>Total</span>
            <span>R$ {formatarPreco(subtotal)}</span>
          </div>
          {erro && <div style={{ color: "#991b1b", fontSize: ".85rem", marginTop: ".6rem" }}>⚠ {erro}</div>}
          <button className={styles.btnCheckout} onClick={checkout} disabled={pending}>
            {pending ? "Processando…" : "Finalizar pedido →"}
          </button>
          <Link href="/" className={styles.btnBack}>
          ← Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
