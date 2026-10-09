
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AreaHeader from "@/components/AreaHeader";
import PerfilForm from "./perfil-form";
import styles from "./perfil.module.css";

export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil, error } = await supabase
    .from("petsister_profiles")
    .select(
      "nome, telefone, cep, rua, numero, complemento, bairro, cidade, estado"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar perfil:", error);
  }

  return (
    <>
      <AreaHeader />

      <main className={styles.page}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>
            <span aria-hidden="true">🐾</span>
            SUA CONTA PETSISTER
          </span>

          <h1 className={styles.title}>Meu Perfil</h1>

          <p className={styles.subtitle}>
            Mantenha seus dados atualizados para facilitar suas
            compras e receber seus pedidos no endereço correto.
          </p>
        </div>

        <PerfilForm
          email={user.email ?? ""}
          perfil={perfil}
        />
      </main>
    </>
  );
}
