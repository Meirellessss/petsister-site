"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function entrar(
  _prev: { erro?: string } | undefined,
  formData: FormData,
): Promise<{ erro?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error || !data.user) {
    return { erro: "E-mail ou senha incorretos." };
  }

  const { data: profile } = await supabase
    .from("petsister_profiles")
    .select("perfil")
    .eq("id", data.user.id)
    .single();

  redirect(profile?.perfil === "admin" ? "/admin" : redirectTo || "/");
}
