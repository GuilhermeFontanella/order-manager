import { useState } from 'react'
import type { CounterOrder } from './types'
import { elapsedLabel, elapsedClass } from './utils'
import { fmt } from '../../data/menu'

const JANELA_CORRECAO_MS = 40 * 1000

type Props = {
  order: CounterOrder
  now: number
  adminMode: boolean
  isNew: boolean
  onEntregar: (id: number) => void
  onChamar: (id: number) => void
  onConfirmarDevolucao: (id: number, motivo: string) => void
}

export default function PickupCard({ order, now, adminMode, isNew, onEntregar, onChamar, onConfirmarDevolucao }: Props) {
  const [devolverAberto, setDevolverAberto] = useState(false)
  const [motivo, setMotivo] = useState('')

  const prontoEm = order.prontoEm ?? now
  const decorrido = now - prontoEm
  const restante = Math.max(0, JANELA_CORRECAO_MS - decorrido)
  const janelaCozinhaAtiva = restante > 0
  const podeDevolver = adminMode || !janelaCozinhaAtiva

  const cooldownRestante = order.cooldownUntil ? Math.max(0, order.cooldownUntil - now) : 0
  const emCooldown = cooldownRestante > 0

  const itensTxt = order.itens.map(i => `${i.qty}x ${i.nome}`).join(' · ')

  function handleConfirmarDevolucao() {
    const trimmed = motivo.trim()
    if (!trimmed) return
    onConfirmarDevolucao(order.id, trimmed)
    setDevolverAberto(false)
    setMotivo('')
  }

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

      {podeDevolver ? (
        <>
          <button type="button" className="counter-devolver-toggle" onClick={() => setDevolverAberto(prev => !prev)}>
            {devolverAberto ? 'Cancelar devolução' : 'Devolver para a cozinha'}
          </button>
          {devolverAberto && (
            <div className="counter-devolver-box">
              <textarea
                value={motivo}
                onChange={event => setMotivo(event.target.value)}
                placeholder="Motivo da devolução (obrigatório)... ex: item errado, cliente reclamou"
              />
              <button
                type="button"
                className="counter-btn-devolver-confirm"
                disabled={!motivo.trim()}
                onClick={handleConfirmarDevolucao}
              >
                Confirmar devolução
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="counter-locked-note">
          Ainda dentro da janela de correção da cozinha ({Math.ceil(restante / 1000)}s) — devolução pelo balcão libera depois disso.
        </p>
      )}
    </div>
  )
}
