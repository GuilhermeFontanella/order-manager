import { useState } from 'react'
import { CreditCard, TriangleAlert } from 'lucide-react'
import ConfirmDialog from '../../../../../components/ConfirmDialog'

const PLANOS = [
  { id: 'basico', nome: 'Básico', preco: 'R$ 79,90/mês', features: ['Até 4 mesas', '1 usuário de equipe', 'Suporte por e-mail'] },
  { id: 'profissional', nome: 'Profissional', preco: 'R$ 149,90/mês', features: ['Até 10 mesas', '5 usuários de equipe', 'Suporte prioritário', 'Relatórios avançados'] },
  { id: 'premium', nome: 'Premium', preco: 'R$ 279,90/mês', features: ['Mesas ilimitadas', 'Usuários ilimitados', 'Suporte 24/7', 'Integrações de pagamento'] },
]

export default function ContaSection() {
  const [planoAtual] = useState('profissional')
  const [avisoPlano, setAvisoPlano] = useState<string | null>(null)
  const [avisoCartao, setAvisoCartao] = useState(false)
  const [pendingCancel, setPendingCancel] = useState(false)
  const [cancelInfo, setCancelInfo] = useState(false)

  function handleTrocarPlano(planoId: string) {
    if (planoId === planoAtual) return
    setAvisoPlano('A troca de plano ainda não está disponível — fale com o suporte para migrar agora.')
    setTimeout(() => setAvisoPlano(null), 3500)
  }

  function confirmCancel() {
    setPendingCancel(false)
    setCancelInfo(true)
    setTimeout(() => setCancelInfo(false), 3500)
  }

  return (
    <div className="ap-settings-stack">
      <div className="ap-card">
        <span className="ap-plan-badge">Plano atual</span>
        <div className="ap-card-title">Profissional</div>
        <div className="ap-card-sub" style={{ marginBottom: 0 }}>
          R$ 149,90/mês · próxima renovação em 05/09/2026
        </div>

        <div className="ap-plan-grid">
          {PLANOS.map(plano => (
            <div key={plano.id} className={`ap-plan-card${plano.id === planoAtual ? ' is-current' : ''}`}>
              <div className="ap-plan-name">{plano.nome}</div>
              <div className="ap-plan-price">{plano.preco}</div>
              <ul className="ap-plan-features">
                {plano.features.map(feature => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`ap-btn ${plano.id === planoAtual ? 'ap-btn-ghost' : 'ap-btn-primary'}`}
                style={{ marginTop: 14, width: '100%' }}
                disabled={plano.id === planoAtual}
                onClick={() => handleTrocarPlano(plano.id)}
              >
                {plano.id === planoAtual ? 'Plano atual' : 'Selecionar'}
              </button>
            </div>
          ))}
        </div>

        {avisoPlano && <p className="ap-card-sub" style={{ marginTop: 14, marginBottom: 0 }}>{avisoPlano}</p>}
      </div>

      <div className="ap-card">
        <div className="ap-card-title">Uso atual</div>
        <div className="ap-usage-row">
          <span>Mesas ativas</span>
          <span style={{ fontFamily: 'var(--ap-font-mono)' }}>4 / 10</span>
        </div>
        <div className="ap-usage-row">
          <span>Usuários de equipe</span>
          <span style={{ fontFamily: 'var(--ap-font-mono)' }}>2 / 5</span>
        </div>
        <div className="ap-usage-row">
          <span>Produtos cadastrados</span>
          <span style={{ fontFamily: 'var(--ap-font-mono)' }}>7 (ilimitado)</span>
        </div>
      </div>

      <div className="ap-card">
        <div className="ap-card-title">Forma de pagamento da assinatura</div>
        <div className="ap-toggle-row" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="ap-toggle-info">
            <span className="ap-toggle-icon">
              <CreditCard size={15} />
            </span>
            <div>
              <div className="ap-toggle-label">Cartão terminado em 4242</div>
              <div className="ap-toggle-sublabel">Cobrança automática todo dia 5</div>
            </div>
          </div>
          <button type="button" className="ap-btn ap-btn-ghost" onClick={() => { setAvisoCartao(true); setTimeout(() => setAvisoCartao(false), 3500) }}>
            Atualizar cartão
          </button>
        </div>
        {avisoCartao && <p className="ap-card-sub" style={{ marginTop: 10, marginBottom: 0 }}>Atualização de cartão ainda não está disponível.</p>}
      </div>

      <div className="ap-card ap-danger-card">
        <div className="ap-group-header">
          <div>
            <div className="ap-card-title">Cancelar assinatura</div>
            <div className="ap-card-sub" style={{ marginBottom: 0 }}>
              Encerra o acesso à plataforma ao fim do período já pago.
            </div>
          </div>
          <button type="button" className="ap-btn ap-btn-danger" onClick={() => setPendingCancel(true)}>
            <TriangleAlert size={13} />
            Cancelar assinatura
          </button>
        </div>
        {cancelInfo && (
          <p className="ap-card-sub" style={{ marginTop: 10, marginBottom: 0 }}>
            Cancelamento ainda não está disponível por aqui — fale com o suporte.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={pendingCancel}
        title="Cancelar sua assinatura?"
        description="Você continuará com acesso até o fim do período já pago. Essa ação ainda não está implementada de fato."
        confirmLabel="Cancelar assinatura"
        destructive
        onConfirm={confirmCancel}
        onCancel={() => setPendingCancel(false)}
      />
    </div>
  )
}
