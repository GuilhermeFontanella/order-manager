import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { fmt } from '../data/menu'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash, WalletCards, X } from 'lucide-react';
import QuantityStepper from './ember/QuantityStepper'
import Button from './ember/Button'
import IconButton from './ember/IconButton'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, remove, updateQty } = useCart();
  const total = items.reduce((s, it) => s + it.item.preco * it.qty, 0)
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="ember-theme fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: 'var(--glass-lo)' }} onClick={onClose} />

      <motion.aside
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-2xl p-4"
        style={{
          borderTopLeftRadius: 'var(--r-sheet)', borderTopRightRadius: 'var(--r-sheet)',
          background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)',
          boxShadow: 'var(--ring-inner), var(--shadow-sheet)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ font: 'var(--text-h2)', color: 'var(--text-primary)' }}>Seu pedido</h3>
          <IconButton icon={X} label="Fechar" size={36} onClick={onClose} />
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>Carrinho vazio</div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {items.map(it => (
              <div
                key={it.id}
                className="flex items-center justify-between gap-4 p-3"
                style={{ borderRadius: 'var(--r-card)', background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)' }}
              >
                <div className="text-left min-w-0">
                  <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{it.item.nome}</div>
                  <div className="pt-1" style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>{fmt(it.item.preco)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <QuantityStepper value={it.qty} min={0} size={32} onChange={(qty) => updateQty(it.id, qty)} />
                  <IconButton icon={Pencil} label="Editar item" size={32} variant="glass" onClick={() => remove(it.id)} />
                  <IconButton icon={Trash} label="Remover item" size={32} variant="glass" style={{ color: 'var(--danger)' }} onClick={() => remove(it.id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className="mt-4 flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid var(--border-hairline)' }}
        >
          <div className="text-left">
            <div style={{ font: 'var(--text-label)', color: 'var(--text-muted)' }}>Total</div>
            <div style={{ font: 'var(--text-h2)', color: 'var(--text-price)' }}>{fmt(total)}</div>
          </div>
          <Button
            iconLeft={WalletCards}
            disabled={total <= 0}
            onClick={() => { onClose(); navigate('/checkout') }}
          >
            Pagamento
          </Button>
        </div>
      </motion.aside>
    </div>
  )
}
