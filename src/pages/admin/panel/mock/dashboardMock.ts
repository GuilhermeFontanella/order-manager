// Dados de demonstração para a seção Dashboard do painel administrativo.
//
// Isto é mock, não vem de API — o histórico é gerado uma única vez (RNG com seed fixa,
// determinística) quando o módulo é carregado, igual ao protótipo original. Quando o backend
// expuser um endpoint de relatórios/histórico, este arquivo é o ponto de substituição.

export type PeriodId = 'hoje' | 'ontem' | '7d' | '30d'

export const PERIOD_LABEL: Record<PeriodId, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
}

export const PERIOD_OPTIONS: { id: PeriodId; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'ontem', label: 'Ontem' },
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
]

type DayStat = {
  index: number
  date: Date
  weekday: number
  label: string
  faturado: number // centavos
  pedidos: number
}

const WD_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function seededRng(seed: number) {
  let s = seed
  return function rng() {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

function generateHistory(): DayStat[] {
  const rnd = seededRng(918273)
  const today = new Date()
  const days: DayStat[] = []

  for (let i = 0; i < 31; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const weekday = date.getDay()
    const base = weekday === 0 || weekday === 6 ? 205000 : weekday === 5 ? 188000 : 142000
    const faturado = Math.round(base * (0.82 + rnd() * 0.36))
    const pedidos = Math.round((faturado / 3550) * (0.9 + rnd() * 0.2))

    days.push({
      index: i,
      date,
      weekday,
      label: `${WD_ABBR[weekday]} ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      faturado,
      pedidos,
    })
  }

  // "Hoje" ainda está em andamento (o dia não acabou), então reduz pra parecer parcial.
  days[0].faturado = Math.round(days[0].faturado * 0.52)
  days[0].pedidos = Math.round(days[0].pedidos * 0.52)

  return days
}

const HISTORY = generateHistory()

const HOUR_WEIGHTS = [
  { h: 11, w: 0.03 }, { h: 12, w: 0.14 }, { h: 13, w: 0.16 }, { h: 14, w: 0.08 },
  { h: 15, w: 0.04 }, { h: 16, w: 0.03 }, { h: 17, w: 0.04 }, { h: 18, w: 0.07 },
  { h: 19, w: 0.13 }, { h: 20, w: 0.15 }, { h: 21, w: 0.09 }, { h: 22, w: 0.03 }, { h: 23, w: 0.01 },
]

export const CATEGORY_SHARE = [
  { nome: 'Pratos principais', share: 0.34 },
  { nome: 'Cervejas', share: 0.22 },
  { nome: 'Bebidas', share: 0.19 },
  { nome: 'Entradas', share: 0.14 },
  { nome: 'Sobremesas', share: 0.11 },
]

export const TOP_PRATOS = [
  { nome: 'X-Burger da casa', share: 0.24, preco: 2500 },
  { nome: 'Picanha na chapa', share: 0.16, preco: 6200 },
  { nome: 'Chopp artesanal', share: 0.14, preco: 1800 },
  { nome: 'Filé à parmegiana', share: 0.12, preco: 3800 },
  { nome: 'Limonada suíça', share: 0.10, preco: 1200 },
]

export const TOP_INSUMOS = [
  { nome: 'Carne bovina', unidade: 'kg', perPedido: 0.062 },
  { nome: 'Picanha', unidade: 'kg', perPedido: 0.048 },
  { nome: 'Chopp (barril)', unidade: 'L', perPedido: 0.11 },
  { nome: 'Pão brioche', unidade: 'un', perPedido: 0.31 },
  { nome: 'Filé de frango', unidade: 'kg', perPedido: 0.038 },
  { nome: 'Limão', unidade: 'un', perPedido: 0.09 },
]

const COMPARATIVO: Record<PeriodId, number> = { hoje: 8, ontem: -3, '7d': 11, '30d': 6 }

export function getComparativo(period: PeriodId) {
  return COMPARATIVO[period]
}

export function getStatsForPeriod(period: PeriodId): { faturado: number; pedidos: number } {
  if (period === 'hoje') return { faturado: HISTORY[0].faturado, pedidos: HISTORY[0].pedidos }
  if (period === 'ontem') return { faturado: HISTORY[1].faturado, pedidos: HISTORY[1].pedidos }

  const dias = period === '7d' ? HISTORY.slice(1, 8) : HISTORY.slice(1, 31)
  return dias.reduce(
    (acc, d) => ({ faturado: acc.faturado + d.faturado, pedidos: acc.pedidos + d.pedidos }),
    { faturado: 0, pedidos: 0 }
  )
}

export function getRevenueChart(period: PeriodId): { label: string; faturado: number }[] {
  if (period === 'hoje' || period === 'ontem') {
    const total = period === 'hoje' ? HISTORY[0].faturado : HISTORY[1].faturado
    return HOUR_WEIGHTS.map(hw => ({ label: `${hw.h}h`, faturado: Math.round(total * hw.w) }))
  }

  if (period === '7d') {
    return HISTORY.slice(1, 8).slice().reverse().map(d => ({ label: d.label, faturado: d.faturado }))
  }

  const dias = HISTORY.slice(1, 31).slice().reverse()
  const buckets: { label: string; faturado: number }[] = []
  for (let i = 0; i < dias.length; i += 8) {
    const chunk = dias.slice(i, i + 8)
    buckets.push({
      label: `Sem ${buckets.length + 1}`,
      faturado: chunk.reduce((s, d) => s + d.faturado, 0),
    })
  }
  return buckets
}

export function getPeakHoursChart(): { label: string; pedidos: number }[] {
  const total = HISTORY[1].pedidos
  return HOUR_WEIGHTS.map(hw => ({ label: String(hw.h), pedidos: Math.round(total * hw.w) }))
}
