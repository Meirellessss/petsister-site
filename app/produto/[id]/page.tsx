
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

  const [produto, usuario, catalogo] = await Promise.all([
    getProdutoPorId(produtoId),
    getUsuarioAtual(),
    getProdutosDisponiveis(),
  ]);

  if (!produto) {
    notFound();
  }

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
      />
    </>
  );
}
