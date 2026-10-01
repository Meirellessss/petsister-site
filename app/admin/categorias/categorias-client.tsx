"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Categoria } from "@/lib/types";
import { excluirCategoria, salvarCategoria } from "../actions";
import Icon from "@/components/Icon";
import styles from "../admin.module.css";

export default function CategoriasClient({
  categorias,
  contagem,
}: {
  categorias: Categoria[];
  contagem: Record<string, number>;
}) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const router = useRouter();

  function novo() {
    setEditando(null);
    setErro("");
    setAberto(true);
  }

  function editar(c: Categoria) {
    setEditando(c);
    setErro("");
    setAberto(true);
  }

  function excluir(id: number) {
    if (!confirm("Excluir categoria? Produtos já cadastrados nela manterão o nome, mas ela some da vitrine.")) return;
    startTransition(async () => {
      await excluirCategoria(id);
      router.refresh();
    });
  }

  function submeter(formData: FormData) {
    startTransition(async () => {
      const res = await salvarCategoria(formData);
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
          <h3>Categorias</h3>
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={novo}>
            + Nova categoria
          </button>
        </div>
        <div className={styles.tw}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Ícone</th>
                <th>Nome</th>
                <th>Produtos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                    Nenhuma categoria cadastrada
                  </td>
                </tr>
              )}
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <Icon name={c.icone} size={20} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.nome}</td>
                  <td>
                    <span className={styles.badge} style={{ background: "var(--p50)", color: "var(--p700)" }}>
                      {contagem[c.nome] ?? 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: ".4rem" }}>
                      <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} onClick={() => editar(c)}>
                        ✏
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                        onClick={() => excluir(c.id)}
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
              <h3>{editando ? "Editar categoria" : "Nova categoria"}</h3>
              <button className={styles.modalClose} onClick={() => setAberto(false)}>
                ✕
              </button>
            </div>
            <form action={submeter} className={styles.modalBody}>
              <input type="hidden" name="id" defaultValue={editando?.id ?? ""} />
              {erro && <div className={styles.alert} style={{ background: "#fef2f2", color: "#991b1b" }}>{erro}</div>}
              <div className={styles.fg}>
                <label>Nome *</label>
                <input type="text" name="nome" className={styles.fc} required placeholder="Ex: Ração" defaultValue={editando?.nome ?? ""} />
              </div>
              <div className={styles.fg}>
                <label>Ícone</label>
                <input type="text" name="icone" className={styles.fc} placeholder="racao" defaultValue={editando?.icone ?? ""} />
                <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: "-.2rem" }}>
                  Nome de um ícone do sistema: cao, gato, racao, farmacia, higiene, conforto, brinquedos, passeio,
                  petiscos…
                </p>
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
