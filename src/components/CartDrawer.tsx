import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { fmt } from '../data/menu'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { Minus, Plus, Trash, X } from 'lucide-react';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, remove, updateQty } = useCart();
  const [qty, setQty] = useState(1)
  const total = items.reduce((s, it) => s + it.item.preco * it.qty, 0)
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.aside
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-2xl bg-white rounded-t-xl p-4 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Seu pedido</h3>
          <button onClick={onClose} className="text-sm text-gray-600"><X /></button>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Carrinho vazio</div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {items.map(it => (
              <div key={it.id} className="mt-5 flex items-center justify-between gap-4 ">
                <div className="justify-items-start">
                  <div className="font-semibold">{it.item.nome}</div>
                  <div className="text-xs text-gray-500">{fmt(it.item.preco)}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 rounded-full bg-slate-100 px-2 py-2">
                    <button
                      type="button"
                      onClick={() => {setQty(Math.max(1, qty - 1)); updateQty(it.id, Math.max(1, qty - 1))}}
                      className="h-10 w-10 justify-items-center rounded-full bg-white text-lg text-slate-700 shadow-sm"
                    >
                      <Minus />
                    </button>
                    <span className="min-w-[34px] text-center text-sm font-semibold text-slate-900">{qty}</span>
                    <button
                      type="button"
                      onClick={() => {setQty(qty + 1); updateQty(it.id, qty + 1)}}
                      className="h-10 w-10 justify-items-center rounded-full bg-white text-lg text-slate-700 shadow-sm"
                    >
                      <Plus />
                    </button>
                  </div>
                  <button onClick={() => remove(it.id)} className="text-sm text-red-600"><Trash /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t pt-4 flex items-center justify-between">
          <div className="justify-items-start">
            <div className="text-sm text-gray-500">Total</div>
            <div className="font-bold text-lg">{fmt(total)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onClose(); navigate('/checkout') }} className={`px-4 py-2 bg-green-600 text-white rounded-2xl ${total > 0 ? '' : 'opacity-50 cursor-not-allowed'}`}>Enviar Pedido</button>
          </div>
        </div>
      </motion.aside>
    </div>
  )
}
