"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Porte, StatusAgendamento, StatusPedido } from "@/lib/types";

type Resultado = { ok: true } | { ok: false; error: string };

async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("petsister_profiles")
    .select("perfil")
    .eq("id", user.id)
    .single();

  if (profile?.perfil !== "admin") throw new Error("Não autorizado");
  return supabase;
}

const PORTES: Porte[] = ["Pequeno", "Medio", "Grande", "Todos"];

export async function salvarProduto(formData: FormData): Promise<Resultado> {
  const supabase = await exigirAdmin();

  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw ? Number(idRaw) : null;
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const precoRaw = String(formData.get("preco") ?? "")
  .trim()
  .replace(",", ".");
const preco = precoRaw === "" ? Number.NaN : Number(precoRaw);

const estoqueRaw = String(formData.get("estoque") ?? "").trim();
const estoque = estoqueRaw === "" ? Number.NaN : Number(estoqueRaw);
  const categoria = String(formData.get("categoria") ?? "").trim();
  const porteRaw = String(formData.get("porte") ?? "Todos");
  const porte: Porte = PORTES.includes(porteRaw as Porte) ? (porteRaw as Porte) : "Todos";
  const imagem = String(formData.get("imagem") ?? "")
  .split(/\r?\n/)
  .map((url) => url.trim())
  .filter(Boolean)
  .join("\n");
  const destaque = formData.get("destaque") === "1";
  
const parcelamentoAtivo =
  formData.get("parcelamento_ativo") === "on";

const parcelasRaw = String(
  formData.get("parcelamento_maximo") ?? "3"
).trim();

const parcelamentoMaximo = Number(parcelasRaw || "3");

const descontoRaw = String(
  formData.get("desconto_percentual") ?? "0"
).trim();

const descontoPercentual = Number(descontoRaw || "0");

if (
  !Number.isInteger(parcelamentoMaximo) ||
  parcelamentoMaximo < 1 ||
  parcelamentoMaximo > 12
) {
  return {
    ok: false,
    error: "O número de parcelas deve estar entre 1 e 12.",
  };
}

if (
  !Number.isFinite(descontoPercentual) ||
  descontoPercentual < 0 ||
  descontoPercentual > 90
) {
  return {
    ok: false,
    error: "O desconto deve estar entre 0% e 90%.",
  };
}


  if (!nome) return { ok: false, error: "Nome é obrigatório" };
  if (!Number.isFinite(preco) || preco < 0) {
  return {
    ok: false,
    error: "O preço deve ser um número válido igual ou maior que zero.",
  };
}

if (!Number.isInteger(estoque) || estoque < 0) {
  return {
    ok: false,
    error: "O estoque deve ser um número inteiro igual ou maior que zero.",
  };
}

  const payload = {
    nome,
    descricao: descricao || null,
    preco: isNaN(preco) ? 0 : preco,
    estoque: isNaN(estoque) ? 0 : estoque,
    categoria: categoria || null,
    porte,
    imagem: imagem || null,
  destaque,
  parcelamento_ativo: parcelamentoAtivo,
  parcelamento_maximo: parcelamentoMaximo,
  desconto_percentual: descontoPercentual,
};

  const { error } = id
    ? await supabase.from("petsister_produtos").update(payload).eq("id", id)
    : await supabase.from("petsister_produtos").insert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/produtos");
  revalidatePath("/");
  return { ok: true };
}

export async function excluirProduto(id: number): Promise<Resultado> {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("petsister_produtos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/produtos");
  revalidatePath("/");
  return { ok: true };
}

export async function salvarCategoria(formData: FormData): Promise<Resultado> {
  const supabase = await exigirAdmin();

  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw ? Number(idRaw) : null;
  const nome = String(formData.get("nome") ?? "").trim();
  const icone = String(formData.get("icone") ?? "").trim() || "🐾";

  if (!nome) return { ok: false, error: "Nome é obrigatório" };

  const { error } = id
    ? await supabase.from("petsister_categorias").update({ nome, icone }).eq("id", id)
    : await supabase.from("petsister_categorias").insert({ nome, icone });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true };
}

