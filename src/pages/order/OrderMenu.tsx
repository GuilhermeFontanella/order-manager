import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Search, Utensils } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MenuSections from '../../components/MenuSections'
import CartBar from '../../components/CartBar'
import CartDrawer from '../../components/CartDrawer'
import bgMenu from '../../assets/bgmenu.webp'
import { readMesaSession, clearMesaSession } from '../../lib/mesaSession'
import { getMesaCardapio, type Mesa } from '../../services/storefront'
import type { Category } from '../../data/menu'

export default function OrderMenu() {
  const navigate = useNavigate()
  const [mesa, setMesa] = useState<Mesa | null>(null)
  const [cardapio, setCardapio] = useState<Category[]>([])
  const [loading, setLoading] = useState(() => !!readMesaSession())
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const session = readMesaSession()
    if (!session) return

    let isMounted = true

    async function loadMesa() {
      try {
        const { mesa: mesaData, cardapio: cardapioData } = await getMesaCardapio(session!.tenantSlug, session!.qrCodeToken)
        if (!isMounted) return
        setMesa(mesaData)
        setCardapio(cardapioData)
      } catch {
        if (!isMounted) return
        clearMesaSession()
        setError('Não foi possível carregar a mesa. Escaneie o QR code novamente.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMesa()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      window.addEventListener('mousedown', handleClickOutside)
      return () => window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleRescan = () => {
    setMenuOpen(false)
    navigate('/scan')
  }

  const handleClear = () => {
    clearMesaSession()
    setMesa(null)
    setCardapio([])
    setMenuOpen(false)
    navigate('/scan')
  }

  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="relative isolate min-h-screen overflow-hidden dark:bg-[#1e293b] bg-[#f5efe1] text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 scale-110 bg-cover bg-center bg-no-repeat blur-xs"
        style={{ backgroundImage: `url(${bgMenu})` }}
      />
      <div className="mx-auto max-w-5xl px-4 pb-24">
        <header className="pt-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-green-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-md">
                Restaurante aberto
              </div>
              <div className="justify-items-start">
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Botequim do Zé</h1>
              </div>
            </div>

            {mesa ? (
              <div className="relative flex justify-between items-center gap-3" ref={menuRef}>
                <div className=" flex items-center gap-3 rounded-full dark:text-amber-50 dark:bg-stone-500 bg-green-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                  <Utensils />
                  <span>Mesa {mesa.numero}</span>

                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="inline-flex dark:border-0 dark:bg-stone-500 h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:text-amber-50  bg-amber-50 text-slate-600 shadow-sm transition hover:bg-slate-50"
                  aria-label="Mais opções"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 top-full z-10 mt-0 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
                    <button
                      type="button"
                      onClick={handleRescan}
                      className="w-full rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                    >
                      Escanear outro QR code
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="mt-2 w-full rounded-2xl px-3 py-3 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                    >
                      Remover mesa
                    </button>
                  </div>
                ) : null}
              </div>
            ) : !loading ? (
              <div className="rounded-3xl bg-white px-4 py-3 shadow-sm">
                <p className="text-sm text-slate-600">{error ?? 'Mesa não informada.'}</p>
                <button
                  onClick={handleRescan}
                  className="mt-2 inline-flex rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                >
                  Escanear QR
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-6 max-w-xl">
            <label htmlFor="menu-search" className="sr-only">Pesquisar no cardápio</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                id="menu-search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar no cardápio..."
                className="w-full rounded-3xl border border-slate-200 bg-white px-12 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        </header>

        <MenuSections search={search} categories={cardapio} loading={loading} />
      </div>

      <CartBar onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
