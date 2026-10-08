"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Categoria, Perfil, Produto } from "@/lib/types";
import { adicionarAoCarrinho } from "./carrinho/actions";
import { sair } from "./actions";
import Icon from "@/components/Icon";
import styles from "./landing.module.css";
import Link from "next/link";

const WHATSAPP = "5521968934951";
const WHATSAPP_LABEL = "(21) 96893-4951";
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
  categorias,
  produtos,
  cartCount,
  usuario,
}: {
  categorias: Categoria[];
  produtos: Produto[];
  cartCount: number;
  usuario: { nome: string; perfil: Perfil } | null;
}) {
 
  const [busca, setBusca] = useState("");
  const [catAtiva, setCatAtiva] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [produtoAberto, setProdutoAberto] = useState<Produto | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 40);
  };

  handleScroll();

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
  useEffect(() => {
  const temaSalvo = localStorage.getItem("petsister-theme");
  const escuro = temaSalvo === "dark";

  setDarkMode(escuro);
  document.documentElement.dataset.theme = escuro ? "dark" : "light";
}, []);

function alternarTema() {
  setDarkMode((atual) => {
    const novoModo = !atual;

    document.documentElement.dataset.theme = novoModo
      ? "dark"
      : "light";

    localStorage.setItem(
      "petsister-theme",
      novoModo ? "dark" : "light"
    );

    return novoModo;
  });
}

  const visiveis = useMemo(() => {
    if (busca.trim()) {
      const q = busca.toLowerCase().trim();
      return produtos.filter((p) => p.nome?.toLowerCase().includes(q));
    }
    if (catAtiva === "") return produtos;
    // Compara ignorando maiúsculas, minúsculas e espaços extras
    return produtos.filter(
      (p) => p.categoria?.toLowerCase().trim() === catAtiva.toLowerCase().trim()
    );
  }, [produtos, busca, catAtiva]);

  
  function filtrarCat(cat: string) {
    setCatAtiva(cat);
    setBusca("");
  }

  function abrirCompra(p: Produto) {
    setProdutoAberto(p);
    setQty(1);
    setMsg(null);
  }

  function confirmarCompra() {
    if (!produtoAberto) return;
    startTransition(async () => {
      const res = await adicionarAoCarrinho(produtoAberto.id, qty);
      if (res.ok) {
        setMsg({ tipo: "ok", texto: "Adicionado ao carrinho!" });
        setTimeout(() => {
          setProdutoAberto(null);
          router.refresh();
        }, 900);
      } else {
        setMsg({ tipo: "err", texto: res.error });
      }
    });
  }

  return (
    <div>
      <div
  className={`${styles.topbar} ${
    scrolled ? styles.topbarHidden : ""
  }`}
>
  <div className={styles.topbarInner}>
    <div className={styles.topbarMessage}>
      <span className={styles.topbarPaw}>
        <Icon name="pata" size={15} />
      </span>

      <strong>Cuidando de quem sempre te faz bem</strong>
    </div>

    <div className={styles.topbarLinks}>
      <span>
        <Icon name="caminhao" size={15} />
        Entrega para o seu pet
      </span>

      <span>
        <Icon name="cadeado" size={15} />
        Compra segura
      </span>

      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Atendimento pelo WhatsApp
      </a>
    </div>
  </div>
</div>

<nav
  className={`${styles.nav} ${
    scrolled ? styles.navScrolled : ""
  }`}
>
  <div className={styles.navMain}>
    <div className={styles.navInner}>

      {/* LOGO ORIGINAL */}
      <Link
        href="/"
        className={styles.logo}
        aria-label="Pet Sister - página inicial"
      >
        <img src="/logo.jpg" alt="Pet Sister" />
      </Link>

      {/* BUSCA */}
      <div className={styles.navSearch}>
        <span className={styles.searchIcon}>
          <Icon name="busca" size={21} />
        </span>

        <input
          type="text"
          placeholder="O que seu pet precisa?"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);

            document
              .getElementById("produtos")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        />

        <span className={styles.searchHint}>
          Buscar produtos
        </span>
      </div>

      {/* AÇÕES DO LADO DIREITO */}
      <div className={styles.navRight}>

        {/* MODO ESCURO */}
        <button
          type="button"
          className={styles.themeBtn}
          onClick={alternarTema}
          aria-label={
            darkMode
              ? "Ativar modo claro"
              : "Ativar modo escuro"
          }
          title={
            darkMode
              ? "Modo claro"
              : "Modo escuro"
          }
        >
          {darkMode ? "☀" : "☾"}
        </button>

        {usuario ? (
          <>
            {/* PEDIDOS */}
            <Link
              href="/pedidos"
              className={styles.navAction}
            >
              <span className={styles.navActionIcon}>
                <Icon name="pedidos" size={21} />
              </span>

              <span className={styles.navActionText}>
                <small>Meus</small>
                Pedidos
              </span>
            </Link>

            {/* AGENDAMENTO */}
            <Link
              href="/agendamentos"
              className={styles.navAction}
            >
              <span className={styles.navActionIcon}>
                <Icon name="agendar" size={21} />
              </span>

              <span className={styles.navActionText}>
                <small>Serviço</small>
                Agendar
              </span>
            </Link>

            {/* CARRINHO */}
            <Link
              href="/carrinho"
              className={`${styles.navAction} ${styles.cartAction}`}
            >
              <span className={styles.navActionIcon}>
                <Icon name="carrinho" size={21} />
              </span>

              <span className={styles.navActionText}>
                <small>Meu</small>
                Carrinho
              </span>

              {cartCount > 0 && (
                <span className={styles.cartDot}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ADMIN */}
            {usuario.perfil === "admin" && (
              <Link
                href="/admin"
                className={styles.accountButton}
              >
                <Icon name="admin" size={16} />
                Admin
              </Link>
            )}

            {/* SAIR */}
            <form action={sair}>
  <button
    type="submit"
    className={styles.logoutButton}
    title="Sair"
  >
    <Icon name="sair" size={18} />
    <span>Sair</span>
  </button>
</form>
          </>
        ) : (
          <>
            {/* LOGIN */}
            <Link
              href="/login"
              className={styles.accountArea}
            >
              <span className={styles.accountIcon}>
                <Icon name="usuario" size={21} />
              </span>

              <span>
                <small>Minha conta</small>
                Entrar
              </span>
            </Link>

            {/* CADASTRO */}
            <Link
              href="/cadastro"
              className={styles.createAccount}
            >
              Criar conta
            </Link>

            {/* CARRINHO */}
            <Link
              href="/carrinho"
              className={`${styles.navAction} ${styles.cartAction}`}
            >
              <span className={styles.navActionIcon}>
                <Icon name="carrinho" size={21} />
              </span>

              <span className={styles.navActionText}>
                <small>Meu</small>
                Carrinho
              </span>

              {cartCount > 0 && (
                <span className={styles.cartDot}>
                  {cartCount}
                </span>
              )}
            </Link>
          </>
        )}
      </div>
    </div>
  </div>

  {/* MENU DE CATEGORIAS */}
<div
  className={`${styles.catbar} ${
    scrolled ? styles.catbarHidden : ""
  }`}
>
  <div className={styles.catbarInner}>

    {/* RAÇÃO CACHORRO */}
    <button
      type="button"
      className={styles.catbarLink}
      onClick={() => {
        filtrarCat("Ração Cachorro");

        document
          .getElementById("produtos")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      <span className={styles.ce}>
        <Icon name="racao" size={19} />
      </span>

      Ração Cachorro
    </button>

    {/* RAÇÃO GATO */}
    <button
      type="button"
      className={styles.catbarLink}
      onClick={() => {
        filtrarCat("Ração Gato");

        document
          .getElementById("produtos")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      <span className={styles.ce}>
        <Icon name="gato" size={19} />
      </span>

      Ração Gato
    </button>

    {/* BRINQUEDOS */}
    <button
      type="button"
      className={styles.catbarLink}
      onClick={() => {
        filtrarCat("Brinquedos");

        document
          .getElementById("produtos")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      <span className={styles.ce}>
        <Icon name="brinquedos" size={19} />
      </span>

      Brinquedos
    </button>

    {/* CONFORTO */}
    <button
      type="button"
      className={styles.catbarLink}
      onClick={() => {
        filtrarCat("Conforto");

        document
          .getElementById("produtos")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      <span className={styles.ce}>
        <Icon name="conforto" size={19} />
      </span>

      Conforto
    </button>

    {/* FARMÁCIA */}
    <button
      type="button"
      className={styles.catbarLink}
      onClick={() => {
        filtrarCat("Farmácia");

        document
          .getElementById("produtos")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      <span className={styles.ce}>
        <Icon name="farmacia" size={19} />
      </span>

      Farmácia
    </button>

    {/* HIGIENE */}
    <button
      type="button"
      className={styles.catbarLink}
      onClick={() => {
        filtrarCat("Higiene");

        document
          .getElementById("produtos")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      <span className={styles.ce}>
        <Icon name="higiene" size={19} />
      </span>

      Higiene
    </button>

    {/* PASSEIO */}
    <button
      type="button"
      className={styles.catbarLink}
      onClick={() => {
        filtrarCat("Passeio");

        document
          .getElementById("produtos")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      <span className={styles.ce}>
        <Icon name="passeio" size={19} />
      </span>

      Passeio
    </button>

    {/* PETISCOS */}
    <button
      type="button"
      className={styles.catbarLink}
      onClick={() => {
        filtrarCat("Petiscos");

        document
          .getElementById("produtos")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      <span className={styles.ce}>
        <Icon name="petiscos" size={19} />
      </span>

      Petiscos
    </button>

    {/* BANHO E TOSA — ÚLTIMO */}
    <a
      href="#servicos"
      className={`${styles.catbarLink} ${styles.serviceLink}`}
    >
      <span className={styles.ce}>
        <Icon name="banho" size={19} />
      </span>

      Banho e Tosa
    </a>

  </div>
</div>
</nav>
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={`${styles.heroGlow} ${styles.heroGlowG2}`}></div>
        <span className={`${styles.heroPaw} ${styles.p1}`}>
          <Icon name="pata" size={120} />
        </span>
        <span className={`${styles.heroPaw} ${styles.p2}`}>
          <Icon name="pata" size={64} />
        </span>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.heroTag}>Cães · Gatos · Farmácia</span>
            <h1>
              Tudo para o seu pet,
              <br />
              do jeito que <em>ele</em>
              <br />
              merece.
            </h1>
            <p className={styles.heroSub}>
              Rações premium, farmácia veterinária e acessórios para cães e gatos. Disk entrega no mesmo dia pra
              você ficar tranquilo e seu bichinho satisfeito.
            </p>
            <div className={styles.heroActions}>
              <a href="#produtos">
                <button className={`${styles.btnHero} ${styles.btnHeroMain}`} style={{ display: "inline-flex", alignItems: "center", gap: ".55rem" }}>
                  Ver produtos <Icon name="sacola" size={18} />
                </button>
              </a>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">
                <button className={`${styles.btnHero} ${styles.btnHeroGhost}`} style={{ display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
                  <Icon name="caminhao" size={16} /> {WHATSAPP_LABEL}
                </button>
              </a>
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.heroTrustItem}>
                <span className={styles.tc}>
                  <Icon name="caminhao" size={16} />
                </span>
                Disk entrega
              </div>
              <div className={styles.heroTrustItem}>
                <span className={styles.tc}>
                  <Icon name="cadeado" size={16} />
                </span>
                Compra segura
              </div>
              <div className={styles.heroTrustItem}>
                <span className={styles.tc}>
                  <Icon name="estrela-fill" size={16} />
                </span>
                +500 tutores felizes
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroLogoStage}>
              <div className={styles.heroLogoCard}>
                <img src="/logo.jpg" alt="Pet Sister - mascotes" />
              </div>
              <span className={`${styles.heroOrbit} ${styles.fb1}`}>
                <Icon name="caminhao" size={16} /> Disk Entrega
              </span>
              <span className={`${styles.heroOrbit} ${styles.fb2}`}>
                <Icon name="estrela-fill" size={16} /> 4.9 / 5
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.adv}>
        <div className={styles.advInner}>
          <div className={styles.advItem}>
            <div className={styles.advIc}>
              <Icon name="caminhao" size={22} />
            </div>
            <div>
              <div className={styles.advT}>Entrega rápida</div>
              <div className={styles.advS}>Receba em até 24h</div>
            </div>
          </div>
          <div className={styles.advItem}>
            <div className={styles.advIc}>
              <Icon name="cartao" size={22} />
            </div>
            <div>
              <div className={styles.advT}>Até 3x sem juros</div>
              <div className={styles.advS}>No cartão de crédito</div>
            </div>
          </div>
          <div className={styles.advItem}>
            <div className={styles.advIc}>
              <Icon name="reload" size={22} />
            </div>
            <div>
              <div className={styles.advT}>Troca facilitada</div>
              <div className={styles.advS}>Até 7 dias corridos</div>
            </div>
          </div>
          <div className={styles.advItem}>
            <div className={styles.advIc}>
              <Icon name="pata" size={22} />
            </div>
            <div>
              <div className={styles.advT}>Cães e gatos</div>
              <div className={styles.advS}>Curadoria especializada</div>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.section} id="produtos" style={{ paddingTop: "1rem" }}>
        <div className={styles.sectionInner}>
          <div className={styles.secHead}>
            <div className={styles.secLabel}>Loja</div>
            <h2 className={styles.secTitle}>Mais procurados</h2>
            <p className={styles.secSub}>Produtos selecionados a dedo pelos tutores da Pet Sister.</p>
          </div>
          <div className={styles.filtros}>
            <button
              className={`${styles.filtroBtn} ${catAtiva === "" && !busca ? styles.filtroAtivo : ""}`}
              onClick={() => filtrarCat("")}
            >
              Todos
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                className={`${styles.filtroBtn} ${catAtiva === c.nome && !busca ? styles.filtroAtivo : ""}`}
                onClick={() => filtrarCat(c.nome)}
              >
                {c.nome}
              </button>
            ))}
          </div>
          <div className={styles.prodGrid}>
            {visiveis.map((p) => {
              const parcela = p.preco / 3;
              return (
                <div className={styles.prodCard} key={p.id}>
                  <div className={styles.prodThumb}>
                    {p.destaque && <span className={styles.prodTag}>Destaque</span>}
                    {p.imagem ? (
                      <img src={p.imagem} alt="" />
                    ) : (
                      <span className={styles.phIc}>
                        <Icon name={CATEGORIA_ICON[p.categoria ?? ""] ?? "pata"} size={64} />
                      </span>
                    )}
                  </div>
                  <div className={styles.prodBody}>
                    <div className={styles.prodCat}>{p.categoria}</div>
                    <div className={styles.prodName}>{p.nome}</div>
                    <span className={styles.prodPorte}>
                      <Icon name="cao" size={12} /> Porte {p.porte === "Medio" ? "Médio" : p.porte}
                    </span>
                    <div className={styles.prodFoot}>
                      {p.estoque <= 8 && (
                        <div className={styles.prodStockLow}>
                          <Icon name="raio" size={13} /> Últimas {p.estoque} unidades
                        </div>
                      )}
                      <div className={styles.prodPriceRow}>
                        <span className={styles.prodPrice}>R$ {formatarPreco(p.preco)}</span>
                      </div>
                      <div className={styles.prodInstallment}>ou 3x de R$ {formatarPreco(parcela)} sem juros</div>
                      {usuario ? (
                        <button className={styles.btnComprar} onClick={() => abrirCompra(p)}>
                          <Icon name="carrinho" size={16} /> Adicionar
                        </button>
                      ) : (
                        <a href="/login">
                          <button className={styles.btnComprar}>Entrar para comprar</button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
         {visiveis.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
              <div style={{ marginBottom: ".6rem", color: "var(--soft)", display: "flex", justifyContent: "center" }}>
                <Icon name="busca" size={48} />
              </div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", marginBottom: ".5rem", color: "var(--ink)" }}>
                Ops! Não encontramos nada.
              </h3>
              <p style={{ fontSize: ".9rem" }}>Tente buscar por outro nome ou navegue pelas categorias acima.</p>
              <button 
                onClick={() => { setBusca(""); setCatAtiva(""); }}
                style={{ marginTop: "1rem", background: "var(--p600)", color: "#fff", border: "none", padding: ".6rem 1.2rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              >
                Ver todos os produtos
              </button>
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.secServ}`} id="servicos">
        <div className={styles.sectionInner}>
          <div className={styles.secHead}>
            <div className={styles.secLabel} style={{ color: "#fbbf24" }}>
              Serviços
            </div>
            <h2 className={styles.secTitle} style={{ color: "#fff" }}>
              Cuidados que seu pet <em style={{ color: "#fbbf24" }}>ama</em>
            </h2>
            <p className={styles.secSub} style={{ color: "rgba(255,255,255,.6)" }}>
              Agende pelo site em segundos. Confirmamos por WhatsApp.
            </p>
          </div>
          <div className={styles.servGrid}>
            {SERVICOS.map(([ic, nome, desc, preco], idx) => (
              <div className={styles.servCard} key={`${nome}-${idx}`}>
                <div className={styles.servIc}>
                  <Icon name={ic} size={44} />
                </div>
                <div className={styles.servName}>{nome}</div>
                <div className={styles.servDesc}>{desc}</div>
                <div className={styles.servPrice}>{preco}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <a href={usuario ? "/agendamentos" : "/login"}>
              <button className={`${styles.btnHero} ${styles.btnHeroMain}`}>Agendar agora →</button>
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.secHead}>
            <div className={styles.secLabel}>Como funciona</div>
            <h2 className={styles.secTitle}>
              Simples como um <em>passeio</em>
            </h2>
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <h4>Crie sua conta</h4>
              <p>Cadastro gratuito em menos de um minuto, sem burocracia.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <h4>Escolha o que precisa</h4>
              <p>Navegue pelo catálogo de cães e gatos e adicione tudo ao carrinho.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <h4>Finalize o pedido</h4>
              <p>Checkout rápido. Para serviços, escolha o melhor dia e horário.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>4</div>
              <h4>Pronto, é só receber!</h4>
              <p>Acompanhe tudo pela sua conta. Seu pet vai agradecer.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.secDepo}`}>
        <div className={styles.sectionInner}>
          <div className={styles.secHead}>
            <div className={styles.secLabel}>Depoimentos</div>
            <h2 className={styles.secTitle}>
              Tutores que <em>confiam</em>
            </h2>
          </div>
          <div className={styles.depoGrid}>
            {DEPOIMENTOS.map(([texto, nome, pet]) => (
              <div className={styles.depoCard} key={nome}>
                <div className={styles.depoStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} name="estrela-fill" size={16} />
                  ))}
                </div>
                <div className={styles.depoText}>{texto}</div>
                <div className={styles.depoAutor}>
                  <div className={styles.depoAv}>{nome.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className={styles.depoNome}>{nome}</div>
                    <div className={styles.depoPet}>{pet}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.secCta}>
        <span className={styles.heroPaw} style={{ position: "absolute", top: "-30px", right: "-40px", opacity: 0.07 }}>
          <Icon name="pata" size={240} />
        </span>
        <h2>
          Seu pet merece
          <br />o <em>melhor</em>.
        </h2>
        <p>Crie sua conta grátis e ganhe frete grátis na primeira compra.</p>
        <div className={styles.ctaBtns}>
          <a href={usuario ? "#produtos" : "/cadastro"}>
            <button className={styles.btnCtaMain}>Começar agora →</button>
          </a>
          <a href="#servicos">
            <button className={styles.btnCtaGhost}>Conhecer serviços</button>
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footInner}>
          <div>
            <div className={styles.footLogo}>
              <img src="/logo.jpg" alt="Pet Sister" />
            </div>
            <p className={styles.footAbout}>
              Loja completa para cães e gatos. Rações premium, farmácia veterinária e acessórios — com disk
              entrega para você não se preocupar com nada.
            </p>
            <div className={styles.footContact}>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener" className={styles.footLink}>
                <Icon name="caminhao" size={16} /> {WHATSAPP_LABEL} · WhatsApp
              </a>
              <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener" className={styles.footLink}>
                <Icon name="coracao" size={16} /> @{INSTAGRAM}
              </a>
            </div>
          </div>
          <div className={styles.footCol}>
            <h4>Loja</h4>
            <a href="#produtos">Produtos</a>
           <a href="#produtos">Categorias</a>
            <a href="#servicos">Serviços</a>
            {usuario && <a href="/pedidos">Meus pedidos</a>}
          </div>
          <div className={styles.footCol}>
            <h4>Conta</h4>
            {usuario ? (
              <>
                <a href="/pedidos">Meus pedidos</a>
                <a href="/agendamentos">Agendamentos</a>
                <form action={sair}>
                  <button type="submit" style={{ background: "none", border: "none", color: "inherit", padding: ".25rem 0", fontSize: ".85rem" }}>
                    Sair
                  </button>
                </form>
              </>
            ) : (
              <>
                <a href="/login">Entrar</a>
                <a href="/cadastro">Criar conta</a>
              </>
            )}
          </div>
          <div className={styles.footCol}>
            <h4>Atendimento</h4>
            <a href="#">Central de ajuda</a>
            <a href="#">Trocas e devoluções</a>
            <a href="#">Fale conosco</a>
          </div>
        </div>
        <div className={styles.footBottom}>
          © {new Date().getFullYear()} Pet Sister · Cães e gatos · Feito com carinho · {WHATSAPP_LABEL}
        </div>
      </footer>

      {produtoAberto && (
        <div className={styles.overlay} onClick={() => setProdutoAberto(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{produtoAberto.nome}</h3>
              <button className={styles.modalClose} onClick={() => setProdutoAberto(null)} aria-label="Fechar">
                <Icon name="fechar" size={14} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: ".9rem", color: "var(--muted)" }}>{produtoAberto.descricao}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className={styles.priceBig}>R$ {formatarPreco(produtoAberto.preco)}</div>
                <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>{produtoAberto.estoque} em estoque</div>
              </div>
              <div className={styles.qtyRow}>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Quantidade
                </label>
                <button className={styles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span style={{ width: 34, textAlign: "center", fontWeight: 700, fontSize: "1.05rem" }}>{qty}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty((q) => Math.min(produtoAberto.estoque, q + 1))}
                >
                  +
                </button>
              </div>
              {msg && (
                <div className={`${styles.alert} ${msg.tipo === "ok" ? styles.alertOk : styles.alertErr}`}>
                  {msg.tipo === "ok" ? <Icon name="check" size={16} /> : <Icon name="alerta" size={16} />}
                  {msg.texto}
                </div>
              )}
              <button
                className={`${styles.btnPrimary} ${styles.btnFull}`}
                style={{ padding: ".8rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}
                onClick={confirmarCompra}
                disabled={pending}
              >
                {pending ? "Adicionando…" : (
                  <>
                    Adicionar ao carrinho <Icon name="carrinho" size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
