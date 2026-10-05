"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PortePet } from "@/lib/types";

const PORTES: PortePet[] = ["Pequeno", "Medio", "Grande"];

const SERVICOS_BANHO_TOSA = [
  "Banho",
  "Tosa",
  "Banho e Tosa",
];

const SERVICOS_VETERINARIO = [
  "Consulta Veterinária",
  "Vacinação",
];

const HORARIOS = Array.from({ length: 21 }, (_, index) => {
  const minutos = 8 * 60 + index * 30;
  const hora = Math.floor(minutos / 60);
  const minuto = minutos % 60;

  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
});

function obterCategoriaServico(servico: string) {
  if (SERVICOS_BANHO_TOSA.includes(servico)) {
    return "banho_tosa";
  }

  if (SERVICOS_VETERINARIO.includes(servico)) {
    return "veterinario";
  }

  return "outro";
}

export async function obterHorariosOcupados(
  data: string,
  categoria: "banho_tosa" | "veterinario",
): Promise<string[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const inicio = `${data}T08:00`;
  const fim = `${data}T18:00`;

  const { data: registros, error } = await supabase
    .from("petsister_agendamentos")
    .select("data_hora, servico, status")
    .gte("data_hora", inicio)
    .lte("data_hora", fim);

  if (error || !registros) {
    return [];
  }

  return registros
    .filter((registro) => {
      if (registro.status === "cancelado") {
        return false;
      }

      return (
        obterCategoriaServico(registro.servico) === categoria
      );
    })
    .map((registro) => {
      return String(registro.data_hora).slice(11, 16);
    })
    .filter((horario) => HORARIOS.includes(horario));
}

export async function criarAgendamento(
  _prev: { erro?: string; sucesso?: boolean } | undefined,
  formData: FormData,
): Promise<{ erro?: string; sucesso?: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Não autenticado." };
  }

  const servico = String(formData.get("servico") ?? "").trim();
  const dataHora = String(formData.get("data_hora") ?? "").trim();
  const petNome = String(formData.get("pet_nome") ?? "").trim();
  const petRaca = String(formData.get("pet_raca") ?? "").trim();
  const observacoes = String(
    formData.get("observacoes") ?? "",
  ).trim();

  const petPorteRaw = String(
    formData.get("pet_porte") ?? "",
  );

  const petPorte: PortePet = PORTES.includes(
    petPorteRaw as PortePet,
  )
    ? (petPorteRaw as PortePet)
    : "Medio";

  if (!servico || !dataHora) {
    return {
      erro: "Preencha o serviço e o horário.",
    };
  }

  const [data, horario] = dataHora.split("T");

  if (!data || !horario) {
    return {
      erro: "Horário inválido.",
    };
  }

  if (!HORARIOS.includes(horario)) {
    return {
      erro: "Escolha um horário entre 08:00 e 18:00, de 30 em 30 minutos.",
    };
  }

  const categoria = obterCategoriaServico(servico);

  if (categoria === "outro") {
    return {
      erro: "Serviço inválido.",
    };
  }

  // Verifica no servidor se o horário já está ocupado
  // dentro da mesma categoria.
  const inicio = `${data}T${horario}`;
  const fim = `${data}T${horario}:59`;

  const { data: existentes, error: consultaError } =
    await supabase
      .from("petsister_agendamentos")
      .select("data_hora, servico, status")
      .gte("data_hora", inicio)
      .lte("data_hora", fim);

  if (consultaError) {
    return {
      erro: "Não foi possível verificar o horário.",
    };
  }

  const horarioOcupado = (existentes ?? []).some(
    (registro) => {
      if (registro.status === "cancelado") {
        return false;
      }

      return (
        obterCategoriaServico(registro.servico) ===
        categoria
      );
    },
  );

  if (horarioOcupado) {
    return {
      erro:
        "Esse horário já está ocupado. Escolha outro horário.",
    };
  }

  const { error } = await supabase
    .from("petsister_agendamentos")
    .insert({
      usuario_id: user.id,
      servico,
      pet_nome: petNome || null,
      pet_raca: petRaca || null,
      pet_porte: petPorte,
      data_hora: dataHora,
      observacoes: observacoes || null,
    });

  if (error) {
    return {
      erro:
        "Não foi possível agendar. Tente novamente.",
    };
  }

  revalidatePath("/agendamentos");

  return {
    sucesso: true,
  };
}
