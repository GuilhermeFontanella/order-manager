import type { CounterOrder } from './types'
import type { AuthUser } from '../../services/auth'
import PickupCard from './PickupCard'

type Props = {
  orders: CounterOrder[]
  now: number
  papel: AuthUser['papel'] | undefined
  newOrderId: string | null
  onEntregar: (id: string) => void
  onChamar: (id: string) => void
  onDevolverParaCozinha: (id: string) => void
}

export default function PickupGrid({ orders, now, papel, newOrderId, onEntregar, onChamar, onDevolverParaCozinha }: Props) {
  const prontos = [...orders].sort((a, b) => (a.prontoEm ?? 0) - (b.prontoEm ?? 0))

  if (prontos.length === 0) {
    return <div className="counter-empty-state">Nenhum pedido pronto para retirada no momento.</div>
  }

  return (
    <div className="counter-pickup-grid">
      {prontos.map(order => (
        <PickupCard
          key={order.id}
          order={order}
          now={now}
          papel={papel}
          isNew={order.id === newOrderId}
          onEntregar={onEntregar}
          onChamar={onChamar}
          onDevolverParaCozinha={onDevolverParaCozinha}
        />
      ))}
    </div>
  )
}
