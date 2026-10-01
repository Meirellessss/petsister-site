"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Resultado = { ok: true } | { ok: false; error: string };

async function pedidoPendenteId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  usuarioId: string,
): Promise<number> {
  const { data: existente, error: buscaError } = await supabase
    .from("petsister_pedidos")
    .select("id")
    .eq("usuario_id", usuarioId)
    .eq("status", "pendente")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (buscaError) {
    throw new Error(`Erro ao buscar carrinho: ${buscaError.message}`);
  }

  if (existente) return existente.id;

  const { data: novo, error } = await supabase
    .from("petsister_pedidos")
    .insert({
      usuario_id: usuarioId,
      total: 0,
    })
    .select("id")
    .single();

  if (error || !novo) {
    throw new Error(error?.message ?? "Falha ao criar pedido");
  }

  return novo.id;
}

async function recalcularTotal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pedidoId: number,
) {
  const { data: itens, error } = await supabase
    .from("petsister_itens_pedido")
    .select("quantidade,preco_unitario")
    .eq("pedido_id", pedidoId);

  if (error) {
    throw new Error(`Erro ao calcular total: ${error.message}`);
  }

  const total = (itens ?? []).reduce(
    (s, i) => s + i.quantidade * i.preco_unitario,
    0,
  );

  const { error: updateError } = await supabase
    .from("petsister_pedidos")
    .update({ total })
    .eq("id", pedidoId);

  if (updateError) {
    throw new Error(`Erro ao atualizar total: ${updateError.message}`);
  }
}

export async function adicionarAoCarrinho(
  produtoId: number,
  quantidade: number,
): Promise<Resultado> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Não autenticado" };
  }

  // Impede quantidades inválidas
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return {
      ok: false,
      error: "A quantidade deve ser um número inteiro maior que zero.",
    };
  }

  try {
    /*
     * Busca o produto SEM filtrar pela quantidade solicitada.
     * Precisamos descobrir o estoque real para comparar com
     * o que já está no carrinho.
     */
    const { data: produto, error: produtoError } = await supabase
      .from("petsister_produtos")
      .select("id,preco,estoque,nome")
      .eq("id", produtoId)
      .single();

    if (produtoError || !produto) {
      return {
        ok: false,
        error: "Produto não encontrado.",
      };
    }

    if (produto.estoque <= 0) {
      return {
        ok: false,
        error: "Produto sem estoque.",
      };
    }

    const pedidoId = await pedidoPendenteId(supabase, user.id);

    /*
     * Verifica se este produto já está no carrinho.
     */
    const { data: itemExistente, error: itemError } = await supabase
      .from("petsister_itens_pedido")
      .select("id,quantidade")
      .eq("pedido_id", pedidoId)
      .eq("produto_id", produtoId)
      .maybeSingle();

    if (itemError) {
      throw new Error(`Erro ao consultar item do carrinho: ${itemError.message}`);
    }

    const quantidadeAtual = itemExistente?.quantidade ?? 0;
    const novaQuantidade = quantidadeAtual + quantidade;

    /*
     * AQUI está a correção principal:
     *
     * estoque = 80
     * já existem 80 no carrinho
     * usuário tenta adicionar +19
     * novaQuantidade = 99
     * 99 > 80 → bloqueia.
     */
    if (novaQuantidade > produto.estoque) {
      return {
        ok: false,
        error: `Você pode adicionar no máximo ${produto.estoque} unidade(s) de "${produto.nome}". Já existem ${quantidadeAtual} no seu carrinho.`,
      };
    }

    if (itemExistente) {
      const { error: updateError } = await supabase
        .from("petsister_itens_pedido")
        .update({
          quantidade: novaQuantidade,
        })
        .eq("id", itemExistente.id)
        .eq("pedido_id", pedidoId);

      if (updateError) {
        throw new Error(
          `Erro ao atualizar quantidade: ${updateError.message}`,
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("petsister_itens_pedido")
        .insert({
          pedido_id: pedidoId,
          produto_id: produtoId,
          quantidade,
          preco_unitario: produto.preco,
        });

      if (insertError) {
        throw new Error(
          `Erro ao adicionar produto ao carrinho: ${insertError.message}`,
        );
      }
    }

    await recalcularTotal(supabase, pedidoId);

    revalidatePath("/");
    revalidatePath("/carrinho");

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error
        ? e.message
        : "Erro ao adicionar produto ao carrinho.",
    };
  }
}

export async function removerItem(
  itemId: number,
  pedidoId: number,
): Promise<Resultado> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("petsister_itens_pedido")
    .delete()
    .eq("id", itemId)
    .eq("pedido_id", pedidoId);

  if (error) {
    return {
      ok: false,
      error: `Erro ao remover item: ${error.message}`,
    };
  }

  try {
    await recalcularTotal(supabase, pedidoId);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error
        ? e.message
        : "Erro ao recalcular o carrinho.",
    };
  }

  revalidatePath("/carrinho");

  return { ok: true };
}

export async function finalizarPedido(): Promise<Resultado> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Não autenticado" };
  }

  const { data: pedido, error: pedidoError } = await supabase
    .from("petsister_pedidos")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("status", "pendente")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pedidoError) {
    return {
      ok: false,
      error: `Erro ao buscar carrinho: ${pedidoError.message}`,
    };
  }

  if (!pedido) {
    return {
      ok: false,
      error: "Carrinho vazio",
    };
  }

  const { error } = await supabase.rpc(
    "petsister_finalizar_pedido",
    {
      p_pedido_id: pedido.id,
    },
  );

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  revalidatePath("/carrinho");
  revalidatePath("/pedidos");
  revalidatePath("/");

  return { ok: true };
}