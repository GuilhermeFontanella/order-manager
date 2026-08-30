import { useEffect, useRef, useState } from 'react'
import './readyOrders.css'
import {
  READY_ORDERS_STORAGE_KEY,
  readReadyOrdersSnapshot,
  type ReadyOrdersSnapshot,
} from '../../components/counter/readyOrdersSync'
import { elapsedLabel } from '../../components/counter/utils'
import StaffThemeShell from '../../components/ember/StaffThemeShell'
import ThemeToggle from '../../components/ember/ThemeToggle'

export default function ReadyOrders() {
  const [snapshot, setSnapshot] = useState<ReadyOrdersSnapshot>(() => readReadyOrdersSnapshot())
  const [now, setNow] = useState(Date.now())
  const [flash, setFlash] = useState(false)
  const lastSeenCallRef = useRef<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key && event.key !== READY_ORDERS_STORAGE_KEY) return
      setSnapshot(readReadyOrdersSnapshot())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    const calledAt = snapshot.lastCall?.calledAt ?? null
    if (calledAt && calledAt !== lastSeenCallRef.current) {
      lastSeenCallRef.current = calledAt
      setFlash(false)
      requestAnimationFrame(() => setFlash(true))
      const timeout = setTimeout(() => setFlash(false), 1800)
      return () => clearTimeout(timeout)
    }
  }, [snapshot.lastCall])

  const { prontos, lastCall } = snapshot
  const outros = lastCall ? prontos.filter(p => p.senha !== lastCall.senha) : prontos

  return (
    <StaffThemeShell>
    <div className="ro-page">
      <header className="ro-header">
        <div className="ro-brand">
          <div className="ro-brand-mark">🍔</div>
          <div className="ro-brand-text">
            <div className="ro-name">Botequim do Zé</div>
            <div className="ro-sub">Pedidos prontos para retirada</div>
          </div>
        </div>
        <span className="ro-clock">
          {new Date(now).toLocaleTimeString('pt-BR')}
          <ThemeToggle />
        </span>
      </header>

      <main className="ro-main">
        <div className={`ro-call-card${flash ? ' flash' : ''}`}>
          {lastCall ? (
            <>
              <span className={`ro-call-bell${flash ? ' ringing' : ''}`}>🔔</span>
              <div className="ro-call-label">Chamando</div>
              <div className="ro-call-senha">#{lastCall.senha}</div>
              <div className="ro-call-nome">{lastCall.nome}</div>
              <div className="ro-call-mesa">Mesa {lastCall.mesa}</div>
              <div className="ro-call-time">Chamado {elapsedLabel(lastCall.calledAt, now)}</div>
            </>
          ) : (
            <>
              <span className="ro-call-bell">🔔</span>
              <div className="ro-idle" style={{ marginTop: 14 }}>Aguardando a próxima chamada...</div>
            </>
          )}
        </div>

        <div className="ro-section-label">Também prontos para retirada</div>
        {outros.length === 0 ? (
          <div className="ro-grid-empty">Nenhum outro pedido pronto no momento.</div>
        ) : (
          <div className="ro-grid">
            {outros
              .sort((a, b) => a.prontoEm - b.prontoEm)
              .map(order => (
                <div className="ro-chip" key={order.id}>
                  <div className="ro-chip-senha">#{order.senha}</div>
                  <div className="ro-chip-nome">{order.nome}</div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
    </StaffThemeShell>
  )
}
