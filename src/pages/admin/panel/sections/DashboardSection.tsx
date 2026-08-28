import { useEffect, useMemo, useState } from 'react'
import { Beer, DollarSign, Receipt, Ticket } from 'lucide-react'
import { fmt } from '../../../../data/menu'
import PeriodFilter from '../components/PeriodFilter'
import StatCard from '../components/StatCard'
import BarChart from '../components/BarChart'
import CategoryBreakdown from '../components/CategoryBreakdown'
import RankedList from '../components/RankedList'
import { getDashboard, PERIOD_LABEL, type DashboardResponse, type PeriodId } from '../../../../services/dashboard'

function toCents(value: string | number) {
  return Math.round(Number(value) * 100)
}

function seriesLabel(value: string, period: PeriodId) {
  const date = new Date(value)
  if (period === 'hoje' || period === 'ontem') return `${String(date.getHours()).padStart(2, '0')}h`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function DashboardSection() {
  const [period, setPeriod] = useState<PeriodId>('hoje')
  const [customRange, setCustomRange] = useState<{ dataInicio: string; dataFim: string } | null>(null)
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const hasIncompleteCustomRange = Boolean(
      customRange && (!customRange.dataInicio || !customRange.dataFim),
    )

    if (hasIncompleteCustomRange) return

    setLoading(true)
    const completeRange = customRange?.dataInicio && customRange.dataFim
      ? customRange
      : undefined
    getDashboard(period, completeRange)
      .then(data => {
        if (!mounted) return
        setDashboard(data)
        setError(null)
      })
      .catch(() => mounted && setError('Não foi possível carregar o dashboard.'))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [period, customRange])

  const revenueChart = dashboard?.serieTemporal ?? []
  const categoryTotal = dashboard?.vendasPorCategoria.reduce((total, item) => total + toCents(item.valor), 0) ?? 0
  const categoryRows = useMemo(() => dashboard?.vendasPorCategoria.map(item => ({ nome: item.nome, pct: categoryTotal ? Math.round(toCents(item.valor) / categoryTotal * 100) : 0 })) ?? [], [categoryTotal, dashboard])
  const topPratos = dashboard?.pratosMaisVendidos.map(item => ({ id: item.produtoId, label: item.nome, sublabel: `${item.quantidade} vendidos`, value: fmt(toCents(item.valor)), emphasize: true })) ?? []
  const stats = dashboard?.kpis

  if (loading) return <p className="ap-card-sub">Carregando dashboard...</p>
  if (!stats) return <p className="ap-card ap-inline-error">{error ?? 'Não foi possível carregar o dashboard.'}</p>

  return (
    <div>
      <PeriodFilter value={period} onChange={selectedPeriod => { setCustomRange(null); setPeriod(selectedPeriod) }} customRange={customRange} isCustom={Boolean(customRange?.dataInicio && customRange.dataFim)} onCustomRangeChange={range => { setCustomRange(range); if (range?.dataInicio && range.dataFim) setPeriod('hoje') }} />
      {error && <p className="ap-card ap-inline-error">{error}</p>}

      <div className="ap-stat-grid">
        <StatCard
          icon={DollarSign}
          label="Faturamento"
          value={fmt(toCents(stats.faturamento))}
          variant="green"
        />
        <StatCard
          icon={Receipt}
          label="Pedidos"
          value={String(stats.numeroPedidos)}
          variant="blue"
        />
        <StatCard
          icon={Ticket}
          label="Ticket médio"
          value={fmt(toCents(stats.ticketMedio))}
          variant="gold"
        />
        <StatCard
          icon={Beer}
          label="Bebidas + cervejas"
          value={String(stats.bebidasVendidas)}
          variant="green"
        />
      </div>

      <div className="ap-charts-grid">
        <div className="ap-card">
          <div className="ap-card-title">Faturamento no período</div>
          <div className="ap-card-sub">{PERIOD_LABEL[period]}</div>
          <BarChart
            variant="gold"
            bars={revenueChart.map(item => ({
              label: seriesLabel(item.inicio, period),
              value: toCents(item.faturamento),
              title: `${seriesLabel(item.inicio, period)} — ${fmt(toCents(item.faturamento))}`,
            }))}
          />
        </div>

        <div className="ap-card">
          <div className="ap-card-title">Horários de pico</div>
          <div className="ap-card-sub">Pedidos no período selecionado</div>
          <BarChart
            variant="green"
            height={150}
            gap={3}
            bars={revenueChart.map(item => ({
              label: seriesLabel(item.inicio, period),
              value: item.numeroPedidos,
              title: `${seriesLabel(item.inicio, period)} — ${item.numeroPedidos} pedidos`,
            }))}
          />
        </div>
      </div>

      <div className="ap-panels-grid">
        <div className="ap-card">
          <div className="ap-card-title" style={{ marginBottom: 12 }}>
            Vendas por categoria
          </div>
          <CategoryBreakdown rows={categoryRows} />
        </div>

        <div className="ap-card">
          <div className="ap-card-title" style={{ marginBottom: 12 }}>
            Pratos mais vendidos
          </div>
          <RankedList rows={topPratos} />
        </div>

      </div>
    </div>
  )
}
