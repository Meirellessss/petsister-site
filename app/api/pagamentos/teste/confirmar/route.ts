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

export async function POST(request: Request) {
  if (!testeHabilitado()) {
    return NextResponse.json(
      { erro: "Pagamento de teste desativado." },
      { status: 404 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const pedidoId = body?.pedidoId;

    if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
      return NextResponse.json(
        { erro: "Identificação do pedido inválida." },
        { status: 400 }
      );
    }

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

    const { data: pedido, error: pedidoError } = await admin
      .from("petsister_pedidos")
      .select(
        "id,usuario_id,total,status,mp_order_id,mp_ambiente,estoque_reservado"
      )
      .eq("id", pedidoId)
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (pedidoError) throw pedidoError;

    if (!pedido) {
      return NextResponse.json(
        { erro: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    if (
      pedido.mp_ambiente !== "teste" ||
      !pedido.mp_order_id
    ) {
      return NextResponse.json(
        { erro: "Pedido não possui pagamento de teste preparado." },
        { status: 409 }
      );
    }

    if (pedido.estoque_reservado) {
      return NextResponse.json(
        { erro: "Pedido de teste não pode reservar estoque." },
        { status: 409 }
      );
    }

    const total = Number(pedido.total);

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { erro: "Valor do pedido inválido." },
        { status: 400 }
      );
    }

    const { data, error } = await admin.rpc(
      "petsister_confirmar_pagamento_teste",
      {
        p_pedido_id: pedido.id,
        p_mp_order_id: pedido.mp_order_id,
        p_external_reference: String(pedido.id),
        p_mp_status: "processed",
        p_mp_status_detail: "accredited",
        p_total_amount: total,
        p_total_paid_amount: total,
        p_country_code: "BRA",
        p_live_mode: false,
      }
    );

    if (error) {
      console.error("Erro ao confirmar pagamento de teste:", error);

      return NextResponse.json(
        { erro: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      simulacao: true,
      resultado: data,
    });

  } catch (error) {
    console.error("Erro na rota de confirmação:", error);

    return NextResponse.json(
      { erro: "Não foi possível confirmar o pagamento de teste." },
      { status: 500 }
    );
  }
}
