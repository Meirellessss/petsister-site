"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Categoria, Perfil, Produto } from "@/lib/types";
import { adicionarAoCarrinho } from "./carrinho/actions";
import { sair } from "./actions";
import Icon from "@/components/Icon";
import styles from "./landing.module.css";
import Link from "next/link";

const WHATSAPP = "552124900947";
const WHATSAPP_LABEL = "2490-0947";
const INSTAGRAM = "petsisterracoes";

// Ícone por categoria — mantém o mesmo mapeamento (levemente peculiar) do site original,
// onde "Ração" mostra o ícone de cão em vez de ração.
const CATEGORIA_ICON: Record<string, string> = {
  "Ração Cachorro": "racao",
  "Ração Gato": "gato",
  Ração: "racao",

  Brinquedos: "brinquedos",
  Conforto: "conforto",
  Farmácia: "farmacia",
  Higiene: "higiene",
  Passeio: "passeio",
  Petiscos: "petiscos",

  "Banho e Tosa": "banho",
  "Banho & Tosa": "banho",
};

const SERVICOS: [string, string, string, string][] = [
  ["banho", "Banho", "Banho completo com shampoo premium, secagem e perfuminho.", "a partir de R$ 45"],
  ["tosa", "Tosa", "Tosa higiênica ou na raça com profissionais experientes.", "a partir de R$ 60"],
  ["banho", "Banho e Tosa", "O pacote completo para o seu cão, com desconto especial.", "a partir de R$ 90"],
  ["veterinario", "Consulta Veterinária", "Veterinário parceiro disponível para check-ups e emergências.", "R$ 120 / consulta"],
  ["vacina", "Vacinação", "Vacinas essenciais com carteirinha e certificado digital.", "conforme tabela"],
  ["adestramento", "Adestramento", "Sessões individuais focadas em comportamento e obediência.", "R$ 150 / sessão"],
];

const DEPOIMENTOS: [string, string, string][] = [
  [
    '"O pedido chegou muito rápido e a ração é de ótima qualidade. A Luna aprovou na primeira mordida!"',
    "Maria Clara",
    "Tutora da Luna · Golden Retriever",
  ],
  [
    '"Agendei a tosa do Thor pelo site em 2 minutos. Recebi confirmação na hora e ele voltou lindo."',
    "Rodrigo Alves",
    "Tutor do Thor · Labrador",
  ],
  [
    '"Atendimento atencioso e foco total em cães e gatos. Dá pra ver que entendem do assunto. Recomendo demais."',
    "Priscila Sousa",
    "Tutora do Bob · Beagle",
  ],
];

function formatarPreco(v: number) {
  return v.toFixed(2).replace(".", ",");
}


export default function Landing({
  banners,
  categorias,
  produtos,
  cartCount,
  usuario,
  dadosLoja,
}: {
  categorias: Categoria[];
  produtos: Produto[];
  banners: {
    id: number;
    tipo: "principal" | "anuncio";
    titulo: string;
    descricao: string;
    etiqueta: string;
    imagem_url: string;
    texto_botao: string;
    link_destino: string;
    ordem: number;
    ativo: boolean;
  }[];
  cartCount: number;
  usuario: { nome: string; perfil: Perfil } | null;
  dadosLoja: {
    telefoneAtendimento: string;
    whatsappAtendimento: string;
    mensagemEntrega: string;
  };
}) {
