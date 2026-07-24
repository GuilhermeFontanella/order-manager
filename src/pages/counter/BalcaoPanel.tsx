import { useState } from 'react'
import type { CounterOrder } from '../../components/counter/types'
import TabsNav from '../../components/counter/TabsNav'
import StatsRow from '../../components/counter/StatsRow'
import ClosedBanner from '../../components/counter/ClosedBanner'
import CallPanel, { type LastCall } from '../../components/counter/CallPanel'
import PickupGrid from '../../components/counter/PickupGrid'
import DeliveredList from '../../components/counter/DeliveredList'
import OverviewTable from '../../components/counter/OverviewTable'
import { fmt } from '../../data/menu'

type Props = {
  orders: CounterOrder[]
  now: number
  adminMode: boolean
  restaurantOpen: boolean
  newOrderId: number | null
  lastCall: LastCall
  callFlash: boolean
  onEntregar: (id: number) => void
  onChamar: (id: number) => void
  onConfirmarDevolucao: (id: number, motivo: string) => void
  onReverterEntrega: (id: number) => void
  horaAbertura: string
  onAbrirPainelDeChamada: () => void
}

export default function BalcaoPanel({
  orders,
  now,
  adminMode,
  restaurantOpen,
  newOrderId,
  lastCall,
  callFlash,
  onEntregar,
  onChamar,
  onConfirmarDevolucao,
  onReverterEntrega,
  horaAbertura,
  onAbrirPainelDeChamada,
}: Props) {
  const [tab, setTab] = useState<'retirada' | 'todos'>('retirada')

  const prontos = orders.filter(o => o.status === 'pronto')
  const entregues = orders.filter(o => o.status === 'entregue')
  const validos = orders.filter(o => o.status !== 'cancelado')
  const faturado = validos.reduce((s, o) => s + o.valor, 0)
  const totalPedidos = validos.length
  const ticketMedio = totalPedidos ? Math.round(faturado / totalPedidos) : 0

  return (
    <>
      <TabsNav tab={tab} onChange={setTab} countRetirada={prontos.length} />

      <div className="counter-content">
        <StatsRow
          items={[
            { icon: '💰', label: `Faturado desde ${horaAbertura}`, value: fmt(faturado) },
            { icon: '🧾', label: 'Pedidos realizados', value: String(totalPedidos), variant: 'blue' },
            { icon: '📊', label: 'Ticket médio', value: fmt(ticketMedio), variant: 'gold' },
          ]}
        />

        {!restaurantOpen && <ClosedBanner />}

        {tab === 'retirada' ? (
          <div>
            <CallPanel lastCall={lastCall} now={now} flash={callFlash} onOpenDisplay={onAbrirPainelDeChamada} />

            <div className="counter-section-label">Prontos para retirada</div>
            <PickupGrid
              orders={prontos}
              now={now}
              adminMode={adminMode}
              newOrderId={newOrderId}
              onEntregar={onEntregar}
              onChamar={onChamar}
              onConfirmarDevolucao={onConfirmarDevolucao}
            />

            <DeliveredList orders={entregues} now={now} adminMode={adminMode} onReverter={onReverterEntrega} />
          </div>
        ) : (
          <OverviewTable orders={orders} now={now} />
        )}
      </div>
    </>
  )
}
