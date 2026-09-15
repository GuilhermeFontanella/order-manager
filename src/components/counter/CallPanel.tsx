import { Maximize2 } from 'lucide-react'
import { elapsedLabel } from './utils'

export type LastCall = {
  senha: number
  nome: string
  origem: string
  calledAt: number
} | null

type Props = {
  lastCall: LastCall
  now: number
  flash: boolean
  onOpenDisplay?: () => void
}

export default function CallPanel({ lastCall, now, flash, onOpenDisplay }: Props) {
  return (
    <div className={`counter-call-panel${flash ? ' flash' : ''}`}>
      <div className={`counter-call-bell${flash ? ' ringing' : ''}`}>🔔</div>
      <div className="counter-call-info-flex">
        <div className="counter-call-info-label">Painel de chamada</div>
        <div className="counter-call-info-main">
          {lastCall ? `#${lastCall.senha} · ${lastCall.nome} · ${lastCall.origem}` : 'Nenhuma chamada ainda'}
        </div>
        <div className="counter-call-info-time">
          {lastCall ? `Chamado ${elapsedLabel(lastCall.calledAt, now)}` : ''}
        </div>
      </div>
      {onOpenDisplay && (
        <button
          type="button"
          className="counter-btn-open-display"
          onClick={onOpenDisplay}
          title="Abrir painel de chamada em uma nova aba (tela do salão)"
        >
          <Maximize2 className="h-4 w-4" />
          Abrir painel
        </button>
      )}
    </div>
  )
}
