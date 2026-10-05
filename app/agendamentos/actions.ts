"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PortePet } from "@/lib/types";

const PORTES: PortePet[] = ["Pequeno", "Medio", "Grande"];

export async function criarAgendamento(
  _prev: { erro?: string; sucesso?: boolean } | undefined,
  formData: FormData,
): Promise<{ erro?: string; sucesso?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Não autenticado" };

  const servico = String(formData.get("servico") ?? "").trim();
  const dataHora = String(formData.get("data_hora") ?? "").trim();
  const petNome = String(formData.get("pet_nome") ?? "").trim();
  const petRaca = String(formData.get("pet_raca") ?? "").trim();
  const observacoes = String(formData.get("observacoes") ?? "").trim();
  const petPorteRaw = String(formData.get("pet_porte") ?? "");
  const petPorte: PortePet = PORTES.includes(petPorteRaw as PortePet) ? (petPorteRaw as PortePet) : "Medio";

  if (!servico || !dataHora) return { erro: "Preencha serviço e data." };
const partesDataHora = dataHora.split("T");
const horario = partesDataHora[1] ?? "";

const [hora, minuto] = horario.split(":").map(Number);

if (
  Number.isNaN(hora) ||
  Number.isNaN(minuto) ||
  hora < 8 ||
  hora > 18 ||
  (hora === 18 && minuto > 0)
) {
  return {
    erro: "Os agendamentos podem ser feitos somente entre 08:00 e 18:00.",
  };
}
  const { error } = await supabase.from("petsister_agendamentos").insert({
    usuario_id: user.id,
    servico,
    pet_nome: petNome || null,
    pet_raca: petRaca || null,
    pet_porte: petPorte,
    data_hora: dataHora,
    observacoes: observacoes || null,
  });

  if (error) return { erro: "Não foi possível agendar. Tente novamente." };

  revalidatePath("/agendamentos");
  return { sucesso: true };
}
