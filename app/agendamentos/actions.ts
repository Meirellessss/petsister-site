
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PortePet } from "@/lib/types";

const PORTES: PortePet[] = [
  "Pequeno",
  "Medio",
  "Grande",
];

const SERVICOS_BANHO_TOSA = [
  "Banho",
  "Tosa",
  "Banho e Tosa",
];

const SERVICOS_VETERINARIO = [
  "Consulta Veterinária",
  "Vacinação",
];

const DIAS_PADRAO = ["1", "2", "3", "4", "5", "6", "0"];

type ConfiguracaoAgenda = {
  abertura: string;
  fechamento: string;
  intervalo: number;
  diasBanhoTosa: string[];
  diasVeterinario: string[];
};

function obterCategoriaServico(
  servico: string
): "banho_tosa" | "veterinario" | "outro" {
  if (SERVICOS_BANHO_TOSA.includes(servico)) {
    return "banho_tosa";
  }

  if (SERVICOS_VETERINARIO.includes(servico)) {
    return "veterinario";
  }

  return "outro";
}

function normalizarDias(valor: unknown): string[] {
  if (!Array.isArray(valor)) {
    return DIAS_PADRAO;
  }

  return [...new Set(
    valor.filter(
      (dia): dia is string =>
        typeof dia === "string" &&
        DIAS_PADRAO.includes(dia)
    )
  )];
}

function validarHora(valor: unknown, padrao: string) {
  return typeof valor === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(valor)
      ? valor
      : padrao;
}

function minutosDaHora(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function obterDiaSemana(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);

  return String(
    new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
  );
}

function dataValida(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] = data.split("-").map(Number);
  const dataTeste = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    dataTeste.getUTCFullYear() === ano &&
    dataTeste.getUTCMonth() === mes - 1 &&
    dataTeste.getUTCDate() === dia
  );
}


function horarioLocalParaISO(
  data: string,
  hora: string,
  segundos = "00"
): string | null {
  const instante = new Date(
    `${data}T${hora}:${segundos}-03:00`
  );

  if (Number.isNaN(instante.getTime())) {
    return null;
  }

  return instante.toISOString();
}


function gerarHorarios(config: ConfiguracaoAgenda) {
  const inicio = minutosDaHora(config.abertura);
  const fim = minutosDaHora(config.fechamento);

  if (fim <= inicio || config.intervalo <= 0) {
    return [];
  }

  const horarios: string[] = [];

  for (
    let minutos = inicio;
    minutos <= fim;
    minutos += config.intervalo
  ) {
    horarios.push(
      `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(
        minutos % 60
      ).padStart(2, "0")}`
    );
  }

  return horarios;
}

async function carregarConfiguracaoAgenda() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "petsister_agenda_config_publica"
  );

  const registro = (
    error ? undefined : data?.[0]
  ) as unknown as Record<string, unknown> | undefined;

  if (!registro) {
    return {
      supabase,
      erro: "Não foi possível carregar a configuração da agenda.",
      configuracao: null,
    };
  }

  const abertura = validarHora(
    registro.hora_abertura,
    "08:00"
  );

  const fechamento = validarHora(
    registro.hora_fechamento,
    "18:00"
  );

  const intervaloSalvo = Number(
    registro.intervalo_agendamentos_minutos
  );

  const intervalo = [10, 15, 20, 30, 60].includes(intervaloSalvo)
    ? intervaloSalvo
    : 30;

  if (
    minutosDaHora(fechamento) <= minutosDaHora(abertura) ||
    (minutosDaHora(fechamento) - minutosDaHora(abertura)) % intervalo !== 0
  ) {
    return {
      supabase,
      erro: "A configuração de horários da agenda é inválida.",
      configuracao: null,
    };
  }

  return {
    supabase,
    erro: null,
    configuracao: {
      abertura,
      fechamento,
      intervalo,
      diasBanhoTosa: normalizarDias(registro.dias_banho_tosa),
      diasVeterinario: normalizarDias(registro.dias_veterinario),
    } satisfies ConfiguracaoAgenda,
  };
}

function horarioAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valor = (tipo: string) =>
    partes.find((p) => p.type === tipo)?.value ?? "";

  return (
    `${valor("year")}-${valor("month")}-${valor("day")}T` +
    `${valor("hour")}:${valor("minute")}`
  );
}

