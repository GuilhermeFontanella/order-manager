import { useState } from 'react'
import type { CounterOrder } from '../../components/counter/types'
import type { AuthUser } from '../../services/auth'
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
  papel: AuthUser['papel'] | undefined
  restaurantOpen: boolean
  newOrderId: string | null
  lastCall: LastCall
  callFlash: boolean
  onEntregar: (id: string) => void
  onChamar: (id: string) => void
  onDevolverParaCozinha: (id: string) => void
  onReverterEntrega: (id: string) => void
  horaAbertura: string
  onAbrirPainelDeChamada: () => void
}

export default function BalcaoPanel({
  orders,
  now,
  papel,
  restaurantOpen,
  newOrderId,
  lastCall,
  callFlash,
  onEntregar,
  onChamar,
  onDevolverParaCozinha,
  onReverterEntrega,
  horaAbertura,
  onAbrirPainelDeChamada,
}: Props) {
  const [tab, setTab] = useState<'retirada' | 'todos'>('retirada')

  const prontos = orders.filter(o => o.status === 'PRONTO')
  const entregues = orders.filter(o => o.status === 'RETIRADO')
  const validos = orders.filter(o => o.status !== 'CANCELADO')
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
              papel={papel}
              newOrderId={newOrderId}
              onEntregar={onEntregar}
              onChamar={onChamar}
              onDevolverParaCozinha={onDevolverParaCozinha}
            />

            <DeliveredList orders={entregues} now={now} papel={papel} onReverter={onReverterEntrega} />
          </div>
        ) : (
          <OverviewTable orders={orders} now={now} />
        )}
      </div>
    </>
  )
}
