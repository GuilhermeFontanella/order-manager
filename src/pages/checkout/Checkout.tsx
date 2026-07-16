import { useCart } from '../../context/CartContext'
import { fmt } from '../../data/menu'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const { items, clear } = useCart()
  const navigate = useNavigate()
  const total = items.reduce((s, it) => s + it.item.preco * it.qty, 0)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Finalizar pedido</h1>
      {items.length === 0 ? (
        <div className="text-gray-500">Seu carrinho está vazio.</div>
      ) : (
        <div>
          <ul className="space-y-3">
            {items.map(it => (
              <li key={it.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{it.item.nome}</div>
                  <div className="text-xs text-gray-500">{it.qty} x {fmt(it.item.preco)}</div>
                </div>
                <div className="font-mono">{fmt(it.item.preco * it.qty)}</div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-bold text-lg">{fmt(total)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/order')} className="px-4 py-2 bg-gray-100 rounded">Voltar</button>
              <button onClick={() => { clear(); navigate('/order') }} className="px-4 py-2 bg-green-600 text-white rounded">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
