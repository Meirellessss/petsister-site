// Valores PÚBLICOS do Supabase (seguros de expor — a chave anon/publishable já
// vai pro navegador de qualquer forma). Fallback embutido para o deploy de
// preview funcionar sem configurar variáveis de ambiente.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://yvtfchncqgrbphzpfbnk.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_5FiZimFi51S4MonpmWbC4w_J-dWee_i";
