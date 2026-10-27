
import styles from "../admin.module.css";

export default function BannersAdminPage() {
  return (
    <>
      <div className={styles.topbar}>
        <h2>Banners e anúncios</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.card} style={{ padding: "1.5rem" }}>
          <h3>Gerenciar banners da PetSister</h3>
          <p style={{ marginTop: ".75rem", color: "var(--muted)" }}>
            A estrutura da página foi preparada. A interface de cadastro
            e edição será conectada ao Supabase na próxima alteração.
          </p>
        </div>
      </div>
    </>
  );
}

