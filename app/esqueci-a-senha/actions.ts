
"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function solicitarRecuperacao(
  _prev: { erro?: string; sucesso?: boolean } | undefined,
  formData: FormData,
): Promise<{ erro?: string; sucesso?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { erro: "Digite seu e-mail." };
  }

  const headerStore = await headers();

  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host");

  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    return { erro: "Não foi possível identificar o endereço do site." };
  }

  const origin = `${protocol}://${host}`;

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  if (error) {
    return {
      erro: "Não foi possível enviar o e-mail de recuperação.",
    };
  }

  return { sucesso: true };
}
