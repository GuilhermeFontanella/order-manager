import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import ConfirmDialog from '../../../../../components/ConfirmDialog'
import Snackbar from '../../components/Snackbar'
import { getApiErrorMessage } from '../../../../../services/apiClient'
import { getAssinatura, criarCheckoutAssinatura, type AssinaturaInfo, type Periodicidade } from '../../../../../services/assinatura'

const PERIODICIDADE_LABEL: Record<Periodicidade, string> = {
  MENSAL: 'Mensal',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
}

const POLL_ATTEMPTS = 6
const POLL_INTERVAL_MS = 2000

function formatMoeda(valor: number): string {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatUso(atual: number, limite: number | null): string {
  return limite === null ? `${atual} (ilimitado)` : `${atual} / ${limite}`
}

export default function ContaSection() {
  const [assinatura, setAssinatura] = useState<AssinaturaInfo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>('MENSAL')
  const [planoEmCheckout, setPlanoEmCheckout] = useState<string | null>(null)
  const [avisoCheckout, setAvisoCheckout] = useState<string | null>(null)
  const [pendingCancel, setPendingCancel] = useState(false)
  const [, setCancelInfo] = useState(false)
  const [snackbar, setSnackbar] = useState<{ message: string; variant: 'success' | 'info' } | null>(null)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function carregarAssinatura(): Promise<AssinaturaInfo | null> {
    setCarregando(true)
    setErro(null)
    return getAssinatura()
      .then(data => {
        setAssinatura(data)
        return data
      })
      .catch(err => {
        setErro(getApiErrorMessage(err, 'Não foi possível carregar os dados da assinatura.'))
        return null
      })
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregarAssinatura()

    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'retorno') {
      const planoEsperado = params.get('planId')
      window.history.replaceState(null, '', window.location.pathname)
      if (planoEsperado) aguardarConfirmacao(planoEsperado)
    }

    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function aguardarConfirmacao(planoEsperado: string, tentativa = 1) {
    getAssinatura()
      .then(data => {
        setAssinatura(data)
        if (data.currentPlan?.id === planoEsperado && data.status === 'ACTIVE') {
          setSnackbar({ message: `Pagamento confirmado! Seu plano foi atualizado para ${data.currentPlan.nome}.`, variant: 'success' })
          return
        }
        if (tentativa >= POLL_ATTEMPTS) {
          setSnackbar({ message: 'Ainda estamos confirmando seu pagamento. Atualize a página em alguns instantes.', variant: 'info' })
          return
        }
        pollTimeoutRef.current = setTimeout(() => aguardarConfirmacao(planoEsperado, tentativa + 1), POLL_INTERVAL_MS)
      })
      .catch(() => {
        if (tentativa >= POLL_ATTEMPTS) return
        pollTimeoutRef.current = setTimeout(() => aguardarConfirmacao(planoEsperado, tentativa + 1), POLL_INTERVAL_MS)
      })
  }

  async function handleSelecionarPlano(planoId: string) {
    if (planoId === assinatura?.currentPlan?.id) return
    setPlanoEmCheckout(planoId)
    setAvisoCheckout(null)
    try {
      const { checkoutUrl } = await criarCheckoutAssinatura(planoId, periodicidade)
      window.location.href = checkoutUrl
    } catch (err) {
      setAvisoCheckout(getApiErrorMessage(err, 'Não foi possível iniciar o pagamento. Tente novamente.'))
      setPlanoEmCheckout(null)
    }
  }

  function confirmCancel() {
    setPendingCancel(false)
    setCancelInfo(true)
    setTimeout(() => setCancelInfo(false), 3500)
  }

  return (
    <div className="ap-settings-stack">
      <div className="ap-card text-left">
        {carregando && <div className="ap-card-sub">Carregando dados da assinatura...</div>}

        {!carregando && erro && (
          <>
            <div className="ap-card-sub">{erro}</div>
            <button type="button" className="ap-btn ap-btn-ghost" style={{ marginTop: 10 }} onClick={carregarAssinatura}>
              Tentar novamente
            </button>
          </>
        )}

        {!carregando && !erro && assinatura && (
          <>
            <span className="ap-plan-badge">{assinatura.isTrial ? 'Período de teste' : 'Plano atual'}</span>
            <div className="ap-card-title">{assinatura.currentPlan?.nome ?? 'Nenhum plano ativo'}</div>
            <div className="ap-card-sub" style={{ marginBottom: 0 }}>
              {assinatura.currentPlan && formatMoeda(Number(assinatura.currentPlan.preco))}
              {assinatura.currentPlan && '/mês'}
              {assinatura.renewalDate && (
                <> · {assinatura.isTrial ? 'teste termina em' : 'próxima renovação em'} {formatData(assinatura.renewalDate)}</>
              )}
            </div>

            <div className="ap-period-filter" style={{ marginTop: 16, marginBottom: 4 }}>
              {(Object.keys(PERIODICIDADE_LABEL) as Periodicidade[]).map(opcao => {
                const desconto = assinatura.availablePlans[0]?.opcoesPeriodicidade.find(o => o.periodicidade === opcao)?.descontoPercentual ?? 0
                return (
                  <button
                    key={opcao}
                    type="button"
                    className={`ap-period-chip${periodicidade === opcao ? ' is-active' : ''}`}
                    onClick={() => setPeriodicidade(opcao)}
                  >
                    {PERIODICIDADE_LABEL[opcao]} {desconto > 0 ? ` ${desconto}% OFF` : ''}
                  </button>
                )
              })}
            </div>

            <div className="ap-plan-grid">
              {assinatura.availablePlans.map(plano => {
                const isCurrent = plano.id === assinatura.currentPlan?.id
                const opcao = plano.opcoesPeriodicidade.find(o => o.periodicidade === periodicidade)
                return (
                  <div key={plano.id} className={`ap-plan-card${isCurrent ? ' is-current' : ''} flex flex-col justify-between`}>
                    <div>
                      <div className="ap-plan-name">{plano.nome}</div>
                      <div className="ap-plan-price">
                        {opcao && formatMoeda(opcao.precoTotal)}
                        {opcao && opcao.meses > 1 && <span className="ap-card-sub"> a cada {opcao.meses} meses</span>}
                      </div>
                      {plano.descricao && <p className="ap-card-sub" style={{ marginTop: 8 }}>{plano.descricao}</p>}
                      {plano.features.length > 0 && (
                        <ul className="ap-plan-features">
                          {plano.features.map(feature => (
                            <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                              <Check size={13} style={{ marginTop: 2, flexShrink: 0, color: 'var(--ap-green)' }} />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`ap-btn ${isCurrent ? 'ap-btn-ghost' : 'ap-btn-primary'}`}
                      style={{ marginTop: 14, width: '100%' }}
                      disabled={isCurrent || planoEmCheckout !== null}
                      onClick={() => handleSelecionarPlano(plano.id)}
                    >
                      {isCurrent ? 'Plano atual' : planoEmCheckout === plano.id ? 'Redirecionando...' : 'Selecionar'}
                    </button>
                  </div>
                )
              })}
            </div>

            {avisoCheckout && <p className="ap-card-sub" style={{ marginTop: 14, marginBottom: 0 }}>{avisoCheckout}</p>}
          </>
        )}
      </div>

      <div className="ap-card text-left">
        <div className="ap-card-title mb-4">Uso atual</div>
        {assinatura && (
          <>
            <div className="ap-usage-row">
              <span>Mesas ativas</span>
              <span style={{ fontFamily: 'var(--ap-font-mono)' }}>{formatUso(assinatura.uso.mesasAtivas, assinatura.currentPlan?.limiteMesas ?? null)}</span>
            </div>
            <div className="ap-usage-row">
              <span>Usuários de equipe</span>
              <span style={{ fontFamily: 'var(--ap-font-mono)' }}>{formatUso(assinatura.uso.usuarios, assinatura.currentPlan?.limiteUsuarios ?? null)}</span>
            </div>
            <div className="ap-usage-row">
              <span>Produtos cadastrados</span>
              <span style={{ fontFamily: 'var(--ap-font-mono)' }}>{formatUso(assinatura.uso.produtosCadastrados, assinatura.currentPlan?.limiteProdutos ?? null)}</span>
            </div>
          </>
        )}
      </div>

      {/* <div className="ap-card ap-danger-card text-left">
        <div className="ap-group-header">
          <div>
            <div className="ap-card-title mb-4">Cancelar assinatura</div>
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
      </div> */}

      <ConfirmDialog
        open={pendingCancel}
        title="Cancelar sua assinatura?"
        description="Você continuará com acesso até o fim do período já pago. Essa ação ainda não está implementada de fato."
        confirmLabel="Cancelar assinatura"
        destructive
        onConfirm={confirmCancel}
        onCancel={() => setPendingCancel(false)}
      />

      <Snackbar
        open={snackbar !== null}
        message={snackbar?.message ?? ''}
        variant={snackbar?.variant ?? 'success'}
        onClose={() => setSnackbar(null)}
      />
    </div>
  )
}
