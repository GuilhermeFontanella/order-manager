import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MoreVertical, Utensils, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MenuSections from "../../components/MenuSections";
import CartBar from "../../components/CartBar";
import CartDrawer from "../../components/CartDrawer";
import SearchField from "../../components/ember/SearchField";
import CategoryChip from "../../components/ember/CategoryChip";
import BrandMark from "../../components/ember/BrandMark";
import IconButton from "../../components/ember/IconButton";
import "../../styles/ember-theme.css";
import { readMesaSession, clearMesaSession } from "../../lib/mesaSession";
import {
  getMesaCardapio,
  getMesaCategorias,
  getConfiguracaoRestaurante,
  buscarProdutosCardapio,
  type Mesa,
  type CategoriaStorefront,
  type ConfiguracaoRestaurante,
} from "../../services/storefront";
import { resolveMediaUrl } from "../../services/apiClient";
import type { Category } from "../../data/menu";

export default function OrderMenu() {
  const navigate = useNavigate();
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaStorefront[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    string | null
  >(null);
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [semMesa, setSemMesa] = useState(false);
  const [cardapio, setCardapio] = useState<Category[]>([]);
  const [displayCategories, setDisplayCategories] = useState<Category[]>([]);
  const [appearance, setAppearance] = useState<ConfiguracaoRestaurante | null>(
    null,
  );
  const [loading, setLoading] = useState(() => !!readMesaSession());
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const session = readMesaSession();
    if (!session) return;

    let isMounted = true;

    async function loadMesa() {
      try {
        if (session!.qrCodeToken) {
          const [
            data,
            { mesa: mesaData, cardapio: cardapioData },
            appearanceData,
          ] = await Promise.all([
            getMesaCategorias(session!.tenantSlug),
            getMesaCardapio(session!.tenantSlug, session!.qrCodeToken),
            getConfiguracaoRestaurante(session!.tenantSlug),
          ]);
          if (!isMounted) return;
          setTenantSlug(session!.tenantSlug);
          setMesa(mesaData);
          setCategorias(data);
          setCardapio(cardapioData);
          setDisplayCategories(cardapioData);
          setAppearance(appearanceData);
        } else {
          const [data, cardapioData, appearanceData] = await Promise.all([
            getMesaCategorias(session!.tenantSlug),
            buscarProdutosCardapio(session!.tenantSlug, {}),
            getConfiguracaoRestaurante(session!.tenantSlug),
          ]);
          if (!isMounted) return;
          setTenantSlug(session!.tenantSlug);
          setSemMesa(true);
          setCategorias(data);
          setCardapio(cardapioData);
          setDisplayCategories(cardapioData);
          setAppearance(appearanceData);
        }
      } catch {
        if (!isMounted) return;
        clearMesaSession();
        setError(
          "Não foi possível carregar o cardápio. Escaneie o QR code novamente.",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMesa();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (!tenantSlug) return;

    const termo = debouncedSearch.trim();
    if (!termo && !categoriaSelecionada) {
      setDisplayCategories(cardapio);
      setSearching(false);
      return;
    }

    let isMounted = true;
    setSearching(true);

    buscarProdutosCardapio(tenantSlug, {
      search: termo,
      categoriaId: categoriaSelecionada ?? undefined,
    })
      .then((resultado) => {
        if (isMounted) setDisplayCategories(resultado);
      })
      .catch(() => {
        if (isMounted) setDisplayCategories([]);
      })
      .finally(() => {
        if (isMounted) setSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tenantSlug, debouncedSearch, categoriaSelecionada, cardapio]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
      return () => window.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleRescan = () => {
    setMenuOpen(false);
    navigate("/scan");
  };

  const handleClear = () => {
    clearMesaSession();
    setMesa(null);
    setCardapio([]);
    setMenuOpen(false);
    navigate("/scan");
  };

  const [cartOpen, setCartOpen] = useState(false);

  const heroPhoto = appearance?.arteCardapioUrl
    ? resolveMediaUrl(appearance.arteCardapioUrl)
    : null;

  const themeStyle = {
    "--tenant-primary": appearance?.corBotaoPrimario || "#F5811F",
  } as CSSProperties;

  return (
    <div className="ember-theme relative isolate min-h-screen overflow-hidden" style={themeStyle}>
      <div
        aria-hidden
        style={{
          position: "absolute", top: -140, left: -100, width: 460, height: 460,
          background: "var(--gradient-ember-glow)", pointerEvents: "none",
        }}
      />
      {heroPhoto && (
        <>
          <img
            aria-hidden src={heroPhoto} alt=""
            style={{
              position: "absolute", inset: 0, width: "100%", height: 340,
              objectFit: "cover",
            }}
          />
          <div
            aria-hidden
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 340, background: "var(--scrim-photo)" }}
          />
        </>
      )}

      {/* No explicit z-index here: an integer value would open a NEW stacking context,
          trapping ItemSheet/DetailsSheet (fixed, z-50) below it relative to CartBar
          (fixed, z-40, a sibling outside this div) — DOM order already paints this
          above the absolute-positioned background decoration without that side effect. */}
      <div className="relative mx-auto max-w-5xl px-4 pb-24">
        <header className="pt-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="skeleton h-8 w-40" />
              ) : (
                <>
                  {appearance?.logoUrl && (
                    <img
                      src={resolveMediaUrl(appearance.logoUrl)}
                      alt="Logo"
                      className="h-10 w-10 rounded-xl object-cover"
                      style={{ boxShadow: "var(--ring-inner-strong)" }}
                    />
                  )}
                  <BrandMark name={appearance?.nome ?? "Restaurante"} size="lg" />
                </>
              )}
            </div>

            {mesa ? (
              <div className="relative flex items-center justify-between gap-3" ref={menuRef}>
                <div
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ background: "var(--glass-1)", boxShadow: "var(--ring-inner)", backdropFilter: "var(--blur-glass)" }}
                >
                  <Utensils size={16} />
                  <span>Mesa {mesa.numero}</span>
                </div>
                <IconButton icon={MoreVertical} label="Mais opções" onClick={() => setMenuOpen((prev) => !prev)} />

                {menuOpen ? (
                  <div
                    className="absolute right-0 top-full z-10 mt-2 w-56 rounded-3xl p-2"
                    style={{ background: "var(--surface-sheet)", backdropFilter: "var(--blur-glass)", boxShadow: "var(--ring-inner), var(--shadow-card)" }}
                  >
                    <button
                      type="button"
                      onClick={handleRescan}
                      className="w-full rounded-2xl px-3 py-3 text-left text-sm font-medium transition"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Escanear outro QR code
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="mt-1 w-full rounded-2xl px-3 py-3 text-left text-sm font-medium transition"
                      style={{ color: "var(--danger)" }}
                    >
                      Remover mesa
                    </button>
                  </div>
                ) : null}
              </div>
            ) : semMesa ? (
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                style={{ background: "var(--glass-1)", boxShadow: "var(--ring-inner)", backdropFilter: "var(--blur-glass)" }}
              >
                <ShoppingBag size={16} />
                <span>Retirada ou entrega</span>
              </div>
            ) : !loading ? (
              <div className="rounded-3xl px-4 py-3" style={{ background: "var(--surface-card)", backdropFilter: "var(--blur-glass)", boxShadow: "var(--ring-inner)" }}>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {error ?? "Mesa não informada."}
                </p>
                <button
                  onClick={handleRescan}
                  className="mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ background: "var(--gradient-cta)", color: "var(--text-on-accent)", boxShadow: "var(--shadow-cta)" }}
                >
                  Escanear QR
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-6 max-w-xl">
            <label htmlFor="menu-search" className="sr-only">
              Pesquisar no cardápio
            </label>
            <SearchField
              id="menu-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, descrição ou ingrediente..."
            />
          </div>

          {categorias.length > 0 ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              <CategoryChip
                label="Todas"
                selected={categoriaSelecionada === null}
                onClick={() => setCategoriaSelecionada(null)}
              />
              {categorias.map((categoria) => (
                <CategoryChip
                  key={categoria.id}
                  label={categoria.nome}
                  selected={categoriaSelecionada === categoria.id}
                  onClick={() =>
                    setCategoriaSelecionada((prev) =>
                      prev === categoria.id ? null : categoria.id,
                    )
                  }
                />
              ))}
            </div>
          ) : null}
        </header>

        <MenuSections
          categories={displayCategories}
          loading={loading || searching}
          appearance={appearance}
        />
      </div>

      <CartBar onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
