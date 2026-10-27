
import { createClient } from "@/lib/supabase/server";
import {
  getCategorias,
  getProdutosDisponiveis,
  getUsuarioAtual,
  getCartCount,
} from "@/lib/queries";
import Landing from "./landing";

export default async function Home() {
  const usuario = await getUsuarioAtual();
  const supabase = await createClient();

  const [
    categorias,
    produtos,
    cartCount,
    resultadoLoja,
    resultadoBanners,
  ] = await Promise.all([
    getCategorias(),
    getProdutosDisponiveis(),
    usuario ? getCartCount(usuario.id) : Promise.resolve(0),
    supabase.rpc("petsister_dados_loja_publicos"),
    supabase
      .from("petsister_banners")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true }),
  ]);

  const registro =
    !resultadoLoja.error && resultadoLoja.data?.length
      ? resultadoLoja.data[0]
      : null;
  const bannersAtivos = resultadoBanners.error
    ? []
    : resultadoBanners.data ?? [];

  const dadosLoja = {
    telefoneAtendimento: String(
      registro?.telefone_atendimento ?? ""
    ),
    whatsappAtendimento: String(
      registro?.whatsapp_atendimento ?? ""
    ),
    mensagemEntrega: String(
      registro?.mensagem_entrega ?? ""
    ),
  };

  return (
    <Landing
      categorias={categorias}
      produtos={produtos}
      banners={bannersAtivos}
      cartCount={cartCount}
      usuario={
        usuario
          ? {
              nome: usuario.profile.nome,
              perfil: usuario.profile.perfil,
            }
          : null
      }
      dadosLoja={dadosLoja}
    />
  );
}
