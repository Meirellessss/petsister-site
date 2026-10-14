
import { createClient } from "@/lib/supabase/server";
import type { Categoria, Produto } from "@/lib/types";
import ProdutosClient from "./produtos-client";
import styles from "../admin.module.css";

export default async function ProdutosAdminPage() {
  const supabase = await createClient();

  const [
    { data: produtos },
    { data: registroConfig },
    { data: categorias },
  ] = await Promise.all([
    supabase
      .from("petsister_produtos")
      .select("*")
      .order("categoria")
      .order("nome"),

    supabase
      .from("petsister_configuracoes")
      .select("configuracoes")
      .eq("id", "global")
      .maybeSingle(),

    supabase
      .from("petsister_categorias")
      .select("*")
      .order("nome"),
  ]);

  const dadosConfig = registroConfig?.configuracoes;

  const configObj =
    dadosConfig &&
    typeof dadosConfig === "object" &&
    !Array.isArray(dadosConfig)
      ? (dadosConfig as Record<string, unknown>)
      : {};

  const valorLimiteEstoque = Number(
    configObj.estoque_limite_baixo ?? 8
  );

  const limiteEstoqueBaixo =
    Number.isInteger(valorLimiteEstoque) &&
    valorLimiteEstoque >= 0 &&
    valorLimiteEstoque <= 10000
      ? valorLimiteEstoque
      : 8;

  return (
    <>
      <div className={styles.topbar}>
        <h2>Produtos</h2>
      </div>

      <div className={styles.content}>
        <ProdutosClient
          produtos={(produtos as Produto[]) ?? []}
          categorias={(categorias as Categoria[]) ?? []}
          limiteEstoqueBaixo={limiteEstoqueBaixo}
        />
      </div>
    </>
  );
}
