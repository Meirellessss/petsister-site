"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Categoria, Porte, Produto } from "@/lib/types";
import { excluirProduto, salvarProduto } from "../actions";
import styles from "../admin.module.css";

const PORTES: Porte[] = ["Todos", "Pequeno", "Medio", "Grande"];

export default function ProdutosClient({
  produtos,
  categorias,
  limiteEstoqueBaixo,
}: {
  produtos: Produto[];
  categorias: Categoria[];
  limiteEstoqueBaixo: number;
}) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const router = useRouter();
    const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroEstoque, setFiltroEstoque] = useState("todos");

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    const correspondeBusca =
      produto.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
      (produto.descricao ?? "").toLocaleLowerCase("pt-BR").includes(termo);

    const correspondeCategoria =
      filtroCategoria === "Todas" ||
      produto.categoria === filtroCategoria;

    const correspondeEstoque =
      filtroEstoque === "todos" ||
      (filtroEstoque === "baixo" &&
        produto.estoque > 0 &&
        produto.estoque <= limiteEstoqueBaixo) ||
      (filtroEstoque === "esgotado" && produto.estoque === 0);

    return (
      correspondeBusca &&
      correspondeCategoria &&
      correspondeEstoque
    );
  });

  const totalEsgotados = produtos.filter(
    (produto) => produto.estoque === 0
  ).length;

  const totalEstoqueBaixo = produtos.filter(
    (produto) =>
      produto.estoque > 0 &&
      produto.estoque <= limiteEstoqueBaixo
  ).length;

  const totalDisponiveis = produtos.filter(
    (produto) => produto.estoque > limiteEstoqueBaixo
  ).length;

  
  function novo() {
    setEditando(null);
    setErro("");
    setAberto(true);
  }

  function editar(p: Produto) {
    setEditando(p);
    setErro("");
    setAberto(true);
  }

  function excluir(id: number) {
    if (!confirm("Excluir?")) return;
    startTransition(async () => {
      await excluirProduto(id);
      router.refresh();
    });
  }

  function submeter(formData: FormData) {
    startTransition(async () => {
      const res = await salvarProduto(formData);
      if (res.ok) {
        setAberto(false);
        router.refresh();
      } else {
        setErro(res.error);
      }
    });
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h3>Produtos</h3>
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={novo}>
            + Novo produto
          </button>
        </div>
                <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: ".8rem",
            marginBottom: "1rem",
          }}
        >
          <input
            type="search"
            className={styles.fc}
            placeholder="Buscar por nome ou descrição..."
            aria-label="Buscar produtos por nome ou descrição"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <select
            className={styles.fc}
            aria-label="Filtrar por categoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="Todas">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.nome}>
                {categoria.nome}
              </option>
            ))}
          </select>

          <select
            className={styles.fc}
            aria-label="Filtrar por estoque"
            value={filtroEstoque}
            onChange={(e) => setFiltroEstoque(e.target.value)}
          >
            <option value="todos">Todos os estoques</option>
            <option value="baixo">Estoque baixo</option>
            <option value="esgotado">Esgotados</option>
          </select>
        </div>

       
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: ".8rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              background: "var(--bg)",
            }}
          >
            <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>
              Produtos esgotados
            </div>
            <strong style={{ color: "#991b1b", fontSize: "1.5rem" }}>
              {totalEsgotados}
            </strong>
          </div>

          <div
            style={{
              padding: "1rem",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              background: "var(--bg)",
            }}
          >
            <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>
              Estoque baixo
            </div>
            <strong style={{ color: "#9a3412", fontSize: "1.5rem" }}>
              {totalEstoqueBaixo}
            </strong>
          </div>

          <div
            style={{
              padding: "1rem",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              background: "var(--bg)",
            }}
          >
            <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>
              Estoque normal
            </div>
            <strong style={{ color: "#166534", fontSize: "1.5rem" }}>
              {totalDisponiveis}
            </strong>
          </div>
        </div>

        <p style={{ color: "var(--muted)", marginBottom: ".8rem" }}>
          Exibindo {produtosFiltrados.length} de {produtos.length} produtos
        </p>


        <div className={styles.tw}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Porte</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Destaque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                   {produtos.length === 0
                      ? "Nenhum produto cadastrado"
                      : "Nenhum produto encontrado com esses filtros"}
                  </td>
                </tr>
              )}
              {produtosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.nome}</div>
                    <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>
                      {(p.descricao ?? "").slice(0, 50)}…
                    </div>
                  </td>
                  <td>{p.categoria ?? "—"}</td>
                  <td>
                    <span className={styles.badge} style={{ background: "var(--p50)", color: "var(--p700)" }}>
                      {p.porte === "Medio" ? "Médio" : p.porte}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--p700)" }}>
                    R$ {p.preco.toFixed(2).replace(".", ",")}
                  </td>
                  <td>
                    <span
                      className={styles.badge}
                      style={
  p.estoque === 0
    ? { background: "#fef2f2", color: "#991b1b" }
    : p.estoque <= limiteEstoqueBaixo
      ? { background: "#fff7ed", color: "#9a3412" }
      : { background: "#f0fdf4", color: "#166534" }
}
                    >
                      {p.estoque === 0
  ? "Esgotado"
  : p.estoque <= limiteEstoqueBaixo
    ? `${p.estoque} — Estoque baixo`
    : `${p.estoque} — Disponível`}
                    </span>
                  </td>
                  <td>{p.destaque ? "⭐" : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: ".4rem" }}>
                      <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} onClick={() => editar(p)}>
                        ✏
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                        onClick={() => excluir(p.id)}
                        disabled={pending}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {aberto && (
        <div className={styles.overlay} onClick={() => setAberto(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{editando ? "Editar produto" : "Novo produto"}</h3>
              <button className={styles.modalClose} onClick={() => setAberto(false)}>
                ✕
              </button>
            </div>
            <form action={submeter} className={styles.modalBody}>
              <input type="hidden" name="id" defaultValue={editando?.id ?? ""} />
              {erro && <div className={styles.alert} style={{ background: "#fef2f2", color: "#991b1b" }}>{erro}</div>}
              <div className={styles.fg}>
                <label>Nome *</label>
                <input type="text" name="nome" className={styles.fc} required defaultValue={editando?.nome ?? ""} />
              </div>
              <div className={styles.fg}>
                <label>Descrição</label>
                <textarea name="descricao" className={styles.fc} defaultValue={editando?.descricao ?? ""} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".8rem" }}>
                <div className={styles.fg}>
                  <label>Preço (R$)</label>
                  <input
                    type="number"
                    name="preco"
                    className={styles.fc}
                    step="0.01"
                    min="0"
                    defaultValue={editando?.preco ?? ""}
                  />
                </div>
                <div className={styles.fg}>
                  <label>Estoque</label>
                  <input type="number" name="estoque" className={styles.fc} min="0" defaultValue={editando?.estoque ?? ""} />
                </div>
                <div className={styles.fg}>
                  <label>Destaque</label>
                  <select name="destaque" className={styles.fc} defaultValue={editando?.destaque ? "1" : "0"}>
                    <option value="0">Não</option>
                    <option value="1">Sim ⭐</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem" }}>
                <div className={styles.fg}>
                  <label>Categoria</label>
                  <select name="categoria" className={styles.fc} defaultValue={editando?.categoria ?? ""}>
                    <option value="">— Sem categoria —</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.fg}>
                  <label>Porte do cão</label>
                  <select name="porte" className={styles.fc} defaultValue={editando?.porte ?? "Todos"}>
                    {PORTES.map((p) => (
                      <option key={p} value={p}>
                        {p === "Todos" ? "Todos os portes" : p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: ".8rem",
    padding: "1rem",
    margin: ".5rem 0 1rem",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    background: "var(--bg)",
  }}
>
  <div className={styles.fg}>
    <label
      htmlFor="parcelamento_ativo"
      style={{
        display: "flex",
        alignItems: "center",
        gap: ".6rem",
        cursor: "pointer",
      }}
    >
      <input
        id="parcelamento_ativo"
        type="checkbox"
        name="parcelamento_ativo"
        defaultChecked={editando?.parcelamento_ativo ?? false}
        style={{ accentColor: "var(--p600)" }}
      />
      Permitir parcelamento neste produto
    </label>
    <small style={{ color: "var(--muted)" }}>
      Ative apenas para produtos que terão parcelamento.
    </small>
  </div>

  <div className={styles.fg}>
    <label htmlFor="parcelamento_maximo">
      Quantidade máxima de parcelas
    </label>
    <select
      id="parcelamento_maximo"
      name="parcelamento_maximo"
      className={styles.fc}
      defaultValue={editando?.parcelamento_maximo ?? 3}
    >
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>
          {n}x {n === 1 ? "parcela" : "parcelas"}
        </option>
      ))}
    </select>
  </div>

  <div className={styles.fg}>
    <label htmlFor="desconto_percentual">
      Desconto do produto (%)
    </label>
    <input
      id="desconto_percentual"
      name="desconto_percentual"
      type="number"
      className={styles.fc}
      min="0"
      max="90"
      step="0.5"
      defaultValue={editando?.desconto_percentual ?? 0}
      required
    />
    <small style={{ color: "var(--muted)" }}>
      Use 0 para não oferecer desconto. Máximo de 90%.
    </small>
  </div>
</div>

<div className={styles.fg}>
  <label>Fotos do produto (uma URL por linha)</label>
  <textarea
    name="imagem"
    className={styles.fc}
    rows={4}
    placeholder={"https://site.com/foto-frente.jpg\nhttps://site.com/foto-lateral.jpg\nhttps://site.com/foto-detalhe.jpg"}
    defaultValue={editando?.imagem ?? ""}
  />
  <small style={{ color: "var(--muted)" }}>
    Cole uma URL por linha. A primeira será a foto principal.
  </small>
</div>

              <div style={{ display: "flex", gap: ".7rem" }}>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`} disabled={pending}>
                  {pending ? "Salvando…" : "Salvar"}
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnOutline}`}
                  style={{ padding: ".72rem 1.2rem" }}
                  onClick={() => setAberto(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
