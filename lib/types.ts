export type Perfil = "admin" | "cliente";
export type Porte = "Pequeno" | "Medio" | "Grande" | "Todos";
export type PortePet = "Pequeno" | "Medio" | "Grande";
export type StatusPedido = "pendente" | "pago" | "cancelado";
export type StatusAgendamento = "agendado" | "concluido" | "cancelado";

export interface Profile {
  id: string;
  nome: string;
  telefone: string | null;
  perfil: Perfil;
  criado_em: string;
}

export interface Categoria {
  id: number;
  nome: string;
  icone: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  categoria: string | null;
  porte: Porte;
  imagem: string | null;
  destaque: boolean;
  criado_em: string;
}

export interface Pedido {
  id: number;
  usuario_id: string;
  total: number;
  status: StatusPedido;
  criado_em: string;
}

export interface ItemPedido {
  id: number;
  pedido_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
}

export interface ItemPedidoComProduto extends ItemPedido {
  nome: string;
  imagem: string | null;
}

export interface AdminUsuarioRow {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  criado_em: string;
  total_pedidos: number;
  total_gasto: number;
}

export interface Agendamento {
  id: number;
  usuario_id: string;
  servico: string;
  pet_nome: string | null;
  pet_raca: string | null;
  pet_porte: PortePet;
  data_hora: string;
  status: StatusAgendamento;
  observacoes: string | null;
  criado_em: string;
}
