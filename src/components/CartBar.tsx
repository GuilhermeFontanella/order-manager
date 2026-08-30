import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { fmt } from '../data/menu'
import Button from './ember/Button'

export default function CartBar({ onOpen }: { onOpen: () => void }) {
  const { items } = useCart()
  const total = items.reduce((s, it) => s + it.item.preco * it.qty, 0)
  const count = items.reduce((s, it) => s + it.qty, 0)

  if (count === 0) return null

  return (
    <div
      className="ember-theme fixed left-1/2 -translate-x-1/2 bottom-4 z-40 flex w-[92%] max-w-2xl items-center justify-between px-4 py-3"
      style={{
        borderRadius: 'var(--r-pill)', background: 'var(--surface-bar)',
        backdropFilter: 'var(--blur-bar)', WebkitBackdropFilter: 'var(--blur-bar)',
        boxShadow: 'var(--ring-inner), var(--shadow-card)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: 'var(--gradient-cta)', color: 'var(--text-on-accent)' }}
        >
          <ShoppingBag size={16} />
        </div>
        <div className="text-left">
          <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{fmt(total)}</div>
          <div style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>{count} item{count > 1 ? 's' : ''}</div>
        </div>
      </div>

      <Button size="sm" onClick={onOpen}>Ver pedido</Button>
    </div>
  )
}
