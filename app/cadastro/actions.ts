"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cadastrar(
  _prev: { erro?: string; sucesso?: boolean } | undefined,
  formData: FormData,
): Promise<{ erro?: string; sucesso?: boolean }> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const confirma = String(formData.get("confirma") ?? "");

  if (!nome || !email || !senha) return { erro: "Preencha todos os campos." };
  if (senha.length < 6) return { erro: "Senha deve ter no mínimo 6 caracteres." };
  if (senha !== confirma) return { erro: "As senhas não coincidem." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { erro: "Este e-mail já está cadastrado." };
    }
    return { erro: "Não foi possível criar a conta. Tente novamente." };
  }

  if (!data.session) {
    // confirmação de e-mail ativa no projeto — avisa o usuário em vez de redirecionar direto
    return { sucesso: true };
  }

  redirect("/");
}
