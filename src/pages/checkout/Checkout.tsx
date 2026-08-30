import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowLeft, Check, ChevronRight, CreditCard, QrCode, Wallet } from 'lucide-react'
import { useCart, cartItemUnitPrice } from '../../context/CartContext'
import { fmt } from '../../data/menu'
import { useNavigate } from 'react-router-dom'
import { readMesaSession } from '../../lib/mesaSession'
import { confirmarPagamento, createPedido, type MetodoPagamento, type PedidoCriado } from '../../services/storefront'
import '../../styles/ember-theme.css'
import IconButton from '../../components/ember/IconButton'
import Button from '../../components/ember/Button'
import TextField from '../../components/ember/TextField'

type Step = 'identificacao' | 'revisao' | 'pagamento' | 'pix' | 'cartao'

function ProgressDots({ active }: { active: 0 | 1 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="h-2 rounded-full transition-all"
          style={{
            width: i === active ? 24 : 8,
            background: i === active ? 'var(--accent)' : 'var(--border-strong)',
          }}
        />
      ))}
    </div>
  )
}

function CheckoutHeader({ active, onClose }: { active: 0 | 1; onClose: () => void }) {
  return (
    <header className="relative flex items-center justify-between px-4 py-4">
      <IconButton icon={ArrowLeft} label="Fechar" onClick={onClose} />
      <ProgressDots active={active} />
      <span style={{ width: 44 }} />
    </header>
  )
}

function GlassCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', ...style }}
    >
      {children}
    </div>
  )
}

function ItemSummaryCard({ itemCount, total }: { itemCount: number; total: number }) {
  return (
    <GlassCard style={{ marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
        {itemCount} {itemCount === 1 ? 'item' : 'itens'} no pedido
      </span>
      <span style={{ font: 'var(--text-title)', color: 'var(--text-price)' }}>{fmt(total)}</span>
    </GlassCard>
  )
}

function PixQrCode() {
  const size = 21
  const grid = useMemo(() => {
    let seed = 42
    function rand() {
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    const cells: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => rand() > 0.5)
    )

    const drawFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const border = x === 0 || x === 6 || y === 0 || y === 6
          const innerFill = x >= 2 && x <= 4 && y >= 2 && y <= 4
          cells[oy + y][ox + x] = border || innerFill
        }
      }
    }
    drawFinder(0, 0)
    drawFinder(size - 7, 0)
    drawFinder(0, size - 7)

    return cells
  }, [])

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 176, height: 176, background: '#fff', borderRadius: 'var(--r-sm)' }}
    >
      {grid.flatMap((row, y) =>
        row.map((filled, x) => (
          <div key={`${x}-${y}`} style={{ background: filled ? '#0e0907' : '#fff' }} />
        ))
      )}
    </div>
  )
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return (digits.match(/.{1,4}/g) ?? []).join(' ')
}

