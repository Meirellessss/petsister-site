import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function testeHabilitado() {
  return (
    process.env.PETSISTER_PAGAMENTO_TESTE === "true" &&
    (
      process.env.NODE_ENV !== "production" ||
      process.env.VERCEL_ENV === "preview"
    )
  );
}

export async function POST() {
  if (!testeHabilitado()) {
    return NextResponse.json(
      { erro: "Pagamento de teste desativado." },
      { status: 404 }
    );
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { erro: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: pedido, error } = await admin
      .from("petsister_pedidos")
      .select(
        "id,total,status,mp_order_id,mp_ambiente,mp_checkout_url,estoque_reservado"
      )
      .eq("usuario_id", user.id)
      .eq("status", "pendente")
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!pedido) {
      return NextResponse.json(
        { erro: "Nenhum pedido pendente encontrado." },
        { status: 404 }
      );
    }

    if (
      !Number.isFinite(Number(pedido.total)) ||
      Number(pedido.total) <= 0
    ) {
      return NextResponse.json(
        { erro: "Valor do pedido inválido." },
        { status: 400 }
      );
    }

    if (pedido.estoque_reservado) {
      return NextResponse.json(
        { erro: "Pedido de teste não pode reservar estoque." },
        { status: 400 }
      );
    }

    const { data: item, error: itemError } = await admin
      .from("petsister_itens_pedido")
      .select("id")
      .eq("pedido_id", pedido.id)
      .limit(1)
      .maybeSingle();

    if (itemError) throw itemError;

    if (!item) {
      return NextResponse.json(
        { erro: "O pedido não possui produtos." },
        { status: 400 }
      );
    }

    if (
      pedido.mp_ambiente === "teste" &&
      pedido.mp_order_id
    ) {
      return NextResponse.json({
        ok: true,
        pedidoId: pedido.id,
        checkoutUrl:
          pedido.mp_checkout_url || `/pagamento-teste/${pedido.id}`,
      });
    }

    if (pedido.mp_order_id || pedido.mp_ambiente) {
      return NextResponse.json(
        { erro: "O pedido já possui dados de pagamento." },
        { status: 409 }
      );
    }

    const mpOrderId = `TEST-${pedido.id}-${randomUUID()}`;
    const checkoutUrl = `/pagamento-teste/${pedido.id}`;

    const { data: atualizado, error: updateError } = await admin
      .from("petsister_pedidos")
      .update({
        mp_order_id: mpOrderId,
        mp_checkout_url: checkoutUrl,
        mp_ambiente: "teste",
        mp_idempotency_key: randomUUID(),
        mp_status: null,
        mp_status_detail: null,
      })
      .eq("id", pedido.id)
      .eq("usuario_id", user.id)
      .eq("status", "pendente")
      .select("id")
      .maybeSingle();

    if (updateError) throw updateError;

    if (!atualizado) {
      return NextResponse.json(
        { erro: "O pedido foi alterado. Atualize a página." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      pedidoId: pedido.id,
      checkoutUrl,
    });

  } catch (error) {
    console.error("Erro ao preparar pagamento de teste:", error);

    return NextResponse.json(
      {
        erro: error instanceof Error
          ? error.message
          : "Erro ao preparar pagamento.",
      },
      { status: 500 }
    );
  }
}
