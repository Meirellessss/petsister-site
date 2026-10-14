
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AreaHeader from "@/components/AreaHeader";
import {
  getProdutoPorId,
  getUsuarioAtual,
  getProdutosDisponiveis,
} from "@/lib/queries";
import DetalheProduto from "./detalhe-produto";

export default async function PaginaProduto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produtoId = Number(id);

  if (!Number.isInteger(produtoId) || produtoId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const [
    produto,
    usuario,
    catalogo,
    resultadoParcelamento,
  ] = await Promise.all([
    getProdutoPorId(produtoId),
    getUsuarioAtual(),
    getProdutosDisponiveis(),
    supabase.rpc("petsister_config_publica"),
  ]);

  if (!produto) {
    notFound();
  }

  const dadosParcelamento = resultadoParcelamento.data?.[0];

  const parcelamentoAtivo =
    dadosParcelamento?.parcelamento_ativo !== false;

  const valorParcelas = Number(
    dadosParcelamento?.parcelamento_maximo ?? 3
  );

  const parcelasMaximas =
    Number.isInteger(valorParcelas) &&
    valorParcelas >= 1 &&
    valorParcelas <= 12
      ? valorParcelas
      : 3;

  const categoriaAtual = produto.categoria?.trim().toLowerCase();

  const relacionados = catalogo
    .filter((item) => item.id !== produto.id)
    .sort((a, b) => {
      const categoriaA =
        a.categoria?.trim().toLowerCase() === categoriaAtual;

      const categoriaB =
        b.categoria?.trim().toLowerCase() === categoriaAtual;

      return Number(categoriaB) - Number(categoriaA);
    })
    .slice(0, 6);

  return (
    <>
      <AreaHeader />
      <DetalheProduto
        produto={produto}
        logado={Boolean(usuario)}
        produtosRelacionados={relacionados}
        parcelamentoAtivo={parcelamentoAtivo}
        parcelasMaximas={parcelasMaximas}
      />
    </>
  );
}
