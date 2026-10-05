
import Link from "next/link";
import ForgotPasswordForm from "./form";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  return (
    <div className={styles.body}>
      <div className={styles.box}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.jpg" alt="Pet Sister" />
        </Link>

        <div className={styles.sub}>
          Recupere o acesso à sua conta
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
