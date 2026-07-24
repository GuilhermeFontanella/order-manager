import { useMemo, useState } from 'react'
import { ArrowLeft, Check, ChevronRight, CreditCard, QrCode, Wallet } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { fmt } from '../../data/menu'
import { useNavigate } from 'react-router-dom'

type Step = 'identificacao' | 'revisao' | 'pagamento' | 'pix' | 'cartao' | 'carteira'

function ProgressDots({ active }: { active: 0 | 1 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === active ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300'
          }`}
        />
      ))}
    </div>
  )
}

function CheckoutHeader({ active, onClose }: { title: string; active: 0 | 1; onClose: () => void }) {
  return (
    <header className="relative flex items-center justify-between px-4 py-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
      >
        <ArrowLeft className="h-4 w-4 text-slate-700" />
      </button>
      <ProgressDots active={active} />
    </header>
  )
}

function ItemSummaryCard({ itemCount, total }: { itemCount: number; total: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm mb-6">
      <span className="text-sm text-slate-500">
        {itemCount} {itemCount === 1 ? 'item' : 'itens'} no pedido
      </span>
      <span className="font-mono font-semibold text-slate-900">{fmt(total)}</span>
    </div>
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
      className="grid bg-white"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 176, height: 176 }}
    >
      {grid.flatMap((row, y) =>
        row.map((filled, x) => (
          <div key={`${x}-${y}`} className={filled ? 'bg-slate-900' : 'bg-white'} />
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
  const total = items.reduce((s, it) => s + it.item.preco * it.qty, 0)
  const itemCount = items.reduce((s, it) => s + it.qty, 0)

  const [step, setStep] = useState<Step>('identificacao')
  const [nome, setNome] = useState('')

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

  function finishOrder() {
    clear()
    navigate('/order')
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
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Finalizar pedido</h1>
        <div className="text-gray-500">Seu carrinho está vazio.</div>
      </div>
    )
  }

  if (step === 'identificacao') {
    return (
      <div className="min-h-screen bg-[#f5efe1]">
        <CheckoutHeader title="Identificação" active={0} onClose={() => navigate(-1)} />
        <h2 className="text-base font-bold text-slate-900 mb-8">Revisão do pedido</h2>

        <div className="px-4 pb-24">
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm mb-8">
            <span className="text-sm text-slate-500">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'} no pedido
            </span>
            <span className="font-mono font-semibold text-slate-900">{fmt(total)}</span>
          </div>

          <h2 className="mt-6 text-xl font-extrabold text-slate-900">Como podemos te chamar?</h2>
          <p className="mt-2 text-sm text-slate-500">
            Vamos usar esse nome no painel do balcão para chamar você quando o pedido estiver pronto.
          </p>

          <label htmlFor="checkout-nome" className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Seu nome
          </label>
          <input
            id="checkout-nome"
            value={nome}
            onChange={event => setNome(event.target.value)}
            placeholder="Ex: Guilherme"
            className="mt-2 w-full rounded-2xl border-2 border-emerald-600 bg-white px-4 py-3 text-slate-900 outline-none"
          />

          <button
            type="button"
            disabled={!nome.trim()}
            onClick={() => setStep('revisao')}
            className={`mt-6 w-full rounded-2xl px-4 py-4 text-sm font-semibold text-white shadow-sm transition ${
              nome.trim() ? 'bg-slate-900 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-300'
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  if (step === 'revisao') {
    return (
      <div className="min-h-screen bg-[#f5efe1]">
        <CheckoutHeader title="Revisão do pedido" active={1} onClose={() => navigate(-1)} />
        <h2 className="text-base font-bold text-slate-900 mb-8">Revisão do pedido</h2>
        <div className="px-4 pb-24">
          <ul className="space-y-3">
            {items.map(it => (
              <li key={it.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="text-left">
                  <div className="font-semibold text-slate-900">{it.item.nome}</div>
                  <div className="text-xs text-gray-500">{it.qty} x {fmt(it.item.preco)}</div>
                </div>
                <div className="font-mono text-slate-900">{fmt(it.item.preco * it.qty)}</div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="text-left">
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-bold text-lg text-slate-900">{fmt(total)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('pagamento')} className="px-4 py-2 bg-green-600 text-white rounded-xl"><Check /></button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'pagamento') {
    const methods = [
      { id: 'pix' as const, label: 'Pix', desc: 'Aprovação na hora, via QR code', icon: QrCode },
      { id: 'cartao' as const, label: 'Cartão de crédito', desc: 'Visa, Mastercard, Elo', icon: CreditCard },
      { id: 'carteira' as const, label: 'Carteira digital', desc: 'Apple Pay, Google Pay', icon: Wallet },
    ]

    return (
      <div className="min-h-screen bg-[#f5efe1]">
        <CheckoutHeader title="Forma de pagamento" active={1} onClose={() => setStep('revisao')} />
        <h2 className="text-base font-bold text-slate-900 mb-8">Forma de pagamento</h2>

        <div className="px-4 pb-24">
          <ItemSummaryCard itemCount={itemCount} total={total} />

          <h2 className="text-xl font-extrabold text-slate-900">Como você vai pagar?</h2>
          <p className="mt-2 text-sm text-slate-500">
            Escolha a forma de pagamento para enviar o pedido para a cozinha.
          </p>

          <div className="mt-6 space-y-3">
            {methods.map(method => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setStep(method.id)}
                  className="w-full flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900">{method.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{method.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'pix') {
    return (
      <div className="min-h-screen bg-[#f5efe1]">
        <CheckoutHeader title="Pagar com Pix" active={1} onClose={() => setStep('pagamento')} />
        <h2 className="text-base font-bold text-slate-900 mb-8">Pagar com Pix</h2>

        <div className="px-4 pb-24">
          <ItemSummaryCard itemCount={itemCount} total={total} />

          <div className="rounded-2xl bg-white p-6 shadow-sm flex flex-col items-center">
            <PixQrCode />
            <div className="mt-4 text-2xl font-bold text-slate-900">{fmt(total)}</div>
            <p className="mt-2 text-sm text-slate-500 text-center">
              Abra o app do seu banco e escaneie o código, ou copie e cole na área Pix Copia e Cola.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <span className="flex-1 truncate font-mono text-xs text-slate-600">{pixCode}</span>
            <button
              type="button"
              onClick={handleCopyPixCode}
              className="flex-shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Aguardando confirmação do pagamento...
          </div>

          <button
            type="button"
            onClick={finishOrder}
            className="mt-6 w-full rounded-2xl bg-emerald-700 px-4 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Simular pagamento confirmado
          </button>
        </div>
      </div>
    )
  }

  if (step === 'cartao') {
    return (
      <div className="min-h-screen bg-[#f5efe1]">
        <CheckoutHeader title="Cartão de crédito" active={1} onClose={() => setStep('pagamento')} />
        <h2 className="text-base font-bold text-slate-900 mb-8">Cartão de crédito</h2>

        <div className="px-4 pb-24">
          <ItemSummaryCard itemCount={itemCount} total={total} />

          <label htmlFor="card-number" className="block text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Número do cartão
          </label>
          <input
            id="card-number"
            value={cardNumber}
            onChange={event => setCardNumber(formatCardNumber(event.target.value))}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 outline-none focus:border-emerald-500"
          />

          <label htmlFor="card-name" className="mt-5 block text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Nome impresso no cartão
          </label>
          <input
            id="card-name"
            value={cardName}
            onChange={event => setCardName(event.target.value)}
            placeholder="Como está no cartão"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 outline-none focus:border-emerald-500"
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="card-validade" className="block text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Validade
              </label>
              <input
                id="card-validade"
                value={cardValidade}
                onChange={event => setCardValidade(formatValidade(event.target.value))}
                placeholder="MM/AA"
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="card-cvv" className="block text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                CVV
              </label>
              <input
                id="card-cvv"
                value={cardCvv}
                onChange={event => setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!cardValid}
            onClick={finishOrder}
            className={`mt-6 w-full rounded-2xl px-4 py-4 text-sm font-semibold text-white shadow-sm transition ${
              cardValid ? 'bg-slate-900 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-300'
            }`}
          >
            Pagar {fmt(total)}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5efe1]">
      <CheckoutHeader title="Carteira digital" active={1} onClose={() => setStep('pagamento')} />
      <h2 className="text-base font-bold text-slate-900 mb-8">Carteira digital</h2>

      <div className="px-4 pb-24">
        <ItemSummaryCard itemCount={itemCount} total={total} />

        <div className="rounded-2xl bg-white p-6 shadow-sm flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Wallet className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Pagar com carteira digital</h3>
          <p className="mt-2 text-sm text-slate-500">
            Você vai confirmar o pagamento de {fmt(total)} usando o método salvo no seu dispositivo.
          </p>
        </div>

        <button
          type="button"
          onClick={finishOrder}
          className="mt-6 w-full rounded-2xl bg-emerald-700 px-4 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          Confirmar pagamento
        </button>
      </div>
    </div>
  )
}
