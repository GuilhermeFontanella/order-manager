import type { CounterOrder } from './types'
import PickupCard from './PickupCard'

type Props = {
  orders: CounterOrder[]
  now: number
  adminMode: boolean
  newOrderId: number | null
  onEntregar: (id: number) => void
  onChamar: (id: number) => void
  onConfirmarDevolucao: (id: number, motivo: string) => void
}

export default function PickupGrid({ orders, now, adminMode, newOrderId, onEntregar, onChamar, onConfirmarDevolucao }: Props) {
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
          adminMode={adminMode}
          isNew={order.id === newOrderId}
          onEntregar={onEntregar}
          onChamar={onChamar}
          onConfirmarDevolucao={onConfirmarDevolucao}
        />
      ))}
    </div>
  )
}
