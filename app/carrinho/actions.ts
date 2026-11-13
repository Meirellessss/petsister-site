"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Resultado = { ok: true } | { ok: false; error: string };

export async function adicionarAoCarrinho(
  produtoId: number,
  quantidade: number,
): Promise<Resultado> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Não autenticado" };
    }

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      return { ok: false, error: "Produto inválido." };
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return {
        ok: false,
        error: "A quantidade deve ser um número inteiro maior que zero.",
      };
    }

    const { error } = await supabase.rpc(
      "petsister_adicionar_item_carrinho",
      {
        p_produto_id: produtoId,
        p_quantidade: quantidade,
      },
    );

    if (error) {
      return { ok: false, error: error.message };
    }

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
  _pedidoId: number,
): Promise<Resultado> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Não autenticado" };
    }

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return { ok: false, error: "Item inválido." };
    }

    const { error } = await supabase.rpc(
      "petsister_remover_item_carrinho",
      {
        p_item_id: itemId,
      },
    );

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/carrinho");

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error
        ? e.message
        : "Erro ao remover item do carrinho.",
    };
  }
}
