
import {
  getCategorias,
  getProdutosDisponiveis,
  getUsuarioAtual,
} from "@/lib/queries";
import CatalogoClient from "./catalogo-client";

type PaginaProdutosProps = {
  searchParams: Promise<{
    categoria?: string | string[];
  }>;
};

export default async function PaginaProdutos({
  searchParams,
}: PaginaProdutosProps) {
  const parametros = await searchParams;

  const categoriaSolicitada =
    typeof parametros.categoria === "string"
      ? parametros.categoria
      : "";

  const [categorias, produtos, usuario] = await Promise.all([
    getCategorias(),
    getProdutosDisponiveis(),
    getUsuarioAtual(),
  ]);

  const categoriaInicial = categorias.some(
    (categoria) => categoria.nome === categoriaSolicitada
  )
    ? categoriaSolicitada
    : "";

  return (
    <CatalogoClient
      categorias={categorias}
      produtos={produtos}
      usuario={
        usuario
          ? {
              nome: usuario.profile.nome,
              perfil: usuario.profile.perfil,
            }
          : null
      }
      categoriaInicial={categoriaInicial}
    />
  );
}
