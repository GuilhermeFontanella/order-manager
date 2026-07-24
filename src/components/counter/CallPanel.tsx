import { elapsedLabel } from './utils'

export type LastCall = {
  senha: number
  nome: string
  mesa: number
  calledAt: number
} | null

type Props = {
  lastCall: LastCall
  now: number
  flash: boolean
}

export default function CallPanel({ lastCall, now, flash }: Props) {
  return (
    <div className={`counter-call-panel${flash ? ' flash' : ''}`}>
      <div className={`counter-call-bell${flash ? ' ringing' : ''}`}>🔔</div>
      <div>
        <div className="counter-call-info-label">Painel de chamada (simulado)</div>
        <div className="counter-call-info-main">
          {lastCall ? `#${lastCall.senha} · ${lastCall.nome} · Mesa ${lastCall.mesa}` : 'Nenhuma chamada ainda'}
        </div>
        <div className="counter-call-info-time">
          {lastCall ? `Chamado ${elapsedLabel(lastCall.calledAt, now)}` : ''}
        </div>
      </div>
    </div>
  )
}
