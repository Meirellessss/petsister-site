
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoPerfil = {
  erro?: string;
  sucesso?: string;
};

export async function salvarPerfil(
  _estadoAnterior: EstadoPerfil | undefined,
  formData: FormData,
): Promise<EstadoPerfil> {
  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const cepInformado = String(formData.get("cep") ?? "").trim();
  const rua = String(formData.get("rua") ?? "").trim();
  const numero = String(formData.get("numero") ?? "").trim();
  const complemento = String(formData.get("complemento") ?? "").trim();
  const bairro = String(formData.get("bairro") ?? "").trim();
  const cidade = String(formData.get("cidade") ?? "").trim();
  const estado = String(formData.get("estado") ?? "")
    .trim()
    .toUpperCase();

  if (!nome) {
    return { erro: "Informe seu nome completo." };
  }

  const cep = cepInformado.replace(/\D/g, "");

  if (cep && cep.length !== 8) {
    return {
      erro: "O CEP deve conter 8 números.",
    };
  }

  if (estado && !/^[A-Z]{2}$/.test(estado)) {
    return {
      erro: "Informe a sigla do estado, por exemplo RJ ou SP.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario || !user) {
    return {
      erro: "Sua sessão expirou. Entre novamente na sua conta.",
    };
  }

  const { error } = await supabase.rpc(
    "petsister_atualizar_meu_perfil",
    {
      p_nome: nome,
      p_telefone: telefone,
      p_cep: cep,
      p_rua: rua,
      p_numero: numero,
      p_complemento: complemento,
      p_bairro: bairro,
      p_cidade: cidade,
      p_estado: estado,
    },
  );

  if (error) {
    console.error("Erro ao salvar perfil:", error);

    return {
      erro:
        "Não foi possível salvar seus dados. Tente novamente.",
    };
  }

  revalidatePath("/perfil");
  revalidatePath("/");

  return {
    sucesso: "Seus dados foram salvos com sucesso!",
  };
}
