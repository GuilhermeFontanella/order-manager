import type { KitchenOrder } from './types'

const JANELA_CORRECAO_MS = 40 * 1000 // 40s para "pegar de volta" sem ser admin

function elapsedLabel(ts: number, now: number) {
  const mins = Math.floor((now - ts) / 60000)
  if (mins < 1) return 'agora mesmo'
  if (mins === 1) return 'há 1 min'
  return `há ${mins} min`
}

function elapsedClass(ts: number, now: number) {
  const mins = (now - ts) / 60000
  if (mins < 5) return 'ok'
  if (mins < 10) return 'warn'
  return 'late'
}

type Props = {
  order: KitchenOrder
  now: number
  adminMode: boolean
  isNew: boolean
  onIniciarPreparo: (id: number) => void
  onFinalizarPreparo: (id: number) => void
  onPegarDeVolta: (id: number) => void
  onCancelarPedido: (id: number) => void
}

export default function TicketCard({
  order,
  now,
  adminMode,
  isNew,
  onIniciarPreparo,
  onFinalizarPreparo,
  onPegarDeVolta,
  onCancelarPedido,
}: Props) {
  return (
    <div className={`kitchen-ticket${isNew ? ' new-flash' : ''}`} data-id={order.id}>
      <div className="kitchen-ticket-top">
        <div>
          <div className="kitchen-ticket-senha">#{order.senha}</div>
          <div className="kitchen-ticket-nome">{order.nome}</div>
        </div>
        {order.status === 'pronto' ? (
          <span className="kitchen-time-chip ok">pronto {elapsedLabel(order.prontoEm ?? now, now)}</span>
        ) : (
          <span className={`kitchen-time-chip ${elapsedClass(order.criadoEm, now)}`}>
            {elapsedLabel(order.criadoEm, now)}
          </span>
        )}
      </div>

      <div className="kitchen-ticket-itens">
        {order.itens.map((item, idx) => (
          <div key={idx}>
            <div className="kitchen-item-line">{item.qty}x {item.nome}</div>
            {item.opcoes.length > 0 && (
              <div className="kitchen-item-opts">{item.opcoes.join(' · ')}</div>
            )}
          </div>
        ))}
      </div>

      {order.obs && <div className="kitchen-ticket-obs">⚠ {order.obs}</div>}

      {order.status === 'fila_preparo' && (
        <div className="kitchen-ticket-actions">
          <button className="kitchen-btn-action start" onClick={() => onIniciarPreparo(order.id)}>
            ▶ Pegar para preparo
          </button>
        </div>
      )}

      {order.status === 'preparando' && (
        <div className="kitchen-ticket-actions">
          <button className="kitchen-btn-action finish" onClick={() => onFinalizarPreparo(order.id)}>
            ✓ Terminar preparo
          </button>
        </div>
      )}

      {order.status === 'pronto' && (() => {
        const prontoEm = order.prontoEm ?? now
        const decorrido = now - prontoEm
        const restante = Math.max(0, JANELA_CORRECAO_MS - decorrido)
        const pct = Math.max(0, Math.min(100, (restante / JANELA_CORRECAO_MS) * 100))
        const expirado = restante <= 0
        const podeVoltar = adminMode || !expirado

        let countdownEl
        if (adminMode) {
          countdownEl = expirado ? (
            <span className="kitchen-countdown-text admin-ok">admin: sem limite</span>
          ) : (
            <span className="kitchen-countdown-text">{Math.ceil(restante / 1000)}s + admin</span>
          )
        } else {
          countdownEl = expirado ? (
            <span className="kitchen-countdown-text expired">prazo esgotado</span>
          ) : (
            <span className="kitchen-countdown-text">{Math.ceil(restante / 1000)}s p/ corrigir</span>
          )
        }

        return (
          <>
            <div className="kitchen-countdown-wrap">
              <div className="kitchen-countdown-bar-bg">
                <div className="kitchen-countdown-bar-fill" style={{ width: `${adminMode ? 100 : pct}%` }} />
              </div>
              {countdownEl}
            </div>
            <div className="kitchen-ticket-actions">
              <button
                className="kitchen-btn-action back"
                onClick={() => onPegarDeVolta(order.id)}
                disabled={!podeVoltar}
              >
                ↺ Pegar de volta
              </button>
            </div>
            {adminMode && (
              <button className="kitchen-admin-cancel" onClick={() => onCancelarPedido(order.id)}>
                Cancelar pedido (admin)
              </button>
            )}
          </>
        )
      })()}
    </div>
  )
}
