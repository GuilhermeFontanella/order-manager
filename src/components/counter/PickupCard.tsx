import type { CounterOrder } from './types'
import type { AuthUser } from '../../services/auth'
import { elapsedLabel, elapsedClass } from './utils'
import { fmt } from '../../data/menu'

type Props = {
  order: CounterOrder
  now: number
  papel: AuthUser['papel'] | undefined
  isNew: boolean
  onEntregar: (id: string) => void
  onChamar: (id: string) => void
  onDevolverParaCozinha: (id: string) => void
}

export default function PickupCard({ order, now, papel, isNew, onEntregar, onChamar, onDevolverParaCozinha }: Props) {
  const prontoEm = order.prontoEm ?? now
  const podeDevolver = papel === 'MANAGER' || papel === 'HEAD_CHEF'

  const cooldownRestante = order.cooldownUntil ? Math.max(0, order.cooldownUntil - now) : 0
  const emCooldown = cooldownRestante > 0

  const itensTxt = order.itens.map(i => `${i.qty}x ${i.nome}`).join(' · ')

  return (
    <div className={`counter-pickup-card${isNew ? ' new-flash' : ''}`} data-id={order.id}>
      <div className="counter-pickup-top">
        <div>
          <div className="counter-pickup-senha">#{order.senha}</div>
          <div className="counter-pickup-nome">
            {order.nome}
            {!!order.chamadas && <span className="counter-chamadas-badge">chamado {order.chamadas}x</span>}
          </div>
        </div>
        <span className={`counter-time-chip ${elapsedClass(prontoEm, now)}`}>pronto {elapsedLabel(prontoEm, now)}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
        <span className="counter-mesa-chip">Mesa {order.mesa}</span>
        <span className="counter-mesa-chip">{fmt(order.valor)}</span>
      </div>

      <div className="counter-pickup-itens">{itensTxt}</div>

      <button type="button" className="counter-btn-action counter-btn-entregar" onClick={() => onEntregar(order.id)}>
        ✓ Entregar pedido
      </button>

      <button
        type="button"
        className="counter-btn-chamar"
        onClick={() => onChamar(order.id)}
        disabled={emCooldown}
      >
        {emCooldown ? `Aguarde ${Math.ceil(cooldownRestante / 1000)}s para chamar de novo` : '🔊 Chamar novamente'}
      </button>

      {podeDevolver && (
        <button
          type="button"
          className="counter-devolver-toggle"
          onClick={() => {
            if (confirm(`Devolver o pedido #${order.senha} para a cozinha?`)) onDevolverParaCozinha(order.id)
          }}
        >
          ↺ Devolver para a cozinha
        </button>
      )}
    </div>
  )
}
