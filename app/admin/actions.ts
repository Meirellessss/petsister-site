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
  const preco = parseFloat(String(formData.get("preco") ?? "0").replace(",", "."));
  const estoque = parseInt(String(formData.get("estoque") ?? "0"), 10);
  const categoria = String(formData.get("categoria") ?? "").trim();
  const porteRaw = String(formData.get("porte") ?? "Todos");
  const porte: Porte = PORTES.includes(porteRaw as Porte) ? (porteRaw as Porte) : "Todos";
  const imagem = String(formData.get("imagem") ?? "").trim();
  const destaque = formData.get("destaque") === "1";

  if (!nome) return { ok: false, error: "Nome é obrigatório" };

  const payload = {
    nome,
    descricao: descricao || null,
    preco: isNaN(preco) ? 0 : preco,
    estoque: isNaN(estoque) ? 0 : estoque,
    categoria: categoria || null,
    porte,
    imagem: imagem || null,
    destaque,
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
