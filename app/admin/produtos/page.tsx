import { createClient } from "@/lib/supabase/server";
import type { Categoria, Produto } from "@/lib/types";
import ProdutosClient from "./produtos-client";
import styles from "../admin.module.css";

export default async function ProdutosAdminPage() {
  const supabase = await createClient();
  const { data: produtos } = await supabase
    
const { data: registroConfig } = await supabase
  .from("petsister_configuracoes")
  .select("configuracoes")
  .eq("id", "global")
  .maybeSingle();

const dadosConfig = registroConfig?.configuracoes;

const configObj =
  dadosConfig &&
  typeof dadosConfig === "object" &&
  !Array.isArray(dadosConfig)
    ? dadosConfig as Record<string, unknown>
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

    .from("petsister_produtos")
    .select("*")
    .order("categoria")
    .order("nome");
  const { data: categorias } = await supabase.from("petsister_categorias").select("*").order("nome");

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
