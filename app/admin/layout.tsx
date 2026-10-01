import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/queries";
import Sidebar from "./sidebar";
import styles from "./admin.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.profile.perfil !== "admin") redirect("/");

  return (
    <div className={styles.wrap}>
      <Sidebar nome={usuario.profile.nome || usuario.email} />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
