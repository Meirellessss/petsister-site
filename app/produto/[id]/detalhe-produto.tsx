"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Produto } from "@/lib/types";
import { adicionarAoCarrinho } from "@/app/carrinho/actions";
import Icon from "@/components/Icon";
import styles from "./produto.module.css";

function formatarPreco(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DetalheProduto({
  produto,
  logado,
}: {
  produto: Produto;
  logado: boolean;
}) {
  const [quantidade, setQuantidade] = useState(1);
  const [mensagem, setMensagem] = useState<{
    tipo: "ok" | "erro";
    texto: string;
  } | null>(null);

  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function adicionar() {
    setMensagem(null);

    startTransition(async () => {
      const resultado = await adicionarAoCarrinho(
        produto.id,
        quantidade
      );

      if (resultado.ok) {
        setMensagem({
          tipo: "ok",
          texto: "Produto adicionado ao carrinho!",
        });
        router.refresh();
      } else {
        setMensagem({
          tipo: "erro",
          texto: resultado.error,
        });
      }
    });
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/#produtos" className={styles.back}>
          ← Voltar aos produtos
        </Link>

        <div className={styles.layout}>
          <div className={styles.imagePanel}>
            {produto.destaque && (
              <span className={styles.tag}>Destaque</span>
            )}

            {produto.imagem ? (
              <img
                className={styles.productImage}
                src={produto.imagem}
                alt={produto.nome}
              />
            ) : (
              <div className={styles.noImage}>
                <Icon name="pata" size={76} />
                <span>Imagem indisponível</span>
              </div>
            )}
          </div>

          <section className={styles.info}>
            <span className={styles.category}>
              {produto.categoria || "Produtos para pets"}
            </span>

            <h1 className={styles.title}>
              {produto.nome}
            </h1>

            <div className={styles.price}>
              R$ {formatarPreco(produto.preco)}
            </div>

            <p className={styles.installment}>
              Ou 3x de R${" "}
              {formatarPreco(produto.preco / 3)} sem juros
            </p>

            <div className={styles.stock}>
              <span
                className={
                  produto.estoque > 0
                    ? styles.stockAvailable
                    : styles.stockUnavailable
                }
              >
                {produto.estoque > 0
                  ? `${produto.estoque} unidade(s) em estoque`
                  : "Produto indisponível no momento"}
              </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.descriptionTitle}>
              Sobre o produto
            </div>

            <p className={styles.description}>
              {produto.descricao ||
                "Entre em contato com nosso atendimento para saber mais sobre este produto."}
            </p>

            <div className={styles.details}>
              <span className={styles.detailLabel}>
                Indicação
              </span>
              <span>
                {produto.porte === "Medio"
                  ? "Porte médio"
                  : produto.porte === "Todos"
                    ? "Todos os portes"
                    : produto.porte === "Pequeno"
                      ? "Porte pequeno"
                      : "Porte grande"}
              </span>
            </div>

            {produto.estoque > 0 && logado && (
              <div className={styles.purchase}>
                <span className={styles.quantityLabel}>
                  Quantidade
                </span>

                <div className={styles.quantityControls}>
                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() =>
                      setQuantidade((q) => Math.max(1, q - 1))
                    }
                    disabled={quantidade <= 1 || pending}
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>

                  <span className={styles.quantityValue}>
                    {quantidade}
                  </span>

                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() =>
                      setQuantidade((q) =>
                        Math.min(produto.estoque, q + 1)
                      )
                    }
                    disabled={
                      quantidade >= produto.estoque || pending
                    }
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {mensagem && (
              <div
                className={`${styles.message} ${
                  mensagem.tipo === "ok"
                    ? styles.success
                    : styles.error
                }`}
                role="status"
              >
                {mensagem.texto}
              </div>
            )}

            {logado ? (
              <button
                type="button"
                className={styles.buyButton}
                onClick={adicionar}
                disabled={pending || produto.estoque <= 0}
              >
                <Icon name="carrinho" size={19} />
                {pending
                  ? "Adicionando..."
                  : produto.estoque <= 0
                    ? "Produto indisponível"
                    : "Adicionar ao carrinho"}
              </button>
            ) : (
              <Link href="/login" className={styles.buyButton}>
                Entrar para comprar
              </Link>
            )}

            <div className={styles.trust}>
              <span>Compra segura</span>
              <span>•</span>
              <span>Atendimento PetSister</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
