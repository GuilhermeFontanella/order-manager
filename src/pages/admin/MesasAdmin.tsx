import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createMesa, deleteMesa, listMesas, updateMesa, type Mesa } from '../../services/mesas'
import { getApiErrorMessage } from '../../services/apiClient'

function mesaLink(tenantSlug: string, qrCodeToken: string) {
  return `${window.location.origin}/r/${tenantSlug}/mesa/${qrCodeToken}`
}

export default function MesasAdmin() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const tenantSlug = user?.tenant.slug ?? ''

  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [novoNumero, setNovoNumero] = useState('')
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
    try {
      const updated = await updateMesa(mesa.id, { ativa: !mesa.ativa })
      setMesas(prev => prev.map(m => (m.id === mesa.id ? updated : m)))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível atualizar a mesa.'))
    }
  }

  async function handleDelete(mesa: Mesa) {
    if (!confirm(`Remover a mesa ${mesa.numero}?`)) return
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

  return (
    <div className="min-h-screen bg-[#f5efe1] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </button>

        <h1 className="text-xl font-extrabold text-slate-900">Mesas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cada mesa tem um QR code próprio — imprima e cole na mesa para os clientes escanearem.
        </p>

        <form onSubmit={handleCreate} className="mt-6 flex gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <input
            value={novoNumero}
            onChange={event => setNovoNumero(event.target.value.replace(/\D/g, ''))}
            placeholder="Número da mesa"
            inputMode="numeric"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={creating || !novoNumero}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? 'Criando...' : 'Adicionar mesa'}
          </button>
        </form>

        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Carregando mesas...</p>
        ) : mesas.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">Nenhuma mesa cadastrada ainda.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {mesas.map(mesa => (
              <div key={mesa.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">Mesa {mesa.numero}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAtiva(mesa)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      mesa.ativa ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {mesa.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                </div>

                <div className="mt-4 flex justify-center rounded-xl bg-white p-3">
                  <QRCodeSVG value={mesaLink(tenantSlug, mesa.qrCodeToken)} size={140} />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(mesa)}
                    className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    {copiedId === mesa.id ? 'Link copiado!' : 'Copiar link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(mesa)}
                    className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
