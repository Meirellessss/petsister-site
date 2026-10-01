import { createClient } from "@/lib/supabase/server";
import type { Categoria, Produto } from "@/lib/types";
import ProdutosClient from "./produtos-client";
import styles from "../admin.module.css";

export default async function ProdutosAdminPage() {
  const supabase = await createClient();
  const { data: produtos } = await supabase
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
        <ProdutosClient produtos={(produtos as Produto[]) ?? []} categorias={(categorias as Categoria[]) ?? []} />
      </div>
    </>
  );
}
