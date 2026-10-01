import { createClient } from "@/lib/supabase/server";
import type { AdminUsuarioRow, Agendamento, StatusAgendamento } from "@/lib/types";
import AgendamentosClient from "./agendamentos-client";
import styles from "../admin.module.css";

export default async function AgendamentosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { status } = await searchParams;

  let query = supabase.from("petsister_agendamentos").select("*").order("data_hora", { ascending: true });
  if (status) query = query.eq("status", status as StatusAgendamento);
  const { data: agendamentos } = await query;

  const { data: usuarios } = await supabase.rpc("petsister_admin_usuarios");
  const infoUsuario = Object.fromEntries(
    ((usuarios ?? []) as AdminUsuarioRow[]).map((u) => [u.id, { nome: u.nome, email: u.email }]),
  );

  return (
    <>
      <div className={styles.topbar}>
        <h2>Agendamentos</h2>
        <div style={{ display: "flex", gap: ".4rem" }}>
          {[
            ["", "Todos"],
            ["agendado", "Agendados"],
            ["concluido", "Concluídos"],
            ["cancelado", "Cancelados"],
          ].map(([v, l]) => (
            <a
              key={v}
              href={`/admin/agendamentos${v ? `?status=${v}` : ""}`}
              className={`${styles.btn} ${styles.btnSm} ${(status ?? "") === v ? styles.btnPrimary : styles.btnOutline}`}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <AgendamentosClient agendamentos={(agendamentos as Agendamento[]) ?? []} infoUsuario={infoUsuario} />
      </div>
    </>
  );
}
