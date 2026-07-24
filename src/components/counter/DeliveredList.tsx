import type { CounterOrder } from './types'
import { elapsedLabel } from './utils'

type Props = {
  orders: CounterOrder[]
  now: number
  adminMode: boolean
  onReverter: (id: number) => void
}

export default function DeliveredList({ orders, now, adminMode, onReverter }: Props) {
  const entregues = [...orders]
    .sort((a, b) => (b.entregueEm ?? 0) - (a.entregueEm ?? 0))
    .slice(0, 6)

  if (entregues.length === 0) return null

  return (
    <div>
      <div className="counter-section-label">Entregues recentemente</div>
      <div className="counter-delivered-list">
        {entregues.map(order => (
          <div className="counter-delivered-row" key={order.id}>
            <span className="counter-delivered-senha">#{order.senha}</span>
            <span className="counter-delivered-nome">{order.nome} · Mesa {order.mesa}</span>
            <span className="counter-delivered-time">{elapsedLabel(order.entregueEm ?? now, now)}</span>
            {adminMode && (
              <button type="button" className="counter-btn-revert" onClick={() => onReverter(order.id)}>
                Reverter (admin)
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
