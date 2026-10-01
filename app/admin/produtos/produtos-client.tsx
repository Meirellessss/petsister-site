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
}: {
  produtos: Produto[];
  categorias: Categoria[];
}) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const router = useRouter();

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
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                    Nenhum produto cadastrado
                  </td>
                </tr>
              )}
              {produtos.map((p) => (
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
                        p.estoque <= 5
                          ? { background: "#fef2f2", color: "#991b1b" }
                          : { background: "#f0fdf4", color: "#166534" }
                      }
                    >
                      {p.estoque}
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
              <div className={styles.fg}>
                <label>URL da imagem</label>
                <input type="text" name="imagem" className={styles.fc} placeholder="https://…" defaultValue={editando?.imagem ?? ""} />
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
