import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowLeft, Check, ChevronRight, CreditCard, MapPin, QrCode, Store, Tag, Wallet, X } from 'lucide-react'
import { useCart, cartItemUnitPrice } from '../../context/CartContext'
import { fmt } from '../../data/menu'
import { useNavigate } from 'react-router-dom'
import { readMesaSession } from '../../lib/mesaSession'
import {
  bairroAtendido,
  buscarStatusPagamento,
  createPedido,
  getAreaAtendimento,
  getConfiguracaoRestaurante,
  validarCupom,
  type AreaAtendimentoCidade,
  type ConfiguracaoRestaurante,
  type CupomAplicado,
  type EnderecoEntrega,
  type MetodoPagamento,
  type PedidoCriado,
  type TipoEntrega,
} from '../../services/storefront'
import { buscarEnderecoPorCep } from '../../services/cep'
import { getApiErrorMessage } from '../../services/apiClient'
import '../../styles/ember-theme.css'
import IconButton from '../../components/ember/IconButton'
import Button from '../../components/ember/Button'
import TextField from '../../components/ember/TextField'
import SegmentedControl from '../../components/ember/SegmentedControl'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any
  }
}

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY ?? 'APP_USR-8b45d0d3-8145-4f04-a26d-fee45dd7642e'

function useMercadoPagoSDK() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (window.MercadoPago) { setLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])
  return loaded
}

type Step = 'identificacao' | 'entrega' | 'revisao' | 'pagamento' | 'pix' | 'cartao' | 'carteira'

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

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return (digits.match(/.{1,4}/g) ?? []).join(' ')
}

