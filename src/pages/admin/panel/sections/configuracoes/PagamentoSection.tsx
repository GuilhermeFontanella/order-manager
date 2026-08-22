import { useState } from 'react'
import { QrCode, CreditCard, Landmark, Lock } from 'lucide-react'
import SettingsSaveBar from '../../components/SettingsSaveBar'
import { useSavedFlag } from '../../hooks/useSavedFlag'
import type { MetodoPagamento } from '../../../../../services/storefront'

const METODOS: Array<{ metodo: MetodoPagamento; label: string; sublabel: string; icon: typeof QrCode }> = [
  { metodo: 'PIX', label: 'Pix', sublabel: 'Pagamento instantâneo via QR code ou copia e cola', icon: QrCode },
  { metodo: 'CARTAO_CREDITO', label: 'Cartão de crédito', sublabel: 'Aceita bandeiras principais', icon: CreditCard },
  { metodo: 'CARTAO_DEBITO', label: 'Cartão de débito', sublabel: 'Débito direto na conta do cliente', icon: Landmark },
]

export default function PagamentoSection() {
  const { saved, trigger } = useSavedFlag()
  const [ativos, setAtivos] = useState<Record<MetodoPagamento, boolean>>({
    PIX: true,
    CARTAO_CREDITO: true,
    CARTAO_DEBITO: true,
  })

  function toggle(metodo: MetodoPagamento) {
    setAtivos(prev => ({ ...prev, [metodo]: !prev[metodo] }))
  }

  return (
    <div className="ap-settings-stack">
      <div className="ap-card">
        <div className="ap-card-title">Formas de pagamento aceitas</div>
        <div className="ap-card-sub">Controla o que o cliente pode escolher ao fechar o pedido no cardápio digital.</div>

        {METODOS.map(({ metodo, label, sublabel, icon: Icon }) => (
          <div key={metodo} className="ap-toggle-row">
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
              <input type="checkbox" checked={ativos[metodo]} onChange={() => toggle(metodo)} />
              <span className="ap-switch-track" />
            </label>
          </div>
        ))}
      </div>

      <div className="ap-card ap-locked-card">
        <div className="ap-group-header">
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

      <SettingsSaveBar onSave={trigger} saved={saved} />
    </div>
  )
}
