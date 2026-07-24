import type { KitchenOrder } from './types'
import TicketCard from './TicketCard'

type Props = {
  title: string
  variant: 'fila' | 'preparando' | 'pronto'
  live?: boolean
  orders: KitchenOrder[]
  now: number
  adminMode: boolean
  newOrderId: number | null
  onIniciarPreparo: (id: number) => void
  onFinalizarPreparo: (id: number) => void
  onPegarDeVolta: (id: number) => void
  onCancelarPedido: (id: number) => void
}

export default function KitchenColumn({
  title,
  variant,
  live,
  orders,
  now,
  adminMode,
  newOrderId,
  onIniciarPreparo,
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
              adminMode={adminMode}
              isNew={order.id === newOrderId}
              onIniciarPreparo={onIniciarPreparo}
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
