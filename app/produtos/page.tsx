import { createClient } from "@/lib/supabase/server";
import {
  getCategorias,
  getProdutosDisponiveis,
  getUsuarioAtual,
} from "@/lib/queries";
import CatalogoClient from "./catalogo-client";

type PaginaProdutosProps = {
  searchParams: Promise<{
    categoria?: string | string[];
    busca?: string | string[];
  }>;
};

export default async function PaginaProdutos({
  searchParams,
}: PaginaProdutosProps) {
  const parametros = await searchParams;
  const supabase = await createClient();

  const categoriaSolicitada =
    typeof parametros.categoria === "string"
      ? parametros.categoria
      : "";
  const buscaInicial =
  typeof parametros.busca === "string"
    ? parametros.busca
    : "";

  
const [
  categorias,
  produtos,
  usuario,
  resultadoLimite,
] = await Promise.all([
  getCategorias(),
  getProdutosDisponiveis(),
  getUsuarioAtual(),
  supabase.rpc("petsister_limite_estoque_publico"),
]);

const valorLimite = resultadoLimite.data;

const limiteEstoqueBaixo =
  !resultadoLimite.error &&
  typeof valorLimite === "number" &&
  Number.isInteger(valorLimite) &&
  valorLimite >= 0 &&
  valorLimite <= 10000
    ? valorLimite
    : 8;


  const categoriaInicial = categorias.some(
    (categoria) => categoria.nome === categoriaSolicitada
  )
    ? categoriaSolicitada
    : "";

  return (
    <CatalogoClient
      categorias={categorias}
      produtos={produtos}
      limiteEstoqueBaixo={limiteEstoqueBaixo}
      usuario={
        usuario
          ? {
              nome: usuario.profile.nome,
              perfil: usuario.profile.perfil,
            }
          : null
      }
      categoriaInicial={categoriaInicial}
      buscaInicial={buscaInicial}
    />
  );
}
