
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Categoria, Perfil, Produto } from "@/lib/types";
import { adicionarAoCarrinho } from "@/app/carrinho/actions";
import AreaHeader from "@/components/AreaHeader";
import Icon from "@/components/Icon";
import catalogoStyles from "./catalogo.module.css";
import homeStyles from "@/app/landing.module.css";

type CatalogoProps = {
  categorias: Categoria[];
  produtos: Produto[];
  usuario: { nome: string; perfil: Perfil } | null;
  categoriaInicial?: string;
  buscaInicial?: string;
};

const ICONES: Record<string, string> = {
  "Ração": "racao",
  "Ração Cachorro": "racao",
  "Ração Gato": "gato",
  "Brinquedos": "brinquedos",
  "Conforto": "conforto",
  "Farmácia": "farmacia",
  "Higiene": "higiene",
  "Passeio": "passeio",
  "Petiscos": "petiscos",
};

function formatarPreco(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function precoFinal(produto: Produto) {
  const desconto = Math.min(
    90,
    Math.max(0, Number(produto.desconto_percentual ?? 0))
  );

  return (
    Math.round(Number(produto.preco) * (1 - desconto / 100) * 100) /
    100
  );
}

export default function CatalogoClient({
   categorias,
  produtos,
  usuario,
  categoriaInicial = "",
  buscaInicial = "",
}: CatalogoProps) {
  const router = useRouter();
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [busca, setBusca] = useState(buscaInicial);
  const [ordenacao, setOrdenacao] = useState("destaque");
  const [erro, setErro] = useState("");
  const [produtoAdicionando, setProdutoAdicionando] = useState<
    number | null
  >(null);
  const [pending, startTransition] = useTransition();

  const produtosVisiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const categoriaNormalizada = categoria
      .trim()
      .toLocaleLowerCase("pt-BR");

    const resultado = produtos.filter((produto) => {
      const nome = (produto.nome ?? "").toLocaleLowerCase("pt-BR");
      const descricao = (produto.descricao ?? "")
        .toLocaleLowerCase("pt-BR");
      const categoriaProduto = (produto.categoria ?? "")
        .trim()
        .toLocaleLowerCase("pt-BR");

      const correspondeBusca =
        !termo ||
        nome.includes(termo) ||
        descricao.includes(termo);

      const correspondeCategoria =
        !categoriaNormalizada ||
        categoriaProduto === categoriaNormalizada;

      return correspondeBusca && correspondeCategoria;
    });

    return resultado.sort((a, b) => {
      switch (ordenacao) {
        case "preco-menor":
          return precoFinal(a) - precoFinal(b);

        case "preco-maior":
          return precoFinal(b) - precoFinal(a);

        case "nome-az":
          return a.nome.localeCompare(b.nome, "pt-BR");

        case "nome-za":
          return b.nome.localeCompare(a.nome, "pt-BR");

        default:
          return (
            Number(b.destaque) - Number(a.destaque) ||
            a.nome.localeCompare(b.nome, "pt-BR")
          );
      }
    });
  }, [produtos, busca, categoria, ordenacao]);

  function selecionarCategoria(nome: string) {
    setCategoria(nome);
  }

  function adicionarProduto(produto: Produto) {
    setErro("");
    setProdutoAdicionando(produto.id);

    startTransition(async () => {
      try {
        const resultado = await adicionarAoCarrinho(produto.id, 1);

        if (!resultado.ok) {
          setErro(resultado.error);
          return;
        }

        router.refresh();
      } catch {
        setErro("Não foi possível adicionar o produto. Tente novamente.");
      } finally {
        setProdutoAdicionando(null);
      }
    });
  }

  return (
    <div className={catalogoStyles.page}>
      <AreaHeader />

      <main className={catalogoStyles.container}>
        <nav className={catalogoStyles.breadcrumbs} aria-label="Navegação">
          <Link href="/">Início</Link>
          <span>/</span>
          <span>Produtos</span>
          {categoria && (
            <>
              <span>/</span>
              <span>{categoria}</span>
            </>
          )}
        </nav>

        <header className={catalogoStyles.intro}>
          <div className={catalogoStyles.eyebrow}>PetSister</div>
          <h1 className={catalogoStyles.title}>
            {categoria || "Todos os produtos"}
          </h1>
          <p className={catalogoStyles.subtitle}>
            Encontre produtos para cuidar, alimentar e divertir seu pet.
          </p>
        </header>

        <div className={catalogoStyles.toolbar}>
          <label className={catalogoStyles.search}>
            <Icon name="busca" size={20} />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome ou descrição..."
              aria-label="Buscar produtos"
            />
          </label>

          <label className={catalogoStyles.sortLabel}>
            Ordenar por
            <select
              className={catalogoStyles.sortSelect}
              value={ordenacao}
              onChange={(event) => setOrdenacao(event.target.value)}
            >
              <option value="destaque">Destaques</option>
              <option value="preco-menor">Menor preço</option>
              <option value="preco-maior">Maior preço</option>
              <option value="nome-az">Nome: A–Z</option>
              <option value="nome-za">Nome: Z–A</option>
            </select>
          </label>
        </div>

        <div className={catalogoStyles.layout}>
          <aside className={catalogoStyles.sidebar}>
            <h2 className={catalogoStyles.filterTitle}>
              Categorias
            </h2>

            <div className={catalogoStyles.categoryList}>
              <button
                type="button"
                className={`${catalogoStyles.categoryButton} ${
                  categoria === ""
                    ? catalogoStyles.categoryButtonActive
                    : ""
                }`}
                onClick={() => selecionarCategoria("")}
              >
                Todas as categorias
              </button>

              {categorias.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`${catalogoStyles.categoryButton} ${
                    categoria === item.nome
                      ? catalogoStyles.categoryButtonActive
                      : ""
                  }`}
                  onClick={() => selecionarCategoria(item.nome)}
                >
                  {item.nome}
                </button>
              ))}
            </div>
          </aside>

          <div className={catalogoStyles.results}>
            <div className={catalogoStyles.resultsHeader}>
              <span>
                {produtosVisiveis.length}{" "}
                {produtosVisiveis.length === 1
                  ? "produto encontrado"
                  : "produtos encontrados"}
              </span>

              {categoria && (
                <button
                  type="button"
                  className={catalogoStyles.categoryButton}
                  onClick={() => selecionarCategoria("")}
                >
                  Limpar categoria
                </button>
              )}
            </div>

            {erro && (
              <div className={catalogoStyles.notice} role="alert">
                {erro}
              </div>
            )}

            {produtosVisiveis.length === 0 ? (
              <div className={catalogoStyles.empty}>
                <h2>Nenhum produto encontrado</h2>
                <p>
                  Tente outro termo de busca ou escolha uma categoria diferente.
                </p>
              </div>
            ) : (
              <section className={homeStyles.section}>
                <div className={homeStyles.prodGrid}>
                  {produtosVisiveis.map((produto) => {
                    const desconto = Math.min(
                      90,
                      Math.max(
                        0,
                        Number(produto.desconto_percentual ?? 0)
                      )
                    );

                    const precoOriginal = Number(produto.preco);
                    const precoAtual = precoFinal(produto);

                    const parcelas = Math.min(
                      12,
                      Math.max(
                        1,
                        Number(produto.parcelamento_maximo ?? 3)
                      )
                    );

                    const parcelamentoAtivo =
                      produto.parcelamento_ativo === true &&
                      parcelas > 1;

                    const valorParcela =
                      Math.round((precoAtual / parcelas) * 100) / 100;

                    return (
                      <article
                        className={homeStyles.prodCard}
                        key={produto.id}
                      >
                        <Link
                          href={`/produto/${produto.id}`}
                          className={homeStyles.prodThumb}
                          aria-label={`Ver ${produto.nome}`}
                        >
                          {produto.destaque && (
                            <span className={homeStyles.prodTag}>
                              Destaque
                            </span>
                          )}

                          {produto.imagem ? (
                            <img
                              src={produto.imagem.split(/\r?\n/)[0]}
                              alt={produto.nome}
                            />
                          ) : (
                            <span className={homeStyles.phIc}>
                              <Icon
                                name={
                                  ICONES[produto.categoria ?? ""] ?? "pata"
                                }
                                size={64}
                              />
                            </span>
                          )}
                        </Link>

                        <div className={homeStyles.prodBody}>
                          <div className={homeStyles.prodCat}>
                            {produto.categoria}
                          </div>

                          <Link
                            href={`/produto/${produto.id}`}
                            className={homeStyles.prodName}
                          >
                            {produto.nome}
                          </Link>

                          {produto.descricao?.trim() ? (
                            <p className={homeStyles.prodDescription}>
                              {produto.descricao.trim()}
                            </p>
                          ) : null}

                          {produto.porte ? (
                            <span className={homeStyles.prodPorte}>
                              Porte:{" "}
                              {produto.porte === "Medio"
                                ? "Médio"
                                : produto.porte === "Todos"
                                  ? "Todos os portes"
                                  : produto.porte}
                            </span>
                          ) : null}

                          {produto.estoque > 0 && produto.estoque <= 8 && (
                            <div className={homeStyles.prodStockLow}>
                              <Icon name="raio" size={13} />
                              Últimas {produto.estoque} unidades
                            </div>
                          )}

                          <div className={homeStyles.prodPriceRow}>
                            {desconto > 0 && (
                              <span className={homeStyles.prodOldPrice}>
                                R$ {formatarPreco(precoOriginal)}
                              </span>
                            )}

                            <span className={homeStyles.prodPrice}>
                              R$ {formatarPreco(precoAtual)}
                            </span>

                            {desconto > 0 && (
                              <span className={homeStyles.prodDiscountBadge}>
                                -{desconto}%
                              </span>
                            )}
                          </div>

                          {parcelamentoAtivo && (
                            <div className={homeStyles.prodInstallment}>
                              Em até {parcelas}x de R${" "}
                              {formatarPreco(valorParcela)}
                            </div>
                          )}

                          {usuario ? (
                            <button
                              type="button"
                              className={homeStyles.btnComprar}
                              onClick={() => adicionarProduto(produto)}
                              disabled={
                                pending &&
                                produtoAdicionando === produto.id
                              }
                            >
                              <Icon name="carrinho" size={16} />
                              {produtoAdicionando === produto.id
                                ? "Adicionando..."
                                : "Adicionar"}
                            </button>
                          ) : (
                            <Link
                              href="/login"
                              className={homeStyles.btnComprar}
                            >
                              Entrar para comprar
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
