"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ItemPedidoComProduto } from "@/lib/types";
import { removerItem } from "./actions";
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
  const [iniciandoPagamento, setIniciandoPagamento] = useState(false);
  const router = useRouter();

  function remover(itemId: number) {
  if (!confirm("Remover item?")) return;

  setErro("");

  startTransition(async () => {
    const resultado = await removerItem(itemId, pedidoId);

    if (!resultado.ok) {
      setErro(resultado.error);
      return;
    }

    router.refresh();
  });
}

  async function iniciarPagamentoTeste() {
  if (iniciandoPagamento || pending) return;

  setIniciandoPagamento(true);
  setErro("");

  try {
    const resposta = await fetch("/api/pagamentos/teste/criar", {
      method: "POST",
    });

    const resultado = (await resposta.json().catch(() => null)) as {
      ok?: boolean;
      erro?: string;
      checkoutUrl?: string;
    } | null;

    if (!resposta.ok) {
      throw new Error(
        resultado?.erro || "Não foi possível iniciar o pagamento."
      );
    }

    if (
      resultado?.ok !== true ||
      typeof resultado.checkoutUrl !== "string" ||
      !/^\/pagamento-teste\/\d+$/.test(resultado.checkoutUrl)
    ) {
      throw new Error("Endereço de pagamento inválido.");
    }

    router.push(resultado.checkoutUrl);
  } catch (e) {
    setErro(
      e instanceof Error
        ? e.message
        : "Erro ao iniciar o pagamento."
    );
  } finally {
    setIniciandoPagamento(false);
  }
}

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.cardHead}>Itens</div>
        {itens.map((it) => (
          <div className={styles.item} key={it.id}>
            <div className={styles.itemIcon}>
              {it.imagem ?<img src={it.imagem.split(/\r?\n/)[0]} alt="" /> : "🐾"}
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
          <button
  className={styles.btnCheckout}
  type="button"
  onClick={iniciarPagamentoTeste}
  disabled={pending || iniciandoPagamento}
  title="Simulação de pagamento, sem cobrança real."
>
  {iniciandoPagamento
    ? "Preparando pagamento..."
    : "Continuar para pagamento (teste)"}
</button>
          <Link href="/" className={styles.btnBack}>
          ← Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
