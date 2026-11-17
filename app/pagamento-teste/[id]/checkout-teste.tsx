"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatarPreco(valor: number) {
  return valor.toFixed(2).replace(".", ",");
}

export default function CheckoutTeste({
  pedidoId,
  total,
  status,
}: {
  pedidoId: number;
  total: number;
  status: string;
}) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const router = useRouter();

  async function confirmarPagamento() {
    if (carregando) return;

    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(
        "/api/pagamentos/teste/confirmar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pedidoId }),
        }
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível confirmar o pagamento."
        );
      }

      if (resultado.ok !== true || resultado.simulacao !== true) {
        throw new Error("Resposta de confirmação inválida.");
      }

      router.push("/pedidos?ok=1");

    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Erro ao simular o pagamento."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "clamp(22px, 4vw, 36px)",
        boxShadow: "0 12px 32px rgba(12, 24, 64, 0.06)",
      }}
    >
      <div
        style={{
          background: "var(--p50)",
          color: "var(--p700)",
          display: "inline-block",
          borderRadius: 20,
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 18,
        }}
      >
        AMBIENTE DE TESTE
      </div>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>
        Finalizar pagamento
      </h2>

      <p style={{ color: "var(--muted)", marginBottom: 24 }}>
        Confira os dados da sua compra antes de continuar.
      </p>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "20px 0",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span style={{ color: "var(--muted)" }}>
            Número do pedido
          </span>
          <strong>#{pedidoId}</strong>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ color: "var(--muted)" }}>
            Total da compra
          </span>
          <strong style={{ color: "var(--p700)", fontSize: 22 }}>
            R$ {formatarPreco(total)}
          </strong>
        </div>
      </div>

      {status === "pago" ? (
        <div
          style={{
            background: "#f0fdf4",
            color: "#166534",
            padding: 16,
            borderRadius: 12,
            marginBottom: 18,
          }}
        >
          ✓ Este pedido já foi confirmado como pago.
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              borderRadius: 12,
              padding: 14,
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            <strong>Pagamento demonstrativo</strong>
            <p style={{ marginTop: 5 }}>
              Ao continuar, o sistema registrará uma aprovação
              fictícia no banco de dados. Nenhum dinheiro será cobrado.
            </p>
          </div>

          {erro && (
            <p
              role="alert"
              style={{
                color: "#991b1b",
                marginBottom: 14,
                fontSize: 14,
              }}
            >
              ⚠ {erro}
            </p>
          )}

          <button
            type="button"
            onClick={confirmarPagamento}
            disabled={carregando}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 11,
              padding: 15,
              background: "var(--p600)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              opacity: carregando ? 0.7 : 1,
              cursor: carregando ? "wait" : "pointer",
            }}
          >
            {carregando
              ? "Confirmando..."
              : "Simular aprovação do pagamento"}
          </button>
        </>
      )}
    </div>
  );
}
