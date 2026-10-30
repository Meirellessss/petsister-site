import { createClient } from "@/lib/supabase/server";
import BannersClient from "./banners-client";
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
  atualizado_em?: string;
};

export default async function BannersAdminPage() {
  const supabase = await createClient();

  const { data: banners, error } = await supabase
    .from("petsister_banners")
    .select("*")
    .order("ordem", { ascending: true })
    .order("criado_em", { ascending: false });

  return (
    <>
      <div className={styles.topbar}>
        <h2>Banners e anúncios</h2>
      </div>

      <div className={styles.content}>
        {error ? (
          <div
            className={`${styles.alert} ${styles.aInfo}`}
            role="alert"
          >
            Não foi possível carregar os banners. Verifique a tabela
            petsister_banners e as permissões do Supabase.
          </div>
        ) : null}

        <BannersClient
          banners={(banners ?? []) as Banner[]}
        />
      </div>
    </>
  );
}
