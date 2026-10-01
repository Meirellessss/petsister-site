"use client";

import { useActionState } from "react";
import { criarAgendamento } from "./actions";
import styles from "./agendamentos.module.css";

const SERVICOS = ["Banho", "Tosa", "Banho e Tosa", "Consulta Veterinária", "Vacinação", "Adestramento"];

export default function AgendamentoForm() {
  const [state, formAction, pending] = useActionState(criarAgendamento, undefined);
  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <form action={formAction} className={styles.formBody}>
      {state?.sucesso && <div className={styles.alertOk}>✓ Agendado com sucesso!</div>}
      {state?.erro && <div className={styles.alertErr}>⚠ {state.erro}</div>}
      <div className={styles.fg}>
        <label>Serviço *</label>
        <select name="servico" required defaultValue="">
          <option value="">Selecione…</option>
          {SERVICOS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem" }}>
        <div className={styles.fg}>
          <label>Nome do pet</label>
          <input type="text" name="pet_nome" placeholder="Ex: Thor" />
        </div>
        <div className={styles.fg}>
          <label>Raça</label>
          <input type="text" name="pet_raca" placeholder="Ex: Labrador" />
        </div>
      </div>
      <div className={styles.fg}>
        <label>Porte do cão</label>
        <select name="pet_porte" defaultValue="Medio">
          <option value="Pequeno">Pequeno (até 10kg)</option>
          <option value="Medio">Médio (10–25kg)</option>
          <option value="Grande">Grande (acima de 25kg)</option>
        </select>
      </div>
      <div className={styles.fg}>
        <label>Data e hora *</label>
        <input type="datetime-local" name="data_hora" required min={minDate} />
      </div>
      <div className={styles.fg}>
        <label>Observações</label>
        <textarea name="observacoes" placeholder="Tamanho, temperamento, preferências…" />
      </div>
      <button type="submit" className={styles.btnFull} disabled={pending}>
        {pending ? "Agendando…" : "Agendar →"}
      </button>
    </form>
  );
}
