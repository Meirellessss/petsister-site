
import AreaHeader from "@/components/AreaHeader";
import { createClient } from "@/lib/supabase/server";
import { getMeusAgendamentos, getUsuarioAtual } from "@/lib/queries";
import AgendamentoForm from "./agendamento-form";
import Icon from "@/components/Icon";
import styles from "./agendamentos.module.css";

const DIAS_PADRAO = ["1", "2", "3", "4", "5", "6", "0"];

type ConfiguracaoAgenda = {
  hora_abertura: string;
  hora_fechamento: string;
  intervalo_agendamentos_minutos: number;
  dias_banho_tosa: unknown;
  dias_veterinario: unknown;
};

function normalizarDias(valor: unknown): string[] {
  if (!Array.isArray(valor)) return DIAS_PADRAO;

  return [...new Set(
    valor.filter(
      (dia): dia is string =>
        typeof dia === "string" && DIAS_PADRAO.includes(dia)
    )
  )];
}

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

  const supabase = await createClient();

  const [
    agendamentos,
    resultadoAgenda,
  ] = await Promise.all([
    getMeusAgendamentos(usuario.id),
    supabase.rpc("petsister_agenda_config_publica"),
  ]);

  const registro = (
    resultadoAgenda.error ? undefined : resultadoAgenda.data?.[0]
  ) as ConfiguracaoAgenda | undefined;

  const validarHora = (valor: unknown, padrao: string) =>
    typeof valor === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(valor)
      ? valor
      : padrao;

  const intervaloSalvo = Number(
    registro?.intervalo_agendamentos_minutos ?? 30
  );

  const configuracao = {
    horaAbertura: validarHora(registro?.hora_abertura, "08:00"),
    horaFechamento: validarHora(registro?.hora_fechamento, "18:00"),
    intervaloMinutos: [10, 15, 20, 30, 60].includes(intervaloSalvo)
      ? intervaloSalvo
      : 30,
    diasBanhoTosa: normalizarDias(registro?.dias_banho_tosa),
    diasVeterinario: normalizarDias(registro?.dias_veterinario),
  };

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

            <AgendamentoForm configuracao={configuracao} />
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>Meus agendamentos</div>

            {agendamentos.length === 0 ? (
              <div className={styles.empty}>
                Nenhum agendamento ainda.
              </div>
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
                      {new Date(a.data_hora).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {a.pet_raca ? ` · ${a.pet_raca}` : ""}
                    </span>
                  </div>

                  <span
                    className={styles.badge}
                    style={badgeStyle[a.status]}
                  >
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
