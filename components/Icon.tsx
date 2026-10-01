const ICONS: Record<string, string> = {
  cao: '<path d="M4 11c0-2.5 1.5-4 3-4 .8 0 1.5.4 2 1l1-2c.4-.7 1-1 2-1s1.6.3 2 1l1 2c.5-.6 1.2-1 2-1 1.5 0 3 1.5 3 4 0 2-1 3-1 5v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3c0-2-1-3-1-5Z"/><circle cx="9.5" cy="13" r=".8" fill="currentColor"/><circle cx="14.5" cy="13" r=".8" fill="currentColor"/><path d="M11 16.5h2"/>',
  gato: '<path d="M5 4 7.5 9c1.4-.6 2.9-.9 4.5-.9s3.1.3 4.5.9L19 4v8c0 4.4-3.1 8-7 8s-7-3.6-7-8V4Z"/><circle cx="9.5" cy="13" r=".8" fill="currentColor"/><circle cx="14.5" cy="13" r=".8" fill="currentColor"/><path d="M11 16h2"/><path d="m8.5 17 1.2.6 1.3-.6 1.3.6 1.2-.6"/>',
  pata: '<circle cx="6" cy="11" r="1.8"/><circle cx="10" cy="7" r="1.8"/><circle cx="14" cy="7" r="1.8"/><circle cx="18" cy="11" r="1.8"/><path d="M7.5 18c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 1.4-1.1 2.5-2.5 2.5h-4A2.5 2.5 0 0 1 7.5 18Z"/>',
  racao: '<path d="M4 12h16l-1.2 7a2 2 0 0 1-2 1.7H7.2a2 2 0 0 1-2-1.7L4 12Z"/><path d="M3 12h18"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="13" cy="17" r="1" fill="currentColor"/><circle cx="11" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14.5" r="1" fill="currentColor"/>',
  farmacia: '<rect x="3" y="9" width="18" height="10" rx="5"/><path d="M12 9v10"/><path d="M3 14h18"/>',
  higiene: '<rect x="5" y="4" width="14" height="16" rx="3"/><path d="M9 4v-1c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v1"/><path d="M9 9h6"/><path d="M9 13h6"/>',
  conforto: '<path d="M3 17v-4a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4"/><path d="M3 17v3"/><path d="M21 17v3"/><path d="M3 17h18"/><path d="M7 13h4v-1"/>',
  brinquedos: '<circle cx="12" cy="12" r="8"/><path d="M4.5 9.5c2 1 5 1 7.5 0s5.5-1 7.5 0"/><path d="M4.5 14.5c2-1 5-1 7.5 0s5.5 1 7.5 0"/>',
  passeio: '<circle cx="12" cy="8" r="4"/><path d="M12 12v2"/><path d="M9 14h6l1 6H8l1-6Z"/>',
  petiscos: '<path d="M6 9a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 2.5 2.5"/><path d="M6 15a2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 2.5-2.5"/><path d="M18 9a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0-2.5 2.5"/><path d="M18 15a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1-2.5-2.5"/><path d="M8 9h8v6H8z"/>',
  banho: '<path d="M3 11h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3Z"/><path d="M7 11V6a3 3 0 0 1 6 0v1"/><path d="M5 21l1-3"/><path d="M19 21l-1-3"/>',
  tosa: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.1 8.9 20 21"/><path d="M8.1 15.1 20 3"/>',
  veterinario: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="17" r="3"/><path d="M6 8v4a4 4 0 0 0 4 4h5"/><path d="M6 14v2"/>',
  vacina: '<path d="m18 2 4 4"/><path d="m17 3 4 4-9 9-5 1 1-5 9-9Z"/><path d="m15 5 4 4"/><path d="M9 15 3 21"/>',
  adestramento: '<path d="M5 7h14"/><circle cx="7" cy="14" r="3"/><circle cx="17" cy="14" r="3"/><path d="M9 7v3"/><path d="M15 7v3"/>',
  busca: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  carrinho: '<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.7 11.2a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 7H6"/>',
  pedidos: '<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  agendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  usuarios: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M16 4.5a3.5 3.5 0 0 1 0 6.7"/><path d="M18 14c2.3.8 4 3.1 4 5.5"/>',
  admin: '<path d="m13 2 1.5 4 4.2.4-3.2 2.9L16.5 14 13 11.7 9.5 14l1-4.7L7.3 6.4 11.5 6 13 2Z"/><path d="M9 16h8"/><path d="M10 20h6"/>',
  loja: '<path d="M3 9V7l1-3h16l1 3v2a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-3 3 3 3 0 0 1-3-3Z"/><path d="M5 12v8h14v-8"/><path d="M9 20v-5h6v5"/>',
  sair: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  coracao: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  "coracao-fill": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill="currentColor"/>',
  estrela: '<path d="m12 2 3 7 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.8l1.8-7.3L1.5 9.6 9 9 12 2Z"/>',
  "estrela-fill": '<path d="m12 2 3 7 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.8l1.8-7.3L1.5 9.6 9 9 12 2Z" fill="currentColor"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  "check-circulo": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  alerta: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5"/><circle cx="12" cy="18" r=".8" fill="currentColor"/>',
  raio: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  fechar: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
  "seta-direita": '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  mais: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  editar: '<path d="M14 4l6 6-12 12H2v-6L14 4Z"/>',
  lixeira: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m5 6 1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  caminhao: '<rect x="1" y="6" width="13" height="11" rx="1"/><path d="M14 9h4l3 4v4h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  cadeado: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  cartao: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
  reload: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  sacola: '<path d="M6 9h12l-1 11a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8L6 9Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
};

export default function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const body = ICONS[name] ?? ICONS.pata;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
