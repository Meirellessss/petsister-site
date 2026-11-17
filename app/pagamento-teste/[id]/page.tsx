import { notFound, redirect } from "next/navigation";

import AreaHeader from "@/components/AreaHeader";
import { createClient } from "@/lib/supabase/server";
import CheckoutTeste from "./checkout-teste";

export default async function PagamentoTestePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedidoId = Number(id);

  if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pedido, error } = await supabase
    .from("petsister_pedidos")
    .select(
      "id, usuario_id, total, status, mp_order_id, mp_ambiente"
    )
    .eq("id", pedidoId)
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar pedido:", error);
    notFound();
  }

  if (!pedido) {
    notFound();
  }

  if (
    pedido.mp_ambiente !== "teste" ||
    !pedido.mp_order_id
  ) {
    redirect("/carrinho");
  }

  if (!["pendente", "pago"].includes(pedido.status)) {
    redirect("/pedidos");
  }

  const total = Number(pedido.total);

  if (!Number.isFinite(total) || total <= 0) {
    notFound();
  }

  return (
    <>
      <AreaHeader />

      <main
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
          padding: "40px 20px 70px",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              color: "var(--p600)",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            PETSISTER · PAGAMENTO
          </p>

          <h1 style={{ fontSize: 32, marginBottom: 10 }}>
            Finalize sua compra
          </h1>

          <p style={{ color: "var(--muted)" }}>
            Confira seu pedido e continue para a etapa de pagamento.
          </p>
        </div>

        <CheckoutTeste
          pedidoId={pedido.id}
          total={total}
          status={pedido.status}
        />
      </main>
    </>
  );
}
