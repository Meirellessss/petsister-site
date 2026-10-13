
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

function nomePorte(porte: Produto["porte"]) {
  switch (porte) {
    case "Pequeno":
      return "Pequeno";
    case "Medio":
      return "Médio";
    case "Grande":
      return "Grande";
    default:
      return "Todos os portes";
  }
}

export default function DetalheProduto({
  produto,
  logado,
  produtosRelacionados,
}: {
  produto: Produto;
  logado: boolean;
  produtosRelacionados: Produto[];
}) {
  const [quantidade, setQuantidade] = useState(1);
  const [abaAtiva, setAbaAtiva] = useState<"descricao" | "informacoes">(
    "descricao"
  );
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function adicionar() {
    setErro(null);

    startTransition(async () => {
      try {
        const resultado = await adicionarAoCarrinho(
          produto.id,
          quantidade
        );

        if (!resultado.ok) {
          setErro(resultado.error);
          return;
        }

        // Adiciona diretamente ao carrinho, sem janela de confirmação.
        router.refresh();
      } catch {
        setErro("Não foi possível adicionar o produto. Tente novamente.");
      }
    });
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Navegação">
          <Link href="/">Início</Link>
          <span>/</span>
          <Link href="/#produtos">Produtos</Link>
          <span>/</span>
          <span>{produto.categoria || "PetSister"}</span>
        </nav>

        <Link href="/#produtos" className={styles.back}>
          ← Voltar aos produtos
        </Link>

        <section className={styles.productLayout}>
          <div className={styles.gallery}>
            <div className={styles.thumbRail}>
              {produto.imagem ? (
                <div className={styles.thumbActive}>
                  <img src={produto.imagem} alt="" />
                </div>
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <Icon name="pata" size={26} />
                </div>
              )}
            </div>

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
                  <span>Imagem não cadastrada</span>
                </div>
              )}
            </div>
          </div>

          <section className={styles.info}>
            <div className={styles.category}>
              {produto.categoria || "Produtos para pets"}
            </div>

            <h1 className={styles.title}>{produto.nome}</h1>

            <div className={styles.productMeta}>
              <span>Código: {produto.id}</span>
              <span className={styles.metaDivider}>•</span>
              <span>Avaliações ainda não disponíveis</span>
            </div>

            <div className={styles.priceBlock}>
              <div className={styles.price}>
                R$ {formatarPreco(produto.preco)}
              </div>

              <p className={styles.installment}>
                Em até 3x de R$ {formatarPreco(produto.preco / 3)} sem juros
              </p>
            </div>

            <div className={styles.stockRow}>
              <span
                className={
                  produto.estoque > 0
                    ? styles.stockAvailable
                    : styles.stockUnavailable
                }
              >
                <span className={styles.stockDot} />
                {produto.estoque > 0
                  ? "Disponível em estoque"
                  : "Produto indisponível no momento"}
              </span>

              {produto.estoque > 0 && (
                <span className={styles.stockQuantity}>
                  {produto.estoque} unidade(s)
                </span>
              )}
            </div>

            <div className={styles.purchaseDivider} />

            {produto.estoque > 0 && logado && (
              <div className={styles.purchaseRow}>
                <span className={styles.quantityLabel}>Quantidade</span>

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

                  <span className={styles.quantityValue}>{quantidade}</span>

                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() =>
                      setQuantidade((q) => Math.min(produto.estoque, q + 1))
                    }
                    disabled={quantidade >= produto.estoque || pending}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {erro && (
              <div className={styles.error} role="alert">
                {erro}
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

            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <Icon name="cadeado" size={21} />
                <div>
                  <strong>Compra segura</strong>
                  <span>Seus pedidos na PetSister</span>
                </div>
              </div>

              <div className={styles.benefit}>
                <Icon name="caminhao" size={23} />
                <div>
                  <strong>Disk Entrega</strong>
                  <span>Consulte as condições de entrega</span>
                </div>
              </div>

              <div className={styles.benefit}>
                <Icon name="coracao" size={21} />
                <div>
                  <strong>Atendimento PetSister</strong>
                  <span>Cuidado para o seu pet</span>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className={styles.detailSection}>
          <h2 className={styles.sectionTitle}>Detalhes do produto</h2>

          <div className={styles.tabs} role="tablist" aria-label="Detalhes">
            <button
              type="button"
              role="tab"
              aria-selected={abaAtiva === "descricao"}
              className={`${styles.tab} ${
                abaAtiva === "descricao" ? styles.tabActive : ""
              }`}
              onClick={() => setAbaAtiva("descricao")}
            >
              Descrição
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={abaAtiva === "informacoes"}
              className={`${styles.tab} ${
                abaAtiva === "informacoes" ? styles.tabActive : ""
              }`}
              onClick={() => setAbaAtiva("informacoes")}
            >
              Especificações
            </button>
          </div>

          {abaAtiva === "descricao" ? (
            <div className={styles.descriptionContent} role="tabpanel">
              <h3>Sobre o produto</h3>
              <p>
                {produto.descricao ||
                  "Ainda não há uma descrição cadastrada para este produto."}
              </p>
            </div>
          ) : (
            <div className={styles.specifications} role="tabpanel">
              <div className={styles.specRow}>
                <span>Produto</span>
                <strong>{produto.nome}</strong>
              </div>
              <div className={styles.specRow}>
                <span>Categoria</span>
                <strong>{produto.categoria || "Não informada"}</strong>
              </div>
              <div className={styles.specRow}>
                <span>Indicação de porte</span>
                <strong>{nomePorte(produto.porte)}</strong>
              </div>
              <div className={styles.specRow}>
                <span>Disponibilidade</span>
                <strong>
                  {produto.estoque > 0 ? "Em estoque" : "Indisponível"}
                </strong>
              </div>
              <div className={styles.specRow}>
                <span>Código do produto</span>
                <strong>{produto.id}</strong>
              </div>
            </div>
          )}
        </section>
        
{produtosRelacionados.length > 0 && (
  <section className={styles.relatedSection}>
    <div className={styles.relatedHeading}>
      <div>
        <span className={styles.relatedEyebrow}>
          MAIS PARA O SEU PET
        </span>
        <h2>Seu pet também pode gostar</h2>
        <p>Confira outros produtos selecionados para você.</p>
      </div>

      <Link href="/#produtos" className={styles.relatedAll}>
        Ver todos →
      </Link>
    </div>

    <div className={styles.relatedGrid}>
      {produtosRelacionados.map((item) => (
        <Link
          key={item.id}
          href={`/produto/${item.id}`}
          className={styles.relatedCard}
        >
          <div className={styles.relatedImage}>
            {item.imagem ? (
              <img src={item.imagem} alt={item.nome} />
            ) : (
              <span className={styles.relatedPlaceholder}>
                <Icon name="pata" size={38} />
              </span>
            )}
          </div>

          <div className={styles.relatedInfo}>
            <span className={styles.relatedCategory}>
              {item.categoria || "PetSister"}
            </span>

            <h3>{item.nome}</h3>

            <span className={styles.relatedPrice}>
              R$ {formatarPreco(item.preco)}
            </span>

            <span className={styles.relatedAction}>
              Ver produto →
            </span>
          </div>
        </Link>
      ))}
    </div>
  </section>
)}

      </div>
    </main>
  );
}
