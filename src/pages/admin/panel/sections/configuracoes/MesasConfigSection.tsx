import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Plus, Printer, Trash2 } from 'lucide-react'
import { useAuth } from '../../../../../context/AuthContext'
import { createMesa, deleteMesa, listMesas, updateMesa, type Mesa } from '../../../../../services/mesas'
import { getApiErrorMessage } from '../../../../../services/apiClient'
import ConfirmDialog from '../../../../../components/ConfirmDialog'

function mesaLink(tenantSlug: string, qrCodeToken: string) {
  return `${window.location.origin}/r/${tenantSlug}/mesa/${qrCodeToken}`
}

export default function MesasConfigSection() {
  const { user } = useAuth()
  const tenantSlug = user?.tenant.slug ?? ''

  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [novoNumero, setNovoNumero] = useState('')
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Mesa | null>(null)
  const [printMesaId, setPrintMesaId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    listMesas()
      .then(list => {
        if (isMounted) setMesas(list.sort((a, b) => a.numero - b.numero))
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar as mesas.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const numero = Number(novoNumero)
    if (!numero || numero <= 0) return

    setCreating(true)
    setError(null)
    try {
      const mesa = await createMesa({ numero })
      setMesas(prev => [...prev, mesa].sort((a, b) => a.numero - b.numero))
      setNovoNumero('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível criar a mesa. Verifique se o número já existe.'))
    } finally {
      setCreating(false)
    }
  }

  async function handleToggleAtiva(mesa: Mesa) {
    setError(null)
    try {
      const updated = await updateMesa(mesa.id, { ativa: !mesa.ativa })
      setMesas(prev => prev.map(m => (m.id === mesa.id ? updated : m)))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível atualizar a mesa.'))
    }
  }

  async function confirmDelete() {
    const mesa = pendingDelete
    if (!mesa) return
    setPendingDelete(null)
    setError(null)
    try {
      await deleteMesa(mesa.id)
      setMesas(prev => prev.filter(m => m.id !== mesa.id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover a mesa.'))
    }
  }

  async function handleCopyLink(mesa: Mesa) {
    try {
      await navigator.clipboard.writeText(mesaLink(tenantSlug, mesa.qrCodeToken))
      setCopiedId(mesa.id)
      setTimeout(() => setCopiedId(current => (current === mesa.id ? null : current)), 2000)
    } catch {
      // clipboard indisponível, ignora silenciosamente
    }
  }

  function handlePrint(mesaId: string | null) {
    setPrintMesaId(mesaId)
    requestAnimationFrame(() => window.print())
  }

  const mesasParaImprimir = printMesaId ? mesas.filter(m => m.id === printMesaId) : mesas

  return (
    <div className="ap-settings-stack" style={{ maxWidth: 'none' }}>
      <div className="ap-card">
        <div className="ap-group-header">
          <div>
            <div className="ap-card-title">Mesas</div>
            <div className="ap-card-sub" style={{ marginBottom: 0 }}>
              Cada mesa tem um QR code próprio — gere e imprima para colar na mesa.
            </div>
          </div>
          <button type="button" className="ap-btn ap-btn-ghost" onClick={() => handlePrint(null)} disabled={mesas.length === 0}>
            <Printer size={13} />
            Imprimir todos
          </button>
        </div>

        <form onSubmit={handleCreate} className="ap-inline-form">
          <input
            className="ap-input"
            value={novoNumero}
            onChange={event => setNovoNumero(event.target.value.replace(/\D/g, ''))}
            placeholder="Número da nova mesa"
            inputMode="numeric"
          />
          <button type="submit" className="ap-btn ap-btn-primary" disabled={creating || !novoNumero}>
            <Plus size={13} />
            {creating ? 'Criando...' : 'Adicionar mesa'}
          </button>
        </form>

        {error && (
          <p style={{ color: 'var(--ap-red)', fontSize: 12.5, marginTop: 14 }}>{error}</p>
        )}

        {loading ? (
          <p className="ap-card-sub" style={{ marginTop: 16 }}>Carregando mesas...</p>
        ) : mesas.length === 0 ? (
          <p className="ap-card-sub" style={{ marginTop: 16 }}>Nenhuma mesa cadastrada ainda.</p>
        ) : (
          <div className="ap-stat-grid" style={{ marginTop: 18, marginBottom: 0 }}>
            {mesas.map(mesa => (
              <div key={mesa.id} className="ap-card" style={{ boxShadow: 'none', border: '1px solid var(--ap-border-soft)' }}>
                <div className="ap-group-header">
                  <span style={{ fontWeight: 800, fontSize: 15 }}>Mesa {mesa.numero}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAtiva(mesa)}
                    className="ap-badge-low-stock"
                    style={
                      mesa.ativa
                        ? { color: 'var(--ap-green-dark)', background: 'var(--ap-green-tint)', cursor: 'pointer', marginLeft: 0 }
                        : { cursor: 'pointer', marginLeft: 0 }
                    }
                  >
                    {mesa.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0' }}>
                  <QRCodeSVG value={mesaLink(tenantSlug, mesa.qrCodeToken)} size={120} />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="ap-btn ap-btn-ghost" style={{ flex: 1 }} onClick={() => handleCopyLink(mesa)}>
                    <Copy size={12} />
                    {copiedId === mesa.id ? 'Copiado!' : 'Copiar link'}
                  </button>
                  <button type="button" className="ap-btn ap-btn-ghost ap-btn-icon" onClick={() => handlePrint(mesa.id)} aria-label="Imprimir QR code">
                    <Printer size={13} />
                  </button>
                  <button
                    type="button"
                    className="ap-btn ap-btn-danger ap-btn-icon"
                    onClick={() => setPendingDelete(mesa)}
                    aria-label="Remover mesa"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Remover a mesa ${pendingDelete?.numero}?`}
        confirmLabel="Remover"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <div className="ap-print-area">
        <div className="ap-print-grid">
          {mesasParaImprimir.map(mesa => (
            <div key={mesa.id} className="ap-print-tile">
              <QRCodeSVG value={mesaLink(tenantSlug, mesa.qrCodeToken)} size={180} />
              <div className="ap-print-tile-label">Mesa {mesa.numero}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
