import { Check, RotateCcw, TriangleAlert } from 'lucide-react'
import type { KitchenOrder } from './types'
import type { AuthUser } from '../../services/auth'

const JANELA_VOLTAR_PARA_PREPARO_MS = 40 * 1000

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
  papel: AuthUser['papel'] | undefined
  isNew: boolean
  onFinalizarPreparo: (id: string) => void
  onPegarDeVolta: (id: string) => void
  onCancelarPedido: (id: string) => void
}

export default function TicketCard({
  order,
  now,
  papel,
  isNew,
  onFinalizarPreparo,
  onPegarDeVolta,
  onCancelarPedido,
}: Props) {
  const podeGerenciar = papel === 'MANAGER' || papel === 'HEAD_CHEF'

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

      {order.obs && (
        <div className="kitchen-ticket-obs">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          <span>{order.obs}</span>
        </div>
      )}

      {order.status === 'preparando' && (
        <div className="kitchen-ticket-actions">
          <button className="kitchen-btn-action finish" onClick={() => onFinalizarPreparo(order.id)}>
            <Check className="h-4 w-4" />
            Terminar preparo
          </button>
        </div>
      )}

      {order.status === 'pronto' && (() => {
        const prontoEm = order.prontoEm ?? now
        const decorrido = now - prontoEm
        const restante = Math.max(0, JANELA_VOLTAR_PARA_PREPARO_MS - decorrido)
        const pct = Math.max(0, Math.min(100, (restante / JANELA_VOLTAR_PARA_PREPARO_MS) * 100))
        const expirado = restante <= 0
        const podeVoltar = podeGerenciar || !expirado

        let countdownEl
        if (podeGerenciar) {
          countdownEl = expirado ? (
            <span className="kitchen-countdown-text admin-ok">head chef: sem limite</span>
          ) : (
            <span className="kitchen-countdown-text">{Math.ceil(restante / 1000)}s + head chef</span>
          )
        } else {
          countdownEl = expirado ? (
            <span className="kitchen-countdown-text expired">prazo esgotado — peça a um head chef</span>
          ) : (
            <span className="kitchen-countdown-text">{Math.ceil(restante / 1000)}s p/ corrigir</span>
          )
        }

        return (
          <>
            <div className="kitchen-countdown-wrap">
              <div className="kitchen-countdown-bar-bg">
                <div className="kitchen-countdown-bar-fill" style={{ width: `${podeGerenciar ? 100 : pct}%` }} />
              </div>
              {countdownEl}
            </div>
            <div className="kitchen-ticket-actions">
              <button
                className="kitchen-btn-action back"
                onClick={() => onPegarDeVolta(order.id)}
                disabled={!podeVoltar}
              >
                <RotateCcw className="h-4 w-4" />
                Pegar de volta
              </button>
            </div>
          </>
        )
      })()}

      <button className="kitchen-admin-cancel" onClick={() => onCancelarPedido(order.id)}>
        Cancelar pedido
      </button>
    </div>
  )
}
