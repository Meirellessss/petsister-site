
import { notFound } from "next/navigation";
import AreaHeader from "@/components/AreaHeader";
import { getProdutoPorId, getUsuarioAtual } from "@/lib/queries";
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

  const [produto, usuario] = await Promise.all([
    getProdutoPorId(produtoId),
    getUsuarioAtual(),
  ]);

  if (!produto) {
    notFound();
  }

  return (
    <>
      <AreaHeader />
      <DetalheProduto
        produto={produto}
        logado={Boolean(usuario)}
      />
    </>
  );
}
