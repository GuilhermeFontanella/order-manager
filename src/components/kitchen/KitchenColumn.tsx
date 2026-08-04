import type { KitchenOrder } from './types'
import type { AuthUser } from '../../services/auth'
import TicketCard from './TicketCard'

type Props = {
  title: string
  variant: 'preparando' | 'pronto'
  live?: boolean
  orders: KitchenOrder[]
  now: number
  papel: AuthUser['papel'] | undefined
  newOrderId: string | null
  onFinalizarPreparo: (id: string) => void
  onPegarDeVolta: (id: string) => void
  onCancelarPedido: (id: string) => void
}

export default function KitchenColumn({
  title,
  variant,
  live,
  orders,
  now,
  papel,
  newOrderId,
  onFinalizarPreparo,
  onPegarDeVolta,
  onCancelarPedido,
}: Props) {
  const sorted = [...orders].sort((a, b) => a.senha - b.senha)

  return (
    <div className="kitchen-column">
      <div className={`kitchen-column-head ${variant}`}>
        <span className="kitchen-column-title">
          {title}
          {live && <span className="kitchen-dot-live" />}
        </span>
        <span className="kitchen-column-count">{orders.length}</span>
      </div>

      <div className="kitchen-column-list">
        {sorted.length === 0 ? (
          <div className="kitchen-column-empty">Nenhum pedido aqui no momento.</div>
        ) : (
          sorted.map(order => (
            <TicketCard
              key={order.id}
              order={order}
              now={now}
              papel={papel}
              isNew={order.id === newOrderId}
              onFinalizarPreparo={onFinalizarPreparo}
              onPegarDeVolta={onPegarDeVolta}
              onCancelarPedido={onCancelarPedido}
            />
          ))
        )}
      </div>
    </div>
  )
}