export async function obterHorariosOcupados(
  data: string,
  categoria: "banho_tosa" | "veterinario"
): Promise<string[]> {
  if (!dataValida(data)) {
    return [];
  }

  const { supabase, configuracao } =
    await carregarConfiguracaoAgenda();

  if (!configuracao) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const diasAtivos =
    categoria === "banho_tosa"
      ? configuracao.diasBanhoTosa
      : configuracao.diasVeterinario;

  if (!diasAtivos.includes(obterDiaSemana(data))) {
    return [];
  }

  const inicio = horarioLocalParaISO(
  data,
  configuracao.abertura,
  "00"
);

const fim = horarioLocalParaISO(
  data,
  configuracao.fechamento,
  "59.999"
);

if (!inicio || !fim) {
  return [];
}

  const { data: registros, error } = await supabase
    .from("petsister_agendamentos")
    .select("data_hora, servico, status")
    .gte("data_hora", inicio)
    .lte("data_hora", fim);

  if (error || !registros) {
    return [];
  }

  const horariosValidos = gerarHorarios(configuracao);

  return registros
    .filter((registro) => {
      if (registro.status === "cancelado") {
        return false;
      }

      return (
        obterCategoriaServico(registro.servico) === categoria
      );
    })
    .map((registro) =>
  new Date(registro.data_hora).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
)
    .filter((horario) => horariosValidos.includes(horario));
}

export async function criarAgendamento(
  _prev:
    | {
        erro?: string;
        sucesso?: boolean;
      }
    | undefined,
  formData: FormData
): Promise<{
  erro?: string;
  sucesso?: boolean;
}> {
  const {
    supabase,
    configuracao,
    erro: erroConfiguracao,
  } = await carregarConfiguracaoAgenda();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      erro: "Sua sessão expirou. Entre novamente na sua conta.",
    };
  }

  if (!configuracao) {
    return {
      erro: erroConfiguracao ?? "Agenda indisponível no momento.",
    };
  }

  const servico = String(formData.get("servico") ?? "").trim();
  const dataHora = String(formData.get("data_hora") ?? "").trim();
  const petNome = String(formData.get("pet_nome") ?? "").trim();
  const petRaca = String(formData.get("pet_raca") ?? "").trim();
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  const petPorteRaw = String(formData.get("pet_porte") ?? "").trim();

  const petPorte: PortePet = PORTES.includes(petPorteRaw as PortePet)
    ? (petPorteRaw as PortePet)
    : "Medio";

  if (!servico || !dataHora) {
    return {
      erro: "Preencha o serviço e escolha um horário.",
    };
  }

  const [data, horario] = dataHora.split("T");

  if (
    !data ||
    !horario ||
    !dataValida(data) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)
  ) {
    return {
      erro: "Data ou horário inválido.",
    };
  }

  const categoria = obterCategoriaServico(servico);

  if (categoria === "outro") {
    return {
      erro: "Serviço inválido.",
    };
  }

  const diasAtivos =
    categoria === "banho_tosa"
      ? configuracao.diasBanhoTosa
      : configuracao.diasVeterinario;

  if (!diasAtivos.includes(obterDiaSemana(data))) {
    return {
      erro: "Esse serviço não funciona nesse dia. Escolha outro.",
    };
  }

  const horariosValidos = gerarHorarios(configuracao);

  if (!horariosValidos.includes(horario)) {
    return {
      erro: "Esse horário não está disponível na agenda.",
    };
  }

  if (`${data}T${horario}` <= horarioAtualSaoPaulo()) {
    return {
      erro: "Esse horário já passou. Escolha outra data ou horário.",
    };
  }

  const dataHoraISO = horarioLocalParaISO(data, horario, "00");

if (!dataHoraISO) {
  return {
    erro: "Não foi possível interpretar a data e o horário escolhidos.",
  };
}
  
 const inicio = horarioLocalParaISO(data, horario, "00");
const fim = horarioLocalParaISO(data, horario, "59.999");

if (!inicio || !fim) {
  return {
    erro: "Não foi possível validar o horário escolhido.",
  };
}

  const { data: existentes, error: consultaError } =
    await supabase
      .from("petsister_agendamentos")
      .select("data_hora, servico, status")
      .gte("data_hora", inicio)
      .lte("data_hora", fim);

  if (consultaError) {
    return {
      erro: `Erro ao verificar o horário: ${consultaError.message}`,
    };
  }

  const horarioOcupado = (existentes ?? []).some((registro) => {
    if (registro.status === "cancelado") {
      return false;
    }

    return obterCategoriaServico(registro.servico) === categoria;
  });

  if (horarioOcupado) {
    return {
      erro: "Esse horário já está ocupado. Escolha outro.",
    };
  }

  const { error: insertError } = await supabase
    .from("petsister_agendamentos")
    .insert({
      usuario_id: user.id,
      servico,
      pet_nome: petNome || null,
      pet_raca: petRaca || null,
      pet_porte: petPorte,
      data_hora: dataHoraISO,
      status: "agendado",
      observacoes: observacoes || null,
    });

  if (insertError) {
    return {
      erro: `Erro ao salvar o agendamento: ${insertError.message}`,
    };
  }

  revalidatePath("/agendamentos");
  revalidatePath("/admin/agendamentos");

  return {
    sucesso: true,
  };
}