export async function excluirCategoria(id: number): Promise<Resultado> {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("petsister_categorias").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true };
}

export async function atualizarStatusPedido(id: number, status: StatusPedido): Promise<Resultado> {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("petsister_pedidos").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pedidos");
  return { ok: true };
}

export async function atualizarStatusAgendamento(
  id: number,
  status: StatusAgendamento,
): Promise<Resultado> {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("petsister_agendamentos").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/agendamentos");
  return { ok: true };
}


export async function salvarLimiteEstoqueBaixo(
  estadoAtual: { ok: boolean; mensagem: string },
  formData: FormData
): Promise<{ ok: boolean; mensagem: string }> {
  try {
    const supabase = await exigirAdmin();

    const valor = String(
      formData.get("estoque_limite_baixo") ?? ""
    ).trim();

    const limite = Number(valor);

    if (
      valor === "" ||
      !Number.isInteger(limite) ||
      limite < 0 ||
      limite > 10000
    ) {
      return {
        ok: false,
        mensagem: "Informe um limite entre 0 e 10000 unidades.",
      };
    }

    const { data: registro, error: erroLeitura } = await supabase
      .from("petsister_configuracoes")
      .select("configuracoes")
      .eq("id", "global")
      .maybeSingle();

    if (erroLeitura) {
      return {
        ok: false,
        mensagem: "Não foi possível ler as configurações: " + erroLeitura.message,
      };
    }

    if (!registro) {
      return {
        ok: false,
        mensagem: "Configuração global não encontrada no Supabase.",
      };
    }

    const atuais =
      registro.configuracoes &&
      typeof registro.configuracoes === "object" &&
      !Array.isArray(registro.configuracoes)
        ? registro.configuracoes as Record<string, unknown>
        : {};

    const { error: erroAtualizacao } = await supabase
      .from("petsister_configuracoes")
      .update({
        configuracoes: {
          ...atuais,
          estoque_limite_baixo: limite,
        },
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", "global");

    if (erroAtualizacao) {
      return {
        ok: false,
        mensagem: "Não foi possível salvar: " + erroAtualizacao.message,
      };
    }

    revalidatePath("/admin/configuracoes");
    revalidatePath("/admin");
    revalidatePath("/admin/produtos");

    return {
      ok: true,
      mensagem: "Limite de estoque salvo com sucesso!",
    };
  } catch {
    return {
      ok: false,
      mensagem: "Não foi possível salvar. Verifique seu acesso de administrador.",
    };
  }
}


export async function salvarConfiguracaoParcelamento(
  _estadoAtual: { ok: boolean; mensagem: string },
  formData: FormData
): Promise<{ ok: boolean; mensagem: string }> {
  try {
    const supabase = await exigirAdmin();

    const parcelamentoAtivo =
      formData.get("parcelamento_ativo") === "on";

    const valorParcelas = String(
      formData.get("parcelamento_maximo") ?? ""
    ).trim();

    const parcelas = Number(valorParcelas);

    if (
      valorParcelas === "" ||
      !Number.isInteger(parcelas) ||
      parcelas < 1 ||
      parcelas > 12
    ) {
      return {
        ok: false,
        mensagem: "Escolha um número de parcelas entre 1 e 12.",
      };
    }

    const { data: registro, error: erroLeitura } = await supabase
      .from("petsister_configuracoes")
      .select("configuracoes")
      .eq("id", "global")
      .maybeSingle();

    if (erroLeitura || !registro) {
      return {
        ok: false,
        mensagem: "Não foi possível carregar as configurações da loja.",
      };
    }

    const atuais =
      registro.configuracoes &&
      typeof registro.configuracoes === "object" &&
      !Array.isArray(registro.configuracoes)
        ? registro.configuracoes as Record<string, unknown>
        : {};

    const { error } = await supabase
      .from("petsister_configuracoes")
      .update({
        configuracoes: {
          ...atuais,
          parcelamento_ativo: parcelamentoAtivo,
          parcelamento_maximo: parcelas,
        },
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", "global");

    if (error) {
      return {
        ok: false,
        mensagem: "Não foi possível salvar o parcelamento: " + error.message,
      };
    }

    revalidatePath("/admin/configuracoes");
    revalidatePath("/");

    return {
      ok: true,
      mensagem: "Configurações de parcelamento salvas com sucesso!",
    };
  } catch {
    return {
      ok: false,
      mensagem: "Não foi possível salvar. Verifique seu acesso de administrador.",
    };
  }
}


export async function salvarDadosLoja(
  _estadoAtual: { ok: boolean; mensagem: string },
  formData: FormData
): Promise<{ ok: boolean; mensagem: string }> {
  try {
    const supabase = await exigirAdmin();

    const telefone = String(
      formData.get("telefone_atendimento") ?? ""
    ).trim();

    const whatsapp = String(
      formData.get("whatsapp_atendimento") ?? ""
    ).trim();

    const mensagemEntrega = String(
      formData.get("mensagem_entrega") ?? ""
    ).trim();

    if (telefone.length > 30 || whatsapp.length > 30) {
      return {
        ok: false,
        mensagem: "Telefone e WhatsApp devem ter até 30 caracteres.",
      };
    }

    if (mensagemEntrega.length > 300) {
      return {
        ok: false,
        mensagem: "A mensagem de entrega deve ter até 300 caracteres.",
      };
    }

    const { data: registro, error: erroLeitura } = await supabase
      .from("petsister_configuracoes")
      .select("configuracoes")
      .eq("id", "global")
      .maybeSingle();

    if (erroLeitura || !registro) {
      return {
        ok: false,
        mensagem: "Não foi possível carregar as configurações da loja.",
      };
    }

    const atuais =
      registro.configuracoes &&
      typeof registro.configuracoes === "object" &&
      !Array.isArray(registro.configuracoes)
        ? (registro.configuracoes as Record<string, unknown>)
        : {};

    const { error } = await supabase
      .from("petsister_configuracoes")
      .update({
        configuracoes: {
          ...atuais,
          telefone_atendimento: telefone,
          whatsapp_atendimento: whatsapp,
          mensagem_entrega: mensagemEntrega,
        },
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", "global");

    if (error) {
      return {
        ok: false,
        mensagem: "Não foi possível salvar: " + error.message,
      };
    }

    revalidatePath("/admin/configuracoes");
    revalidatePath("/");

    return {
      ok: true,
      mensagem: "Dados da loja salvos com sucesso!",
    };
  } catch {
    return {
      ok: false,
      mensagem:
        "Não foi possível salvar. Verifique seu acesso de administrador.",
    };
  }
}

export async function salvarConfiguracaoAgenda(
  _estadoAtual: { ok: boolean; mensagem: string },
  formData: FormData
): Promise<{ ok: boolean; mensagem: string }> {
  try {
    const supabase = await exigirAdmin();

    const abertura = String(
      formData.get("hora_abertura") ?? ""
    ).trim();

    const fechamento = String(
      formData.get("hora_fechamento") ?? ""
    ).trim();

    const intervalo = Number(
      formData.get("intervalo_agendamentos_minutos")
    );

    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!formatoHora.test(abertura) || !formatoHora.test(fechamento)) {
      return {
        ok: false,
        mensagem: "Informe horários válidos no formato HH:MM.",
      };
    }

    const minutos = (hora: string) => {
      const [h, m] = hora.split(":").map(Number);
      return h * 60 + m;
    };

    const duracao = minutos(fechamento) - minutos(abertura);

    if (duracao <= 0) {
      return {
        ok: false,
        mensagem: "O fechamento deve ser posterior à abertura.",
      };
    }

    if (![10, 15, 20, 30, 60].includes(intervalo)) {
      return {
        ok: false,
        mensagem: "Escolha um intervalo de 10, 15, 20, 30 ou 60 minutos.",
      };
    }

    if (duracao % intervalo !== 0) {
      return {
        ok: false,
        mensagem:
          "A duração do expediente deve ser divisível pelo intervalo escolhido.",
      };
    }

    const { data: registro, error: erroLeitura } = await supabase
      .from("petsister_configuracoes")
      .select("configuracoes")
      .eq("id", "global")
      .maybeSingle();

    if (erroLeitura || !registro) {
      return {
        ok: false,
        mensagem: "Não foi possível carregar as configurações da loja.",
      };
    }

    const atuais =
      registro.configuracoes &&
      typeof registro.configuracoes === "object" &&
      !Array.isArray(registro.configuracoes)
        ? registro.configuracoes as Record<string, unknown>
        : {};

    const { error } = await supabase
      .from("petsister_configuracoes")
      .update({
        configuracoes: {
          ...atuais,
          hora_abertura: abertura,
          hora_fechamento: fechamento,
          intervalo_agendamentos_minutos: intervalo,
        },
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", "global");

    if (error) {
      return {
        ok: false,
        mensagem: "Não foi possível salvar: " + error.message,
      };
    }

    revalidatePath("/admin/configuracoes");
    revalidatePath("/admin/agendamentos");
    revalidatePath("/agendamentos");

    return {
      ok: true,
      mensagem: "Horários de atendimento salvos com sucesso!",
    };
  } catch {
    return {
      ok: false,
      mensagem:
        "Não foi possível salvar. Verifique seu acesso de administrador.",
    };
  }
}


export async function salvarBanner(
  formData: FormData
): Promise<Resultado> {
  try {
    const supabase = await exigirAdmin();

    const idRaw = String(formData.get("id") ?? "").trim();
    const id = idRaw ? Number(idRaw) : null;
    const titulo = String(formData.get("titulo") ?? "").trim();
    const descricao = String(formData.get("descricao") ?? "").trim();
    const etiqueta = String(formData.get("etiqueta") ?? "").trim();
    const imagemUrl = String(formData.get("imagem_url") ?? "").trim();
    const textoBotao =
      String(formData.get("texto_botao") ?? "").trim() || "Ver produtos";
    const linkDestino =
      String(formData.get("link_destino") ?? "").trim() || "/produtos";
    const ordemRaw = String(formData.get("ordem") ?? "1").trim();
    const ordem = Number(ordemRaw);
    const ativo = String(formData.get("ativo") ?? "true") === "true";

    if (!titulo) {
      return { ok: false, error: "Informe o título do banner." };
    }

    if (!imagemUrl) {
      return { ok: false, error: "Selecione uma imagem ou informe uma URL." };
    }

    if (
      !(
        (linkDestino.startsWith("/") && !linkDestino.startsWith("//")) ||
        (() => {
          try {
            return new URL(linkDestino).protocol === "https:";
          } catch {
            return false;
          }
        })()
      )
    ) {
      return {
        ok: false,
        error: "O destino deve ser uma rota interna ou um endereço HTTPS.",
      };
    }

    if (
      !Number.isInteger(ordem) ||
      ordem < 0 ||
      ordem > 10000
    ) {
      return {
        ok: false,
        error: "A ordem deve ser um número inteiro entre 0 e 10000.",
      };
    }

    if (id !== null && (!Number.isInteger(id) || id <= 0)) {
      return { ok: false, error: "Identificador de banner inválido." };
    }

    const payload = {
      titulo,
      descricao,
      etiqueta,
      imagem_url: imagemUrl,
      texto_botao: textoBotao,
      link_destino: linkDestino,
      ordem,
      ativo,
      atualizado_em: new Date().toISOString(),
    };

    const { error } = id !== null
      ? await supabase
          .from("petsister_banners")
          .update(payload)
          .eq("id", id)
      : await supabase
          .from("petsister_banners")
          .insert(payload);

    if (error) {
      return {
        ok: false,
        error: "Não foi possível salvar o banner: " + error.message,
      };
    }

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Não foi possível salvar. Verifique seu acesso de administrador.",
    };
  }
}

export async function excluirBanner(id: number): Promise<Resultado> {
  try {
    const supabase = await exigirAdmin();

    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, error: "Identificador de banner inválido." };
    }

    const { error } = await supabase
      .from("petsister_banners")
      .delete()
      .eq("id", id);

    if (error) {
      return {
        ok: false,
        error: "Não foi possível excluir o banner: " + error.message,
      };
    }

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Não foi possível excluir. Verifique seu acesso de administrador.",
    };
  }
}