function formatValidade(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function Checkout() {
  const { items, clear } = useCart()
  const navigate = useNavigate()
  const mpLoaded = useMercadoPagoSDK()
  const total = items.reduce((s, it) => s + cartItemUnitPrice(it) * it.qty, 0)
  const itemCount = items.reduce((s, it) => s + it.qty, 0)

  const [step, setStep] = useState<Step>('identificacao')
  const [nome, setNome] = useState('')
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento | null>(null)
  const [pedido, setPedido] = useState<PedidoCriado | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const temMesa = !!readMesaSession()?.qrCodeToken
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>(
    temMesa ? 'RETIRADA_BALCAO' : 'TAKE_AWAY',
  )
  const [configRestaurante, setConfigRestaurante] = useState<ConfiguracaoRestaurante | null>(null)
  const [areaAtendimento, setAreaAtendimento] = useState<AreaAtendimentoCidade[]>([])
  const [enderecoCep, setEnderecoCep] = useState('')
  const [enderecoRua, setEnderecoRua] = useState('')
  const [enderecoNumero, setEnderecoNumero] = useState('')
  const [enderecoBairro, setEnderecoBairro] = useState('')
  const [enderecoCidade, setEnderecoCidade] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [enderecoError, setEnderecoError] = useState<string | null>(null)

  useEffect(() => {
    const session = readMesaSession()
    if (!session) return
    Promise.all([
      getConfiguracaoRestaurante(session.tenantSlug),
      getAreaAtendimento(session.tenantSlug),
    ])
      .then(([config, cidades]) => {
        setConfigRestaurante(config)
        setAreaAtendimento(cidades)
      })
      .catch(() => {
        // se falhar, seguimos com os padrões (take away no fluxo sem mesa / balcão no fluxo com mesa)
      })
  }, [])

  const coberturaOk =
    tipoEntrega !== 'DELIVERY' || !enderecoCidade.trim() || !enderecoBairro.trim()
      ? null
      : bairroAtendido(areaAtendimento, enderecoCidade, enderecoBairro)

  useEffect(() => {
    const digits = enderecoCep.replace(/\D/g, '')
    if (digits.length !== 8) return

    let isMounted = true

    async function buscarCep() {
      setCepLoading(true)
      setEnderecoError(null)
      try {
        const endereco = await buscarEnderecoPorCep(digits)
        if (!isMounted) return
        if (!endereco) { setEnderecoError('CEP não encontrado.'); return }
        setEnderecoRua(endereco.rua)
        setEnderecoBairro(endereco.bairro)
        setEnderecoCidade(endereco.cidade)
      } catch {
        if (isMounted) setEnderecoError('Não foi possível buscar o CEP. Preencha o endereço manualmente.')
      } finally {
        if (isMounted) setCepLoading(false)
      }
    }

    buscarCep()

    return () => { isMounted = false }
  }, [enderecoCep])

  const enderecoCompleto =
    enderecoCep.replace(/\D/g, '').length === 8 &&
    !!enderecoRua.trim() &&
    !!enderecoNumero.trim() &&
    !!enderecoBairro.trim() &&
    !!enderecoCidade.trim()

  const entregaValida = tipoEntrega !== 'DELIVERY' || (enderecoCompleto && coberturaOk === true)

  function buildEndereco(): EnderecoEntrega | undefined {
    if (tipoEntrega !== 'DELIVERY') return undefined
    return {
      cep: enderecoCep,
      rua: enderecoRua,
      numero: enderecoNumero,
      bairro: enderecoBairro,
      cidade: enderecoCidade,
    }
  }

  const [codigoCupomInput, setCodigoCupomInput] = useState('')
  const [cupomAplicado, setCupomAplicado] = useState<CupomAplicado | null>(null)
  const [cupomLoading, setCupomLoading] = useState(false)
  const [cupomError, setCupomError] = useState<string | null>(null)

  const valorDescontoCentavos = cupomAplicado ? Math.round(parseFloat(cupomAplicado.valorDesconto) * 100) : 0
  const totalFinal = total - valorDescontoCentavos

  const [copied, setCopied] = useState(false)
  const [numeroPedidoConfirmado, setNumeroPedidoConfirmado] = useState<number | null>(null)
  const [numeroPedidoBalcao, setNumeroPedidoBalcao] = useState<number | null>(null)
  const pixCode = pedido?.pagamento?.pixQrCode ?? ''
  const pixQrBase64 = pedido?.pagamento?.pixQrCodeBase64 ?? ''

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardValidade, setCardValidade] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardCpf, setCardCpf] = useState('')
  const [cardError, setCardError] = useState<string | null>(null)
  const [processingCard, setProcessingCard] = useState(false)

  const cardValid =
    cardNumber.replace(/\D/g, '').length === 16 &&
    cardName.trim().length > 0 &&
    cardValidade.length === 5 &&
    cardCvv.length >= 3 &&
    cardCpf.replace(/\D/g, '').length === 11

  // Polling do status do PIX
  useEffect(() => {
    if (step !== 'pix' || !pedido) return
    const session = readMesaSession()
    if (!session) return

    pollingRef.current = setInterval(async () => {
      try {
        const pagamento = await buscarStatusPagamento(session.tenantSlug, pedido.id)
        if (pagamento?.status === 'APROVADO') {
          clearInterval(pollingRef.current!)
          setNumeroPedidoConfirmado(pedido.numeroSequencial)
        }
      } catch {
        // ignora erros de rede no polling
      }
    }, 3000)

    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [step, pedido, clear, navigate])

  // QR code gerado a partir do base64 do MP
  const pixQrSrc = useMemo(() => {
    if (!pixQrBase64) return null
    if (pixQrBase64.startsWith('data:')) return pixQrBase64
    return `data:image/png;base64,${pixQrBase64}`
  }, [pixQrBase64])

  function buildItens() {
    return items.map(it => ({
      produtoId: it.item.id,
      quantidade: it.qty,
      observacao: it.obs || undefined,
      opcoesSelecionadas: it.selecoes?.map(s => ({
        grupoOpcaoNome: s.grupoNome,
        opcaoNome: s.opcaoNome,
        precoAdicional: s.precoAdicional,
      })),
    }))
  }

  async function handleAplicarCupom() {
    const session = readMesaSession()
    if (!session) { setCupomError('Sessão da mesa expirada. Escaneie o QR code novamente.'); return }
    const codigo = codigoCupomInput.trim()
    if (!codigo) return

    setCupomLoading(true)
    setCupomError(null)
    try {
      const resultado = await validarCupom(session.tenantSlug, { codigo, itens: buildItens() })
      setCupomAplicado(resultado)
    } catch (err) {
      setCupomAplicado(null)
      setCupomError(getApiErrorMessage(err, 'Não foi possível aplicar o cupom.'))
    } finally {
      setCupomLoading(false)
    }
  }

  function handleRemoverCupom() {
    setCupomAplicado(null)
    setCodigoCupomInput('')
    setCupomError(null)
  }

  // PIX: cria pedido agora e exibe QR code para pagamento
  async function handleConfirmPedidoPix() {
    const session = readMesaSession()
    if (!session) { setSubmitError('Sessão da mesa expirada. Escaneie o QR code novamente.'); return }

    setSubmitError(null)
    setSubmitting(true)
    try {
      const created = await createPedido(session.tenantSlug, {
        mesaQrCodeToken: session.qrCodeToken,
        tipoEntrega,
        endereco: buildEndereco(),
        nomeCliente: nome.trim(),
        pagamento: { metodo: 'PIX' },
        itens: buildItens(),
        codigoCupom: cupomAplicado?.codigo,
      })
      setPedido(created)
      setStep('pix')
    } catch {
      setSubmitError('Não foi possível enviar o pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // Balcão: cria o pedido sem passar pelo gateway; cliente paga presencialmente ao retirar
  async function handleConfirmPedidoBalcao() {
    const session = readMesaSession()
    if (!session) { setSubmitError('Sessão da mesa expirada. Escaneie o QR code novamente.'); return }

    setSubmitError(null)
    setSubmitting(true)
    try {
      const created = await createPedido(session.tenantSlug, {
        mesaQrCodeToken: session.qrCodeToken,
        tipoEntrega,
        endereco: buildEndereco(),
        nomeCliente: nome.trim(),
        pagamento: { metodo: 'BALCAO' },
        itens: buildItens(),
        codigoCupom: cupomAplicado?.codigo,
      })
      setNumeroPedidoBalcao(created.numeroSequencial)
    } catch {
      setSubmitError('Não foi possível enviar o pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // Cartão: avança para o formulário sem criar pedido ainda
  function handleConfirmPedidoCartao() {
    setStep('cartao')
  }

  // Carteira digital: avança para a tela de confirmação via Payment Request API
  function handleConfirmPedidoCarteira() {
    setStep('carteira')
  }

  async function handleCopyPixCode() {
    if (!pixCode) return
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponível
    }
  }

  // Cartão: tokeniza e cria o pedido em uma única chamada
  async function handlePagarCartao() {
    if (!mpLoaded) return
    const session = readMesaSession()
    if (!session) { setCardError('Sessão da mesa expirada.'); return }

    setCardError(null)
    setProcessingCard(true)

    try {
      const mp = new window.MercadoPago(MP_PUBLIC_KEY)
      const [expirationMonth, expirationYear] = cardValidade.split('/')

      const token = await mp.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardName.trim(),
        cardExpirationMonth: expirationMonth,
        cardExpirationYear: `20${expirationYear}`,
        securityCode: cardCvv,
        identificationType: 'CPF',
        identificationNumber: cardCpf.replace(/\D/g, ''),
      })

      const bin = cardNumber.replace(/\s/g, '').slice(0, 6)
      const paymentMethods = await mp.getPaymentMethods({ bin })
      const paymentMethodId = paymentMethods?.results?.[0]?.id ?? 'visa'

      const criado = await createPedido(session.tenantSlug, {
        mesaQrCodeToken: session.qrCodeToken,
        tipoEntrega,
        endereco: buildEndereco(),
        nomeCliente: nome.trim(),
        pagamento: {
          metodo: metodoPagamento!,
          cardToken: token.id,
          paymentMethodId,
          installments: 1,
        },
        itens: buildItens(),
        codigoCupom: cupomAplicado?.codigo,
      })

      if (criado.pagamento?.status === 'APROVADO') {
        setNumeroPedidoConfirmado(criado.numeroSequencial)
      } else {
        setCardError('Pagamento não aprovado. Verifique os dados do cartão e tente novamente.')
      }
    } catch (err) {
      console.error('Erro ao processar pagamento com cartão:', err)
      const mpMessage = (err as { message?: string; cause?: Array<{ description?: string }> })?.cause?.[0]?.description
        ?? (err as Error)?.message
      setCardError(mpMessage ? `Erro ao processar o cartão: ${mpMessage}` : 'Erro ao processar o cartão. Verifique os dados e tente novamente.')
    } finally {
      setProcessingCard(false)
    }
  }

  if (numeroPedidoBalcao !== null) {
    return (
      <div className="ember-theme min-h-screen flex items-center justify-center p-4">
        <div
          className="rounded-2xl px-6 py-8 flex flex-col items-center text-center"
          style={{ background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', maxWidth: 360, width: '100%' }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full mb-4"
            style={{ background: 'var(--accent-soft)' }}
          >
            <Store className="h-8 w-8" style={{ color: 'var(--accent)' }} />
          </div>
          <h2 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>
            Pedido registrado!
          </h2>
          <p style={{ font: 'var(--text-body)', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' }}>
            Apresente o número abaixo no balcão para pagar e retirar seu pedido.
          </p>
          <p style={{ font: 'var(--text-title)', color: 'var(--text-primary)', marginBottom: 'var(--sp-6)' }}>
            Pedido nº <span style={{ color: 'var(--accent)' }}>#{numeroPedidoBalcao}</span>
          </p>
          <Button
            fullWidth
            size="lg"
            onClick={() => {
              clear()
              navigate('/order')
            }}
          >
            OK
          </Button>
        </div>
      </div>
    )
  }

  if (numeroPedidoConfirmado !== null) {
    return (
      <div className="ember-theme min-h-screen flex items-center justify-center p-4">
        <div
          className="rounded-2xl px-6 py-8 flex flex-col items-center text-center"
          style={{ background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', maxWidth: 360, width: '100%' }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full mb-4"
            style={{ background: 'var(--accent-soft)' }}
          >
            <Check className="h-8 w-8" style={{ color: 'var(--accent)' }} />
          </div>
          <h2 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>
            Pagamento confirmado!
          </h2>
          <p style={{ font: 'var(--text-body)', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' }}>
            Seu pedido foi recebido e já está sendo preparado.
          </p>
          <p style={{ font: 'var(--text-title)', color: 'var(--text-primary)', marginBottom: 'var(--sp-6)' }}>
            Pedido nº <span style={{ color: 'var(--accent)' }}>#{numeroPedidoConfirmado}</span>
          </p>
          <Button
            fullWidth
            size="lg"
            onClick={() => {
              clear()
              navigate('/order')
            }}
          >
            OK
          </Button>
        </div>
      </div>
    )
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
          <ItemSummaryCard itemCount={itemCount} total={totalFinal} />
          <h2 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Como podemos te chamar?</h2>
          <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            Vamos usar esse nome no painel do balcão para chamar você quando o pedido estiver pronto.
          </p>
          <div className="mt-6">
            <TextField id="checkout-nome" label="Seu nome" value={nome} onChange={event => setNome(event.target.value)} placeholder="Ex: Guilherme" />
          </div>
          <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-6)' }} disabled={!nome.trim()} onClick={() => setStep('entrega')}>
            Continuar
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'entrega') {
    const opcoes: Array<{ value: TipoEntrega; label: string }> = temMesa
      ? [
          { value: 'RETIRADA_BALCAO', label: 'Retirar no balcão' },
          { value: 'TAKE_AWAY', label: 'Take away' },
        ]
      : [
          ...(configRestaurante?.permiteTakeaway !== false ? [{ value: 'TAKE_AWAY' as const, label: 'Take away' }] : []),
          ...(configRestaurante?.permiteDelivery ? [{ value: 'DELIVERY' as const, label: 'Entrega (delivery)' }] : []),
        ]

    return (
      <div className="ember-theme min-h-screen">
        <CheckoutHeader active={0} onClose={() => setStep('identificacao')} />
        <div className="px-4 pb-24">
          <ItemSummaryCard itemCount={itemCount} total={totalFinal} />
          <h2 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Como você quer receber?</h2>
          <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            {temMesa ? 'Você está no estabelecimento — escolha como prefere retirar o pedido.' : 'Escolha como você quer receber o seu pedido.'}
          </p>

          <div className="mt-6">
            <SegmentedControl
              options={opcoes}
              value={tipoEntrega}
              onChange={value => setTipoEntrega(value as TipoEntrega)}
            />
          </div>

          {tipoEntrega === 'DELIVERY' && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2" style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>
                <MapPin className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                Endereço de entrega
              </div>
              <TextField
                id="endereco-cep"
                label="CEP"
                value={enderecoCep}
                onChange={event => setEnderecoCep(event.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="00000000"
                inputMode="numeric"
              />
              {cepLoading && (
                <p style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>Buscando endereço...</p>
              )}
              <TextField id="endereco-rua" label="Rua / logradouro" value={enderecoRua} onChange={event => setEnderecoRua(event.target.value)} placeholder="Nome da rua" />
              <div className="grid grid-cols-2 gap-3">
                <TextField id="endereco-numero" label="Número" value={enderecoNumero} onChange={event => setEnderecoNumero(event.target.value)} placeholder="Ex: 100" />
                <TextField id="endereco-bairro" label="Bairro" value={enderecoBairro} onChange={event => setEnderecoBairro(event.target.value)} placeholder="Bairro" />
              </div>
              <TextField id="endereco-cidade" label="Cidade" value={enderecoCidade} onChange={event => setEnderecoCidade(event.target.value)} placeholder="Cidade" />

              {enderecoError && (
                <p style={{ font: 'var(--text-caption)', color: 'var(--danger)' }}>{enderecoError}</p>
              )}
              {coberturaOk === false && (
                <p style={{ font: 'var(--text-caption)', color: 'var(--danger)' }}>
                  Não entregamos nesse bairro no momento.
                </p>
              )}
              {coberturaOk === true && (
                <p style={{ font: 'var(--text-caption)', color: 'var(--accent)' }}>
                  Atendemos esse bairro. ✓
                </p>
              )}
            </div>
          )}

          <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-6)' }} disabled={!entregaValida} onClick={() => setStep('pagamento')}>
            Continuar
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'pagamento') {
    const supportsPaymentRequest = typeof window !== 'undefined' && 'PaymentRequest' in window
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const supportsApplePay = supportsPaymentRequest && isIOS && isSafari

    const methods = [
      { id: 'PIX' as const, label: 'Pix', desc: 'Aprovação na hora, via QR code', icon: QrCode, wallet: false },
      { id: 'CARTAO_CREDITO' as const, label: 'Cartão de crédito', desc: 'Visa, Mastercard, Elo', icon: CreditCard, wallet: false },
      { id: 'CARTAO_DEBITO' as const, label: 'Cartão de débito', desc: 'Débito na hora', icon: Wallet, wallet: false },
      ...(supportsPaymentRequest ? [{ id: 'GOOGLE_PAY' as const, label: 'Google Pay', desc: 'Pague com sua carteira Google', icon: Wallet, wallet: true, logo: 'google' }] : []),
      ...(supportsApplePay ? [{ id: 'APPLE_PAY' as const, label: 'Apple Pay', desc: 'Pague com seu dispositivo Apple', icon: Wallet, wallet: true, logo: 'apple' }] : []),
      { id: 'BALCAO' as const, label: 'Pagar no balcão', desc: 'Pague pessoalmente ao retirar seu pedido', icon: Store, wallet: false },
    ]

    return (
      <div className="ember-theme min-h-screen">
        <CheckoutHeader active={1} onClose={() => setStep('entrega')} />
        <div className="px-4 pb-24">
          <ItemSummaryCard itemCount={itemCount} total={totalFinal} />
          <h2 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Como você vai pagar?</h2>
          <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            Escolha a forma de pagamento para enviar o pedido para a cozinha.
          </p>
          <div className="mt-6 space-y-3">
            {methods.map(method => {
              const Icon = method.icon
              const isWallet = (method as { wallet: boolean }).wallet
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
                    style={{
                      borderRadius: 'var(--r-md)',
                      background: isWallet
                        ? ((method as { logo?: string }).logo === 'apple' ? '#000' : '#fff')
                        : 'var(--accent-soft)',
                      color: isWallet ? '#fff' : 'var(--accent-quiet)',
                      border: isWallet && (method as { logo?: string }).logo === 'google' ? '1px solid var(--border-strong)' : 'none',
                    }}
                  >
                    {(method as { logo?: string }).logo === 'google' ? (
                      <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    ) : (method as { logo?: string }).logo === 'apple' ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.32-2.15 3.93.03 3.12 2.6 4.16 2.63 4.17l-.03.07zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
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

          <GlassCard style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
            {tipoEntrega === 'DELIVERY' ? <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} /> : <Store className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />}
            <div className="text-left">
              <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>
                {tipoEntrega === 'RETIRADA_BALCAO' ? 'Retirar no balcão' : tipoEntrega === 'TAKE_AWAY' ? 'Take away' : 'Entrega (delivery)'}
              </div>
              {tipoEntrega === 'DELIVERY' && (
                <div style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>
                  {enderecoRua}, {enderecoNumero} — {enderecoBairro}, {enderecoCidade} — CEP {enderecoCep}
                </div>
              )}
            </div>
          </GlassCard>

          <ul className="space-y-3">
            {items.map(it => (
              <li key={it.id}>
                <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="text-left w-8/12">
                    <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{it.item.nome}</div>
                    {it.selecoes && it.selecoes.length > 0 && (
                      <div style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>{it.selecoes.map(s => s.opcaoNome).join(', ')}</div>
                    )}
                    <div style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>{it.qty} x {fmt(cartItemUnitPrice(it))}</div>
                  </div>
                  <div style={{ font: 'var(--text-title)', color: 'var(--text-price)' }}>{fmt(cartItemUnitPrice(it) * it.qty)}</div>
                </GlassCard>
              </li>
            ))}
            {cupomAplicado && (
              <li>
                <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="text-left flex items-center gap-2">
                    <Tag className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    <div>
                      <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>Cupom {cupomAplicado.codigo}</div>
                      <div style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>
                        {cupomAplicado.tipoDesconto === 'PERCENTUAL' ? `${cupomAplicado.valor}% de desconto` : 'Valor fixo de desconto'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ font: 'var(--text-title)', color: 'var(--accent)' }}>-{fmt(valorDescontoCentavos)}</span>
                    <button
                      type="button"
                      onClick={handleRemoverCupom}
                      aria-label="Remover cupom"
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ background: 'var(--surface-control)', color: 'var(--text-muted)' }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </GlassCard>
              </li>
            )}
          </ul>

          <div className="mt-4">
            {!cupomAplicado ? (
              <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <Tag className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <input
                  value={codigoCupomInput}
                  onChange={event => setCodigoCupomInput(event.target.value.toUpperCase())}
                  placeholder="Código do cupom"
                  className="flex-1 min-w-0 bg-transparent outline-none"
                  style={{ font: 'var(--text-body)', color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={handleAplicarCupom}
                  disabled={cupomLoading || !codigoCupomInput.trim()}
                  className="shrink-0 px-3 py-1.5"
                  style={{
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--surface-control)',
                    color: 'var(--text-primary)',
                    font: 'var(--text-caption)',
                    opacity: cupomLoading || !codigoCupomInput.trim() ? 0.5 : 1,
                  }}
                >
                  {cupomLoading ? 'Aplicando...' : 'Aplicar'}
                </button>
              </GlassCard>
            ) : null}
            {cupomError && (
              <p className="mt-2" style={{ font: 'var(--text-caption)', color: 'var(--danger)' }}>{cupomError}</p>
            )}
          </div>

          {submitError && (
            <p className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'color-mix(in srgb, var(--danger) 16%, transparent)', color: 'var(--danger)', font: 'var(--text-body)' }}>{submitError}</p>
          )}
          <div className="mt-6">
            <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="text-left">
                <div style={{ font: 'var(--text-label)', color: 'var(--text-muted)' }}>Total</div>
                <div style={{ font: 'var(--text-h2)', color: 'var(--text-price)' }}>{fmt(totalFinal)}</div>
              </div>
              <IconButton
                icon={Check}
                label="Confirmar pedido"
                variant="accent"
                onClick={
                  metodoPagamento === 'PIX'
                    ? handleConfirmPedidoPix
                    : metodoPagamento === 'BALCAO'
                      ? handleConfirmPedidoBalcao
                      : (metodoPagamento === 'GOOGLE_PAY' || metodoPagamento === 'APPLE_PAY')
                        ? handleConfirmPedidoCarteira
                        : handleConfirmPedidoCartao
                }
                style={{ opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
              />
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
          <ItemSummaryCard itemCount={itemCount} total={totalFinal} />

          <GlassCard style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {pixQrSrc ? (
              <img src={pixQrSrc} alt="QR Code Pix" width={176} height={176} style={{ borderRadius: 'var(--r-sm)' }} />
            ) : (
              <div style={{ width: 176, height: 176, background: 'var(--surface-control)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              </div>
            )}
            <div className="mt-4" style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>{fmt(totalFinal)}</div>
            <p className="mt-2 text-center" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
              Abra o app do seu banco e escaneie o código, ou copie e cole na área Pix Copia e Cola.
            </p>
          </GlassCard>

          {pixCode && (
            <div className="mt-4">
              <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <span className="flex-1 truncate" style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{pixCode}</span>
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
          )}

          <div className="mt-4 flex items-center justify-center gap-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--gold-500)' }} />
            Aguardando confirmação do pagamento...
          </div>
        </div>
      </div>
    )
  }

  if (step === 'carteira') {
    const isApplePay = metodoPagamento === 'APPLE_PAY'
    const walletLabel = isApplePay ? 'Apple Pay' : 'Google Pay'
    const [walletProcessing, setWalletProcessing] = useState(false)
    const [walletError, setWalletError] = useState<string | null>(null)

    async function handlePagarCarteira() {
      const session = readMesaSession()
      if (!session) { setWalletError('Sessão da mesa expirada.'); return }

      setWalletError(null)
      setWalletProcessing(true)

      try {
        // Apple Pay: substitua APPLE_MERCHANT_ID pelo seu Merchant ID registrado em
        // https://developer.apple.com/account/resources/identifiers/list/merchant
        // e adicione o arquivo de verificação de domínio fornecido pela Apple em /.well-known/apple-developer-merchantid-domain-association
        const APPLE_MERCHANT_ID = 'merchant.com.seudominio'

        const supportedMethods: PaymentMethodData[] = isApplePay
          ? [{ supportedMethods: 'https://apple.com/apple-pay', data: { version: 3, merchantIdentifier: APPLE_MERCHANT_ID, merchantCapabilities: ['supports3DS'], supportedNetworks: ['visa', 'masterCard', 'amex', 'elo'], countryCode: 'BR' } }]
          : [{ supportedMethods: 'https://google.com/pay', data: { apiVersion: 2, apiVersionMinor: 0, allowedPaymentMethods: [{ type: 'CARD', parameters: { allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'], allowedCardNetworks: ['MASTERCARD', 'VISA', 'ELO'] }, tokenizationSpecification: { type: 'PAYMENT_GATEWAY', parameters: { gateway: 'mercadopago', gatewayMerchantId: MP_PUBLIC_KEY } } }], merchantInfo: { merchantName: 'Restaurante' } } }]

        const details: PaymentDetailsInit = {
          total: { label: 'Total do pedido', amount: { currency: 'BRL', value: (totalFinal / 100).toFixed(2) } },
        }

        const request = new PaymentRequest(supportedMethods, details)
        const canMakePayment = await request.canMakePayment()
        if (!canMakePayment) {
          setWalletError(`${walletLabel} não está disponível neste dispositivo. Configure uma carteira no app ${isApplePay ? 'Wallet' : 'Google Pay'} e tente novamente.`)
          setWalletProcessing(false)
          return
        }

        const paymentResponse = await request.show()
        const token = (paymentResponse.details as { token?: string })?.token
          ?? JSON.stringify(paymentResponse.details)

        const criado = await createPedido(session.tenantSlug, {
          mesaQrCodeToken: session.qrCodeToken,
        tipoEntrega,
        endereco: buildEndereco(),
          nomeCliente: nome.trim(),
          pagamento: {
            metodo: metodoPagamento!,
            cardToken: token,
            paymentMethodId: isApplePay ? 'apple_pay' : 'google_pay',
            installments: 1,
          },
          itens: buildItens(),
          codigoCupom: cupomAplicado?.codigo,
        })

        await paymentResponse.complete('success')

        if (criado.pagamento?.status === 'APROVADO') {
          setNumeroPedidoConfirmado(criado.numeroSequencial)
        } else {
          await paymentResponse.complete('fail')
          setWalletError('Pagamento não aprovado. Tente novamente.')
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') {
          setWalletError(null)
        } else {
          setWalletError(`Erro ao processar ${walletLabel}. Tente outro método de pagamento.`)
        }
      } finally {
        setWalletProcessing(false)
      }
    }

    return (
      <div className="ember-theme min-h-screen">
        <CheckoutHeader active={1} onClose={() => setStep('revisao')} />
        <div className="px-4 pb-24">
          <h2 className="mb-6" style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>{walletLabel}</h2>
          <ItemSummaryCard itemCount={itemCount} total={totalFinal} />
          <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--sp-8)', gap: 'var(--sp-4)' }}>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: isApplePay ? '#000' : '#fff', border: isApplePay ? 'none' : '1px solid var(--border-strong)' }}
            >
              {isApplePay ? (
                <svg viewBox="0 0 24 24" width="32" height="32" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.32-2.15 3.93.03 3.12 2.6 4.16 2.63 4.17l-.03.07zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
            </div>
            <p style={{ font: 'var(--text-body)', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Toque no botão abaixo para autenticar o pagamento com {walletLabel}. Seu dispositivo solicitará confirmação biométrica ou por PIN.
            </p>
            <div style={{ font: 'var(--text-h2)', color: 'var(--text-price)' }}>{fmt(totalFinal)}</div>
          </GlassCard>
          {walletError && (
            <p className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'color-mix(in srgb, var(--danger) 16%, transparent)', color: 'var(--danger)', font: 'var(--text-body)' }}>{walletError}</p>
          )}
          <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-6)' }} disabled={walletProcessing} onClick={handlePagarCarteira}>
            {walletProcessing ? 'Aguardando autenticação...' : `Pagar com ${walletLabel}`}
          </Button>
          <button
            type="button"
            className="w-full mt-3 py-2 text-center"
            style={{ font: 'var(--text-body)', color: 'var(--text-muted)' }}
            onClick={() => setStep('pagamento')}
          >
            Usar outro método de pagamento
          </button>
        </div>
      </div>
    )
  }

  // Cartão
  const cardStepTitle = metodoPagamento === 'CARTAO_DEBITO' ? 'Cartão de débito' : 'Cartão de crédito'
  return (
    <div className="ember-theme min-h-screen">
      <CheckoutHeader active={1} onClose={() => setStep('revisao')} />
      <div className="px-4 pb-24">
        <h2 className="mb-6" style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>{cardStepTitle}</h2>
        {pedido && (
          <p className="mb-2 text-right" style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>Pedido nº {pedido.numeroSequencial}</p>
        )}
        <ItemSummaryCard itemCount={itemCount} total={totalFinal} />
        <div className="space-y-5">
          <TextField id="card-number" label="Número do cartão" value={cardNumber} onChange={event => setCardNumber(formatCardNumber(event.target.value))} placeholder="0000 0000 0000 0000" inputMode="numeric" />
          <TextField id="card-name" label="Nome impresso no cartão" value={cardName} onChange={event => setCardName(event.target.value)} placeholder="Como está no cartão" />
          <TextField id="card-cpf" label="CPF do titular" value={cardCpf} onChange={event => setCardCpf(formatCpf(event.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
          <div className="grid grid-cols-2 gap-3">
            <TextField id="card-validade" label="Validade" value={cardValidade} onChange={event => setCardValidade(formatValidade(event.target.value))} placeholder="MM/AA" inputMode="numeric" />
            <TextField id="card-cvv" label="CVV" value={cardCvv} onChange={event => setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" inputMode="numeric" />
          </div>
        </div>
        {cardError && (
          <p className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'color-mix(in srgb, var(--danger) 16%, transparent)', color: 'var(--danger)', font: 'var(--text-body)' }}>{cardError}</p>
        )}
        <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-6)' }} disabled={!cardValid || processingCard || !mpLoaded} onClick={handlePagarCartao}>
          {processingCard ? 'Processando...' : `Pagar ${fmt(totalFinal)}`}
        </Button>
      </div>
    </div>
  )
}