function formatValidade(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function Checkout() {
  const { items, clear } = useCart()
  const navigate = useNavigate()
  const total = items.reduce((s, it) => s + cartItemUnitPrice(it) * it.qty, 0)
  const itemCount = items.reduce((s, it) => s + it.qty, 0)

  const [step, setStep] = useState<Step>('identificacao')
  const [nome, setNome] = useState('')

  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento | null>(null)
  const [pedido, setPedido] = useState<PedidoCriado | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const [copied, setCopied] = useState(false)
  const pixCode = '00020126360014BR.GOV.BCB.PIX0114+55119999999952040000530398654' + Math.round(total)

  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardValidade, setCardValidade] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const cardValid =
    cardNumber.replace(/\D/g, '').length === 16 &&
    cardName.trim().length > 0 &&
    cardValidade.length === 5 &&
    cardCvv.length >= 3

  async function handleConfirmPedido() {
    if (!metodoPagamento) return

    const session = readMesaSession()
    if (!session) {
      setSubmitError('Sessão da mesa expirada. Escaneie o QR code novamente.')
      return
    }

    setSubmitError(null)
    setSubmitting(true)
    try {
      const created = await createPedido(session.tenantSlug, {
        mesaQrCodeToken: session.qrCodeToken,
        nomeCliente: nome.trim(),
        pagamento: { metodo: metodoPagamento },
        itens: items.map(it => ({
          produtoId: it.item.id,
          quantidade: it.qty,
          observacao: it.obs || undefined,
          opcoesSelecionadas: it.selecoes?.map(s => ({
            grupoOpcaoNome: s.grupoNome,
            opcaoNome: s.opcaoNome,
            precoAdicional: s.precoAdicional,
          })),
        })),
      })
      setPedido(created)
      setStep(metodoPagamento === 'PIX' ? 'pix' : 'cartao')
    } catch {
      setSubmitError('Não foi possível enviar o pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmPagamento() {
    if (!pedido) return

    const session = readMesaSession()
    if (!session) {
      setConfirmError('Sessão da mesa expirada. Escaneie o QR code novamente.')
      return
    }

    setConfirmError(null)
    setConfirming(true)
    try {
      const { pedido: updated } = await confirmarPagamento(session.tenantSlug, pedido.id, pedido.confirmacaoToken)
      setPedido({ ...updated, confirmacaoToken: pedido.confirmacaoToken })
      clear()
      navigate('/order')
    } catch {
      setConfirmError('Não foi possível confirmar o pagamento. Tente novamente.')
    } finally {
      setConfirming(false)
    }
  }

  async function handleCopyPixCode() {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponível, ignora silenciosamente
    }
  }

  if (items.length === 0) {
    return (
      <div className="ember-theme min-h-screen p-4">
        <h1 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)', marginBottom: 'var(--sp-4)' }}>Finalizar pedido</h1>
        <div style={{ color: 'var(--text-muted)' }}>Seu carrinho está vazio.</div>
      </div>
    )
  }

  if (step === 'identificacao') {
    return (
      <div className="ember-theme min-h-screen">
        <CheckoutHeader active={0} onClose={() => navigate(-1)} />

        <div className="px-4 pb-24">
          <ItemSummaryCard itemCount={itemCount} total={total} />

          <h2 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Como podemos te chamar?</h2>
          <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            Vamos usar esse nome no painel do balcão para chamar você quando o pedido estiver pronto.
          </p>

          <div className="mt-6">
            <TextField
              id="checkout-nome"
              label="Seu nome"
              value={nome}
              onChange={event => setNome(event.target.value)}
              placeholder="Ex: Guilherme"
            />
          </div>

          <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-6)' }} disabled={!nome.trim()} onClick={() => setStep('pagamento')}>
            Continuar
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'pagamento') {
    const methods = [
      { id: 'PIX' as const, label: 'Pix', desc: 'Aprovação na hora, via QR code', icon: QrCode },
      { id: 'CARTAO_CREDITO' as const, label: 'Cartão de crédito', desc: 'Visa, Mastercard, Elo', icon: CreditCard },
      { id: 'CARTAO_DEBITO' as const, label: 'Cartão de débito', desc: 'Débito na hora', icon: Wallet },
    ]

    return (
      <div className="ember-theme min-h-screen">
        <CheckoutHeader active={1} onClose={() => setStep('identificacao')} />

        <div className="px-4 pb-24">
          <ItemSummaryCard itemCount={itemCount} total={total} />

          <h2 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Como você vai pagar?</h2>
          <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            Escolha a forma de pagamento para enviar o pedido para a cozinha.
          </p>

          <div className="mt-6 space-y-3">
            {methods.map(method => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => { setMetodoPagamento(method.id); setStep('revisao') }}
                  className="w-full flex items-center gap-4 px-4 py-4 text-left transition"
                  style={{ borderRadius: 'var(--r-card)', background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)' }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center"
                    style={{ borderRadius: 'var(--r-md)', background: 'var(--accent-soft)', color: 'var(--accent-quiet)' }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{method.label}</div>
                    <div className="mt-0.5" style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>{method.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'revisao') {
    return (
      <div className="ember-theme min-h-screen">
        <CheckoutHeader active={1} onClose={() => setStep('pagamento')} />
        <div className="px-4 pb-24">
          <h2 className="mb-6" style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Revisão do pedido</h2>
          <ul className="space-y-3">
            {items.map(it => (
              <li key={it.id}>
                <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="text-left w-8/12">
                    <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{it.item.nome}</div>
                    {it.selecoes && it.selecoes.length > 0 && (
                      <div style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>
                        {it.selecoes.map(s => s.opcaoNome).join(', ')}
                      </div>
                    )}
                    <div style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>{it.qty} x {fmt(cartItemUnitPrice(it))}</div>
                  </div>
                  <div style={{ font: 'var(--text-title)', color: 'var(--text-price)' }}>{fmt(cartItemUnitPrice(it) * it.qty)}</div>
                </GlassCard>
              </li>
            ))}
          </ul>

          {submitError && (
            <p className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'color-mix(in srgb, var(--danger) 16%, transparent)', color: 'var(--danger)', font: 'var(--text-body)' }}>{submitError}</p>
          )}

          <div className="mt-6">
            <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="text-left">
                <div style={{ font: 'var(--text-label)', color: 'var(--text-muted)' }}>Total</div>
                <div style={{ font: 'var(--text-h2)', color: 'var(--text-price)' }}>{fmt(total)}</div>
              </div>
              <IconButton icon={Check} label="Confirmar pedido" variant="accent" onClick={handleConfirmPedido} style={{ opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }} />
            </GlassCard>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'pix') {
    return (
      <div className="ember-theme min-h-screen">
        <CheckoutHeader active={1} onClose={() => setStep('revisao')} />

        <div className="px-4 pb-24">
          <h2 className="mb-6" style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Pagar com Pix</h2>
          {pedido && (
            <p className="mb-2 text-right" style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>Pedido nº {pedido.numeroSequencial}</p>
          )}
          <ItemSummaryCard itemCount={itemCount} total={total} />

          <GlassCard style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PixQrCode />
            <div className="mt-4" style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>{fmt(total)}</div>
            <p className="mt-2 text-center" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
              Abra o app do seu banco e escaneie o código, ou copie e cole na área Pix Copia e Cola.
            </p>
          </GlassCard>

          <div className="mt-4">
            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <span className="flex-1 truncate" style={{ font: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{pixCode}</span>
              <button
                type="button"
                onClick={handleCopyPixCode}
                className="shrink-0 px-3 py-1.5"
                style={{ borderRadius: 'var(--r-sm)', background: 'var(--surface-control)', color: 'var(--text-primary)', font: 'var(--text-caption)' }}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </GlassCard>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--gold-500)' }} />
            Aguardando confirmação do pagamento...
          </div>

          {confirmError && (
            <p className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'color-mix(in srgb, var(--danger) 16%, transparent)', color: 'var(--danger)', font: 'var(--text-body)' }}>{confirmError}</p>
          )}

          <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-6)' }} disabled={confirming} onClick={handleConfirmPagamento}>
            {confirming ? 'Confirmando...' : 'Simular pagamento confirmado'}
          </Button>
        </div>
      </div>
    )
  }

  const cardStepTitle = metodoPagamento === 'CARTAO_DEBITO' ? 'Cartão de débito' : 'Cartão de crédito'

  return (
    <div className="ember-theme min-h-screen">
      <CheckoutHeader active={1} onClose={() => setStep('revisao')} />

      <div className="px-4 pb-24">
        <h2 className="mb-6" style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>{cardStepTitle}</h2>
        {pedido && (
          <p className="mb-2 text-right" style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>Pedido nº {pedido.numeroSequencial}</p>
        )}
        <ItemSummaryCard itemCount={itemCount} total={total} />

        <div className="space-y-5">
          <TextField
            id="card-number" label="Número do cartão"
            value={cardNumber}
            onChange={event => setCardNumber(formatCardNumber(event.target.value))}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
          />

          <TextField
            id="card-name" label="Nome impresso no cartão"
            value={cardName}
            onChange={event => setCardName(event.target.value)}
            placeholder="Como está no cartão"
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              id="card-validade" label="Validade"
              value={cardValidade}
              onChange={event => setCardValidade(formatValidade(event.target.value))}
              placeholder="MM/AA"
              inputMode="numeric"
            />
            <TextField
              id="card-cvv" label="CVV"
              value={cardCvv}
              onChange={event => setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              inputMode="numeric"
            />
          </div>
        </div>

        {confirmError && (
          <p className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'color-mix(in srgb, var(--danger) 16%, transparent)', color: 'var(--danger)', font: 'var(--text-body)' }}>{confirmError}</p>
        )}

        <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-6)' }} disabled={!cardValid || confirming} onClick={handleConfirmPagamento}>
          {confirming ? 'Confirmando...' : `Pagar ${fmt(total)}`}
        </Button>
      </div>
    </div>
  )
}
