import { getCategorias, getProdutosDisponiveis, getUsuarioAtual, getCartCount } from "@/lib/queries";
import Landing from "./landing";

export default async function Home() {
  const usuario = await getUsuarioAtual();
  const [categorias, produtos, cartCount] = await Promise.all([
    getCategorias(),
    getProdutosDisponiveis(),
    usuario ? getCartCount(usuario.id) : Promise.resolve(0),
  ]);

  return (
    <Landing
      categorias={categorias}
      produtos={produtos}
      cartCount={cartCount}
      usuario={
        usuario
          ? { nome: usuario.profile.nome, perfil: usuario.profile.perfil }
          : null
      }
    />
  );
}
