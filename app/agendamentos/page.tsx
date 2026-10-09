import AreaHeader from "@/components/AreaHeader";
import Link from "next/link";
import { getMeusAgendamentos, getUsuarioAtual } from "@/lib/queries";
import AgendamentoForm from "./agendamento-form";
import Icon from "@/components/Icon";
import styles from "./agendamentos.module.css";

const ICONES: Record<string, string> = {
  Banho: "banho",
  Tosa: "tosa",
  "Banho e Tosa": "banho",
  "Consulta Veterinária": "veterinario",
  Vacinação: "vacina",
  Adestramento: "adestramento",
};

const badgeStyle: Record<string, { background: string; color: string }> = {
  agendado: { background: "#fff7ed", color: "#c2410c" },
  concluido: { background: "#f0fdf4", color: "#166534" },
  cancelado: { background: "#fef2f2", color: "#991b1b" },
};

export default async function AgendamentosPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) return null;

  const agendamentos = await getMeusAgendamentos(usuario.id);

  return (
    <div>
      <AreaHeader />
      <div className={styles.page}>
        <div className={styles.ph}>
          <h1>Agendamentos</h1>
          <p>Marque banho, tosa, consulta e muito mais para o seu pet.</p>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardHead}>Novo agendamento</div>
            <AgendamentoForm />
          </div>
          <div className={styles.card}>
            <div className={styles.cardHead}>Meus agendamentos</div>
            {agendamentos.length === 0 ? (
              <div className={styles.empty}>Nenhum agendamento ainda.</div>
            ) : (
              agendamentos.map((a) => (
                <div className={styles.agItem} key={a.id}>
                  <div className={styles.agIcon}>
                    <Icon name={ICONES[a.servico] ?? "agendar"} size={20} />
                  </div>
                  <div className={styles.agInfo}>
                    <strong>
                      {a.servico}
                      {a.pet_nome ? ` — ${a.pet_nome}` : ""}
                    </strong>
                    <span>
                      {new Date(a.data_hora).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(a.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      {a.pet_raca ? ` · ${a.pet_raca}` : ""}
                    </span>
                  </div>
                  <span className={styles.badge} style={badgeStyle[a.status]}>
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
