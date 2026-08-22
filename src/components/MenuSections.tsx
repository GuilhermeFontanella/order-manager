import { useEffect, useRef, useState } from 'react'
import type { Category, Item } from '../data/menu';
import ProductCard from './ProductCard'
import ItemSheet from './ItemSheet'
import { useCart } from '../context/CartContext'
import DetailsSheet from './DetailsSheet';

type Props = {
  categories: Category[]
  loading?: boolean
}

export default function MenuSections({ categories, loading = false }: Props) {
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Highlight active tab on scroll
    const sections = categories.map(c => document.getElementById('sec-' + c.id)).filter(Boolean)
    function onScroll() {
      let current = categories[0]?.id
      sections.forEach((sec) => {
        if (!sec) return
        if ((sec as HTMLElement).getBoundingClientRect().top - 160 <= 0) {
          current = (sec as HTMLElement).id.replace('sec-', '')
        }
      })
      const tabs = tabsRef.current?.querySelectorAll('.tab') || []
      tabs.forEach(t => t.classList.toggle('active', (t as HTMLElement).dataset.cat === current))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [categories])

  const [selected, setSelected] = useState<Item | null>(null)
  const { add } = useCart()

  return (
    <div>
      <div ref={tabsRef} className="flex gap-2 overflow-x-auto py-2 px-4 -mx-4">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            className={`cursor-pointer inline-flex items-center rounded-4xl bg-amber-50 px-2 py-2 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10 hover:bg-gray-200 ${idx === 0 ? 'active' : ''} shadow-sm`}
            data-cat={cat.id}
            onClick={() => document.getElementById('sec-' + cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      <main className="px-4">
        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            Carregando cardápio...
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            Nenhum item encontrado para sua busca.
          </div>
        ) : (
          categories.map((cat: Category) => (
            <section id={'sec-' + cat.id} key={cat.id} className="mb-6 mt-6" aria-labelledby={`title-${cat.id}`}>
              <h2 id={`title-${cat.id}`} className="font-bold text-lg mb-4 text-left">{cat.nome}</h2>
              <div className="grid gap-3 mt-4">
                {cat.itens.map(item => (
                  <ProductCard key={item.id} item={item} onAdd={() => setSelected(item)} showDetails={() => {setSelected(item); setShowDetails(!showDetails)}} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
      <ItemSheet
        item={selected}
        open={!!selected && !showDetails}
        onClose={() => setSelected(null)}
        onAdd={(item, qty = 1) => {
          add(item, qty)
          setSelected(null)
        }}
      />
      <DetailsSheet
        item={selected}
        open={!!selected && showDetails}
        onClose={() => {
          setSelected(null)
          setShowDetails(false)
        }}
        onContinue={() => {
          setShowDetails(false)
        }}
      />
    </div>
  )
}
