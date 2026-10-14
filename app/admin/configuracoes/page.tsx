
import { createClient } from "@/lib/supabase/server";
import styles from "../admin.module.css";
import ConfiguracoesForm from "./configuracoes-form";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("petsister_configuracoes")
    .select("configuracoes, atualizado_em")
    .eq("id", "global")
    .maybeSingle();

  if (error || !data) {
    return (
      <>
        <div className={styles.topbar}>
          <h2>Configurações</h2>
        </div>
        <div className={styles.content}>
          <div className={styles.card} style={{ padding: "1.5rem" }}>
            <h3>Não foi possível carregar as configurações</h3>
            <p style={{ marginTop: "0.8rem", color: "var(--muted)" }}>
              {error?.message ??
                "O registro global não foi encontrado no Supabase."}
            </p>
            <p style={{ marginTop: "0.8rem", color: "var(--muted)" }}>
              Confira as permissões da tabela e se existe um registro com
              identificador global.
            </p>
          </div>
        </div>
      </>
    );
  }

  const valores =
    typeof data.configuracoes === "object" &&
    data.configuracoes !== null &&
    !Array.isArray(data.configuracoes)
      ? (data.configuracoes as Record<string, unknown>)
      : {};

  const limiteSalvo = Number(valores.estoque_limite_baixo ?? 8);

  const limiteInicial =
    Number.isInteger(limiteSalvo) && limiteSalvo >= 0
      ? limiteSalvo
      : 8;

  return (
    <>
      <div className={styles.topbar}>
        <div>
          <h2>Configurações</h2>
        </div>
      </div>

      <div className={styles.content}>
        <div style={{ marginBottom: "1.5rem" }}>
          <span
            style={{
              color: "var(--p600)",
              fontSize: ".7rem",
              fontWeight: 800,
              letterSpacing: ".12em",
            }}
          >
            PERSONALIZE SUA LOJA
          </span>

          <h1
            style={{
              marginTop: ".4rem",
              color: "var(--ink)",
              fontSize: "1.6rem",
              fontWeight: 850,
            }}
          >
            Configurações da PetSister
          </h1>

          <p
            style={{
              marginTop: ".5rem",
              color: "var(--muted)",
              fontSize: ".9rem",
              lineHeight: 1.6,
            }}
          >
            Ajuste as regras da loja em um só lugar, sem precisar editar
            o código para cada mudança.
          </p>
        </div>

        <ConfiguracoesForm limiteInicial={limiteInicial} />

        <p
          style={{
            marginTop: "1rem",
            color: "var(--muted)",
            fontSize: ".78rem",
          }}
        >
          As alterações ficam salvas no Supabase.
        </p>
      </div>
    </>
  );
}
