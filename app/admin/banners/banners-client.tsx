"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { excluirBanner, salvarBanner } from "../actions";
import styles from "../admin.module.css";

type Banner = {
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
  criado_em?: string;
};

type FormularioBanner = {
  id?: number;
  tipo: "principal" | "anuncio";
  titulo: string;
  descricao: string;
  etiqueta: string;
  imagem_url: string;
  texto_botao: string;
  link_destino: string;
  ordem: number;
  ativo: boolean;
};

const FORM_VAZIO: FormularioBanner = {
  tipo: "anuncio",
  titulo: "",
  descricao: "",
  etiqueta: "",
  imagem_url: "",
  texto_botao: "Ver produtos",
  link_destino: "/produtos",
  ordem: 1,
  ativo: true,
};

export default function BannersClient({
  banners,
}: {
  banners: Banner[];
}) {
  const router = useRouter();
  const inputImagem = useRef<HTMLInputElement>(null);

  const [formulario, setFormulario] =
    useState<FormularioBanner>(FORM_VAZIO);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const bannerPrincipal = banners.find((banner) => banner.tipo === "principal");

  function atualizar<K extends keyof FormularioBanner>(
    campo: K,
    valor: FormularioBanner[K]
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function novoBanner() {
    setFormulario(FORM_VAZIO);
    setEditando(false);
    setErro("");
    setSucesso("");
    inputImagem.current?.focus();
  }

  function cadastrarOuEditarBannerPrincipal() {
    if (bannerPrincipal) {
      editarBanner(bannerPrincipal);
      return;
    }

    setFormulario({
      ...FORM_VAZIO,
      tipo: "principal",
      titulo: "Tudo para o seu pet em um só lugar.",
      descricao: "O cuidado que ele merece, pertinho de você. 🐾",
      etiqueta: "RAÇÕES • CÃES E GATOS • FARMÁCIA VETERINÁRIA • ACESSÓRIOS",
      imagem_url: "/logo.jpg",
      texto_botao: "Ver produtos",
