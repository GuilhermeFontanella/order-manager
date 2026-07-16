import { useCart } from '../context/CartContext'
import { fmt } from '../data/menu'

export default function CartBar({ onOpen }: { onOpen: () => void }) {
  const { items } = useCart()
  const total = items.reduce((s, it) => s + it.item.preco * it.qty, 0)
  const count = items.reduce((s, it) => s + it.qty, 0)

  if (count === 0) return null

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-40 w-[92%] max-w-2xl bg-white shadow-lg rounded-full px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold">{count}</div>
        <div>
          <div className="text-sm font-semibold">{fmt(total)}</div>
          <div className="text-xs text-gray-500">{count} item{count>1?'s':''}</div>
        </div>
      </div>

      <button onClick={onOpen} className="bg-green-600 text-white px-4 py-2 rounded-full">Ver pedido</button>
    </div>
  )
}
