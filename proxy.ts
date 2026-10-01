import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";

// Proxy (Next 16, ex-"middleware"): renova a sessão do Supabase em cada request,
// bloqueia rotas de cliente logado (/carrinho, /agendamentos, /pedidos) para quem
// não estiver autenticado, e /admin para quem não tiver perfil=admin.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const rotaCliente = ["/carrinho", "/agendamentos", "/pedidos"].some((p) =>
    path.startsWith(p),
  );
  const rotaAdmin = path.startsWith("/admin");

  if (!user && (rotaCliente || rotaAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (user && rotaAdmin) {
    const { data: profile } = await supabase
      .from("petsister_profiles")
      .select("perfil")
      .eq("id", user.id)
      .single();
    if (profile?.perfil !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Roda em tudo, menos assets estáticos e otimização de imagem.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
