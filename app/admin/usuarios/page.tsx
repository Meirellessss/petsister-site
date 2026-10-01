import { createClient } from "@/lib/supabase/server";
import type { AdminUsuarioRow } from "@/lib/types";
import styles from "../admin.module.css";

export default async function UsuariosAdminPage() {
  const supabase = await createClient();
  const { data: usuarios } = await supabase.rpc("petsister_admin_usuarios");
  const lista = (usuarios ?? []) as AdminUsuarioRow[];

  return (
    <>
      <div className={styles.topbar}>
        <h2>Clientes</h2>
        <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>{lista.length} usuários</span>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.tw}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Pedidos</th>
                  <th>Total gasto</th>
                  <th>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: u.perfil === "admin" ? "var(--p600)" : "var(--p100)",
                            color: u.perfil === "admin" ? "#fff" : "var(--p700)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: ".75rem",
                          }}
                        >
                          {(u.nome || "?").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.nome || "—"}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{u.email}</td>
                    <td>
                      <span
                        className={styles.badge}
                        style={
                          u.perfil === "admin"
                            ? { background: "var(--p100)", color: "var(--p700)" }
                            : { background: "#f3f4f6", color: "#6b7280" }
                        }
                      >
                        {u.perfil}
                      </span>
                    </td>
                    <td>{u.total_pedidos}</td>
                    <td style={{ fontWeight: 700, color: "var(--p700)" }}>
                      R$ {Number(u.total_gasto).toFixed(2).replace(".", ",")}
                    </td>
                    <td style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                      {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
