"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { excluirBanner, salvarBanner } from "../actions";
import styles from "../admin.module.css";

type Banner = {
  id: number;
  tipo: "principal" | "anuncio";
  titulo: string;
  descricao: string;
  etiqueta: string;
  imagem_url: string;
  texto_botao: string;
  link_destino: string;
  ordem: number;
  ativo: boolean;
  criado_em?: string;
};

type FormularioBanner = {
  id?: number;
  tipo: "principal" | "anuncio";
  titulo: string;
  descricao: string;
  etiqueta: string;
  imagem_url: string;
  texto_botao: string;
  link_destino: string;
  ordem: number;
  ativo: boolean;
};

const FORM_VAZIO: FormularioBanner = {
  tipo: "anuncio",
  titulo: "",
  descricao: "",
  etiqueta: "",
  imagem_url: "",
  texto_botao: "Ver produtos",
  link_destino: "/produtos",
  ordem: 1,
  ativo: true,
};

export default function BannersClient({
  banners,
}: {
  banners: Banner[];
}) {
  const router = useRouter();
  const inputImagem = useRef<HTMLInputElement>(null);

  const [formulario, setFormulario] =
    useState<FormularioBanner>(FORM_VAZIO);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const bannerPrincipal = banners.find((banner) => banner.tipo === "principal");

  function atualizar<K extends keyof FormularioBanner>(
    campo: K,
    valor: FormularioBanner[K]
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function novoBanner() {
    setFormulario(FORM_VAZIO);
    setEditando(false);
    setErro("");
    setSucesso("");
    inputImagem.current?.focus();
  }

  function cadastrarOuEditarBannerPrincipal() {
    if (bannerPrincipal) {
      editarBanner(bannerPrincipal);
      return;
    }

    setFormulario({
      ...FORM_VAZIO,
      tipo: "principal",
      titulo: "Tudo para o seu pet em um só lugar.",
      descricao: "O cuidado que ele merece, pertinho de você. 🐾",
      etiqueta: "RAÇÕES • CÃES E GATOS • FARMÁCIA VETERINÁRIA • ACESSÓRIOS",
      imagem_url: "/logo.jpg",
      texto_botao: "Ver produtos",
      link_destino: "/produtos",
      ordem: 1,
      ativo: true,
    });
    setEditando(false);
    setErro("");
    setSucesso("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editarBanner(banner: Banner) {
    setFormulario({
      id: banner.id,
      tipo: banner.tipo === "principal" ? "principal" : "anuncio",
      titulo: banner.titulo,
      descricao: banner.descricao ?? "",
      etiqueta: banner.etiqueta ?? "",
      imagem_url: banner.imagem_url,
      texto_botao: banner.texto_botao || "Ver produtos",
      link_destino: banner.link_destino || "/produtos",
      ordem: Math.max(1, banner.ordem ?? 1),
      ativo: banner.ativo,
    });
    setEditando(true);
    setErro("");
    setSucesso("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function enviarImagem(arquivo?: File) {
    if (!arquivo) return;

    setErro("");
    setSucesso("");

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro("Use uma imagem JPG, PNG ou WebP.");
      return;
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 10 MB.");
      return;
    }

    setEnviandoImagem(true);

    try {
      const supabase = createClient();

      const nomeSeguro = arquivo.name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "-");

      const caminho = `${Date.now()}-${nomeSeguro}`;

      const { data, error: erroUpload } = await supabase.storage
        .from("petsister-banners")
        .upload(caminho, arquivo, {
          contentType: arquivo.type,
          upsert: false,
        });

      if (erroUpload) {
        setErro(
          "Não foi possível enviar a imagem: " + erroUpload.message
        );
        return;
      }

      const { data: urlPublica } = supabase.storage
        .from("petsister-banners")
        .getPublicUrl(data.path);

      atualizar("imagem_url", urlPublica.publicUrl);
      setSucesso("Imagem enviada. Salve o banner para confirmar.");
    } catch {
      setErro("Ocorreu um erro ao enviar a imagem.");
    } finally {
      setEnviandoImagem(false);
    }
  }

  async function salvar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setSucesso("");

    if (!formulario.titulo.trim()) {
      setErro("Informe o título do banner.");
      return;
    }

    if (!formulario.imagem_url.trim()) {
      setErro("Envie uma imagem ou informe sua URL.");
      return;
    }

    const dados = new FormData();
    dados.set("id", formulario.id?.toString() ?? "");
    dados.set("tipo", formulario.tipo);
    dados.set("titulo", formulario.titulo);
    dados.set("descricao", formulario.descricao);
    dados.set("etiqueta", formulario.etiqueta);
    dados.set("imagem_url", formulario.imagem_url);
    dados.set("texto_botao", formulario.texto_botao);
    dados.set("link_destino", formulario.link_destino);
    dados.set("ordem", formulario.ordem.toString());
    dados.set("ativo", String(formulario.ativo));

    setSalvando(true);

    try {
      const resultado = await salvarBanner(dados);

      if (!resultado.ok) {
        setErro(resultado.error);
        return;
      }

      setSucesso("Banner salvo com sucesso!");
      setFormulario(FORM_VAZIO);
      setEditando(false);
      router.refresh();
    } catch {
      setErro("Não foi possível salvar o banner. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(banner: Banner) {
    const confirmar = window.confirm(
      banner.tipo === "principal"
        ? `Deseja desativar o banner principal "${banner.titulo}"? Ele poderá ser reativado depois.`
        : `Deseja realmente excluir o banner "${banner.titulo}"?`
    );

    if (!confirmar) return;

    setErro("");
    setSucesso("");

    try {
      const resultado = await excluirBanner(banner.id);

      if (!resultado.ok) {
        setErro(resultado.error);
        return;
      }

      setSucesso(
        banner.tipo === "principal"
          ? "Banner principal desativado. Você pode reativá-lo ao editar o banner."
          : "Banner excluído com sucesso."
      );
      if (formulario.id === banner.id) {
        setFormulario(FORM_VAZIO);
        setEditando(false);
      }
      router.refresh();
    } catch {
      setErro("Não foi possível excluir o banner.");
    }
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h3>
            {editando
              ? formulario.tipo === "principal"
                ? "Editar banner principal"
                : "Editar banner"
              : formulario.tipo === "principal"
                ? "Cadastrar banner principal"
                : "Novo banner"}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={cadastrarOuEditarBannerPrincipal}
            >
              {bannerPrincipal ? "Editar banner principal" : "Cadastrar banner principal original"}
            </button>
          {editando && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={novoBanner}
            >
              Cancelar edição
            </button>
          )}
          </div>
        </div>

        <form
          onSubmit={salvar}
          style={{
            padding: "1.25rem",
            display: "grid",
            gap: "1rem",
          }}
        >
          <p style={{ margin: 0, color: "var(--muted)", fontSize: ".85rem" }}>
            Tipo: <strong>{formulario.tipo === "principal" ? "Banner principal original da PetSister" : "Anúncio do carrossel"}</strong>
          </p>
          <div className={styles.grid2}>
            <label>
              <span className={styles.label}>Título *</span>
              <input
                className={styles.fc}
                value={formulario.titulo}
                onChange={(e) => atualizar("titulo", e.target.value)}
                maxLength={140}
                required
              />
            </label>

            <label>
              <span className={styles.label}>Etiqueta</span>
              <input
                className={styles.fc}
                placeholder="Ex.: Novidade ou Ofertas"
                value={formulario.etiqueta}
                onChange={(e) => atualizar("etiqueta", e.target.value)}
                maxLength={50}
              />
            </label>
          </div>

          <label>
            <span className={styles.label}>Descrição</span>
            <textarea
              className={styles.fc}
              rows={3}
              value={formulario.descricao}
              onChange={(e) => atualizar("descricao", e.target.value)}
              maxLength={400}
            />
          </label>

          <div className={styles.grid2}>
            <label>
              <span className={styles.label}>Texto do botão</span>
              <input
                className={styles.fc}
                value={formulario.texto_botao}
                onChange={(e) => atualizar("texto_botao", e.target.value)}
                maxLength={40}
              />
            </label>

            <label>
              <span className={styles.label}>Destino do botão *</span>
              <input
                className={styles.fc}
                value={formulario.link_destino}
                onChange={(e) => atualizar("link_destino", e.target.value)}
                placeholder="/produtos"
                required
              />
            </label>
          </div>

          <label>
            <span className={styles.label}>Imagem do banner *</span>
            <input
              className={styles.fc}
              value={formulario.imagem_url}
              onChange={(e) => atualizar("imagem_url", e.target.value)}
              placeholder="URL da imagem ou envie um arquivo abaixo"
              required
            />
          </label>

          <label>
            <span className={styles.label}>Enviar imagem (JPG, PNG ou WebP, até 10 MB)</span>
            <input
              ref={inputImagem}
              className={styles.fc}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={enviandoImagem}
              onChange={(e) => {
                const arquivo = e.target.files?.[0];
                void enviarImagem(arquivo);
                e.currentTarget.value = "";
              }}
            />
          </label>

          {formulario.imagem_url && (
            <div
              style={{
                padding: ".75rem",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                background: "#fff5eb",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#0f1e4a",
                  fontSize: ".8rem",
                  fontWeight: 700,
                  marginBottom: ".5rem",
                }}
              >
                Prévia do banner
              </span>
              <img
                src={formulario.imagem_url}
                alt="Prévia do banner"
                style={{
                  display: "block",
                  width: "100%",
                  maxHeight: "220px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}

          <div className={styles.grid2}>
            <label>
              <span className={styles.label}>Ordem de exibição</span>
              <input
                className={styles.fc}
                type="number"
                min={1}
                max={10000}
                step={1}
                value={formulario.ordem}
                onChange={(e) =>
                  atualizar("ordem", Number(e.target.value))
                }
              />
            </label>

            <label>
              <span className={styles.label}>Status</span>
              <select
                className={styles.fc}
                value={String(formulario.ativo)}
                onChange={(e) =>
                  atualizar("ativo", e.target.value === "true")
                }
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </label>
          </div>

          {erro && (
            <p role="alert" style={{ color: "#b91c1c" }}>
              {erro}
            </p>
          )}

          {sucesso && (
            <p role="status" style={{ color: "#166534" }}>
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={salvando || enviandoImagem}
          >
            {enviandoImagem
              ? "Enviando imagem..."
              : salvando
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar banner"}
          </button>
        </form>
      </div>

      <div className={styles.card} style={{ marginTop: "1.25rem" }}>
        <div className={styles.cardHead}>
          <h3>Banners cadastrados ({banners.length})</h3>
        </div>

        {banners.length === 0 ? (
          <p style={{ padding: "1.25rem", color: "var(--muted)" }}>
            Nenhum banner cadastrado ainda. Use o formulário acima para criar
            o primeiro anúncio da PetSister.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
            {banners.map((banner) => (
              <article
                key={banner.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(100px, 180px) minmax(0, 1fr)",
                  gap: "1rem",
                  alignItems: "center",
                  padding: ".85rem",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                }}
              >
                <img
                  src={banner.imagem_url}
                  alt={banner.titulo}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "contain",
                    background: "#fff5eb",
                    borderRadius: "8px",
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <strong>{banner.titulo}</strong>
                  <p style={{ marginTop: ".25rem", color: banner.tipo === "principal" ? "#0f1e4a" : "#c45b25", fontWeight: 700, fontSize: ".8rem" }}>
                    {banner.tipo === "principal" ? "Banner principal" : "Anúncio"}
                  </p>
                  {banner.etiqueta && (
                    <p style={{ marginTop: ".25rem", color: "#c45b25" }}>
                      {banner.etiqueta}
                    </p>
                  )}
                  <p
                    style={{
                      marginTop: ".4rem",
                      color: "var(--muted)",
                      fontSize: ".85rem",
                    }}
                  >
                    {banner.ativo ? "Ativo" : "Inativo"} · Ordem{" "}
                    {banner.ordem}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: ".5rem",
                      marginTop: ".65rem",
                    }}
                  >
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                      onClick={() => editarBanner(banner)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                      onClick={() => void remover(banner)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
