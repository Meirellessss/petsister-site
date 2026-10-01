import { createClient } from "@/lib/supabase/server";
import type { Agendamento, Categoria, ItemPedidoComProduto, Pedido, Produto, Profile } from "./types";

export async function getUsuarioAtual(): Promise<{ id: string; email: string; profile: Profile } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("petsister_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return { id: user.id, email: user.email ?? "", profile: profile as Profile };
}

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("petsister_categorias").select("*").order("nome");
  return (data as Categoria[]) ?? [];
}

export async function getProdutosDisponiveis(): Promise<Produto[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("petsister_produtos")
    .select("*")
    .gt("estoque", 0)
    .order("categoria")
    .order("nome");
  return (data as Produto[]) ?? [];
}

export async function getPedidoPendente(usuarioId: string): Promise<{
  pedido: Pedido | null;
  itens: ItemPedidoComProduto[];
}> {
  const supabase = await createClient();
  const { data: pedido } = await supabase
    .from("petsister_pedidos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .eq("status", "pendente")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pedido) return { pedido: null, itens: [] };

  const { data: itens } = await supabase
    .from("petsister_itens_pedido")
    .select("*, petsister_produtos(nome, imagem)")
    .eq("pedido_id", pedido.id);

  const itensComProduto: ItemPedidoComProduto[] = (itens ?? []).map((i) => ({
    id: i.id,
    pedido_id: i.pedido_id,
    produto_id: i.produto_id,
    quantidade: i.quantidade,
    preco_unitario: i.preco_unitario,
    nome: i.petsister_produtos?.nome ?? "",
    imagem: i.petsister_produtos?.imagem ?? null,
  }));

  return { pedido: pedido as Pedido, itens: itensComProduto };
}

export async function getCartCount(usuarioId: string): Promise<number> {
  const { itens } = await getPedidoPendente(usuarioId);
  return itens.reduce((soma, i) => soma + i.quantidade, 0);
}

export async function getMeusPedidos(usuarioId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("petsister_pedidos")
    .select("*, petsister_itens_pedido(id)")
    .eq("usuario_id", usuarioId)
    .order("criado_em", { ascending: false });
  return (data ?? []).map((p) => ({
    ...(p as Pedido),
    qtd: (p.petsister_itens_pedido as unknown[])?.length ?? 0,
  }));
}

export async function getMeusAgendamentos(usuarioId: string): Promise<Agendamento[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("petsister_agendamentos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("data_hora", { ascending: false });
  return (data as Agendamento[]) ?? [];
}
