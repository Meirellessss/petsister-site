"use server";

import { createClient } from "@/lib/supabase/server";

export async function detalhePedido(pedidoId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Não autenticado" as const };

  const { data: pedido } = await supabase
    .from("petsister_pedidos")
    .select("*")
    .eq("id", pedidoId)
    .single();

  if (!pedido) return { erro: "Não encontrado" as const };

  const { data: profile } = await supabase
    .from("petsister_profiles")
    .select("perfil")
    .eq("id", user.id)
    .single();

  if (pedido.usuario_id !== user.id && profile?.perfil !== "admin") {
    return { erro: "Não encontrado" as const };
  }

  const { data: itens } = await supabase
    .from("petsister_itens_pedido")
    .select("quantidade,preco_unitario, petsister_produtos(nome)")
    .eq("pedido_id", pedidoId);

  return {
    total: pedido.total as number,
    status: pedido.status as string,
    itens: (itens ?? []).map((i) => ({
      nome: (i.petsister_produtos as unknown as { nome: string } | null)?.nome ?? "",
      quantidade: i.quantidade as number,
      preco_unitario: i.preco_unitario as number,
    })),
  };
}
