import { createClient } from "@/lib/supabase/server";
import type { Categoria } from "@/lib/types";
import CategoriasClient from "./categorias-client";
import styles from "../admin.module.css";

export default async function CategoriasAdminPage() {
  const supabase = await createClient();
  const { data: categorias } = await supabase.from("petsister_categorias").select("*").order("nome");
  const { data: produtos } = await supabase.from("petsister_produtos").select("categoria");

  const contagem: Record<string, number> = {};
  (produtos ?? []).forEach((p) => {
    if (p.categoria) contagem[p.categoria] = (contagem[p.categoria] ?? 0) + 1;
  });

  return (
    <>
      <div className={styles.topbar}>
        <h2>Categorias</h2>
      </div>
      <div className={styles.content}>
        <CategoriasClient categorias={(categorias as Categoria[]) ?? []} contagem={contagem} />
      </div>
    </>
  );
}
