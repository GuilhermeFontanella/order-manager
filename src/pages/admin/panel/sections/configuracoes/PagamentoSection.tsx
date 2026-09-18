import { useEffect, useState } from 'react'
import { QrCode, CreditCard, Store, Lock } from 'lucide-react'
import { useAuth } from '../../../../../context/AuthContext'
import { getApiErrorMessage } from '../../../../../services/apiClient'
import { getConfiguracaoRestaurante } from '../../../../../services/storefront'
import { updateConfiguracaoRestaurante } from '../../../../../services/configuracaoRestaurante'
import { useSavedFlag } from '../../hooks/useSavedFlag'

type MetodoAceito = 'aceitaPix' | 'aceitaCartao' | 'aceitaBalcao'

const METODOS: Array<{ campo: MetodoAceito; label: string; sublabel: string; icon: typeof QrCode }> = [
  { campo: 'aceitaPix', label: 'Pix', sublabel: 'Pagamento instantâneo via QR code ou copia e cola', icon: QrCode },
  {
    campo: 'aceitaCartao',
    label: 'Cartão',
    sublabel: 'Crédito e débito. Habilita também carteiras digitais como Google Pay',
    icon: CreditCard,
  },
  { campo: 'aceitaBalcao', label: 'Pagar no balcão', sublabel: 'Cliente paga pessoalmente ao retirar o pedido', icon: Store },
]

export default function PagamentoSection() {
  const { user } = useAuth()
  const { saved, trigger } = useSavedFlag()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [ativos, setAtivos] = useState<Record<MetodoAceito, boolean>>({
    aceitaPix: true,
    aceitaCartao: true,
    aceitaBalcao: true,
  })

  useEffect(() => {
    if (!user?.tenant?.slug) return
    let isMounted = true
    getConfiguracaoRestaurante(user.tenant.slug)
      .then(config => {
        if (!isMounted) return
        setAtivos({
          aceitaPix: config.aceitaPix,
          aceitaCartao: config.aceitaCartao,
          aceitaBalcao: config.aceitaBalcao,
        })
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar as formas de pagamento.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [user?.tenant?.slug])

  const nenhumAtivo = !ativos.aceitaPix && !ativos.aceitaCartao && !ativos.aceitaBalcao

  function toggle(campo: MetodoAceito) {
    setAtivos(prev => ({ ...prev, [campo]: !prev[campo] }))
  }

  async function handleSave() {
    if (nenhumAtivo) {
      setError('O estabelecimento precisa aceitar pelo menos um método de pagamento.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateConfiguracaoRestaurante(ativos)
      trigger()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível salvar as formas de pagamento.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="ap-card-sub">Carregando formas de pagamento...</p>
  }

  return (
    <div className="ap-settings-stack">
      {error && (
        <p className="ap-card" style={{ marginBottom: 16, color: 'var(--ap-red)' }}>
          {error}
        </p>
      )}

      <div className="ap-card text-left">
        <div className="ap-card-title">Formas de pagamento aceitas</div>
        <div className="ap-card-sub">Controla o que o cliente pode escolher ao fechar o pedido no cardápio digital. O estabelecimento precisa aceitar pelo menos uma forma de pagamento.</div>

        {METODOS.map(({ campo, label, sublabel, icon: Icon }) => (
          <div key={campo} className="ap-toggle-row">
            <div className="ap-toggle-info">
              <span className="ap-toggle-icon">
                <Icon size={15} />
              </span>
              <div>
                <div className="ap-toggle-label">{label}</div>
                <div className="ap-toggle-sublabel">{sublabel}</div>
              </div>
            </div>
            <label className="ap-switch">
              <input type="checkbox" checked={ativos[campo]} onChange={() => toggle(campo)} />
              <span className="ap-switch-track" />
            </label>
          </div>
        ))}
      </div>

      <div className="ap-card ap-locked-card">
        <div className="ap-group-header text-left">
          <div>
            <div className="ap-card-title">Integrações de pagamento</div>
            <div className="ap-card-sub" style={{ marginBottom: 0 }}>
              Conecte um gateway de pagamento para processar cobranças automaticamente.
            </div>
          </div>
          <span className="ap-locked-badge">
            <Lock size={11} />
            Em breve
          </span>
        </div>

        <div className="ap-locked-fields">
          <div className="ap-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="ap-field">
              <label className="ap-field-label">API key</label>
              <input className="ap-input" placeholder="pk_live_..." disabled />
            </div>
            <div className="ap-field">
              <label className="ap-field-label">Secret key</label>
              <input className="ap-input" placeholder="sk_live_..." disabled />
            </div>
          </div>
        </div>
      </div>

      <div className="ap-group-header" style={{ marginTop: 20 }}>
        <span className="ap-card-sub" style={{ margin: 0 }}>
          {saved ? 'Alterações salvas.' : 'As alterações são exibidas no checkout do cardápio digital.'}
        </span>
        <button type="button" className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving || nenhumAtivo}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}
