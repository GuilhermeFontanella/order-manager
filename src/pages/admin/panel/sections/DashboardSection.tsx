import { useState } from 'react'
import { Beer, DollarSign, Receipt, Ticket } from 'lucide-react'
import { fmt } from '../../../../data/menu'
import PeriodFilter from '../components/PeriodFilter'
import StatCard from '../components/StatCard'
import BarChart from '../components/BarChart'
import CategoryBreakdown from '../components/CategoryBreakdown'
import RankedList from '../components/RankedList'
import {
  CATEGORY_SHARE,
  getComparativo,
  getPeakHoursChart,
  getRevenueChart,
  getStatsForPeriod,
  PERIOD_LABEL,
  TOP_INSUMOS,
  TOP_PRATOS,
  type PeriodId,
} from '../mock/dashboardMock'

export default function DashboardSection() {
  const [period, setPeriod] = useState<PeriodId>('hoje')

  const stats = getStatsForPeriod(period)
  const ticketMedio = stats.pedidos ? Math.round(stats.faturado / stats.pedidos) : 0
  const comparativo = getComparativo(period)
  const revenueChart = getRevenueChart(period)
  const peakChart = getPeakHoursChart()

  const topPratos = TOP_PRATOS.map(item => {
    const qtd = Math.max(1, Math.round(stats.pedidos * item.share))
    return {
      id: item.nome,
      label: item.nome,
      sublabel: `${qtd} vendidos`,
      value: fmt(qtd * item.preco),
      emphasize: true,
    }
  })

  const insumos = TOP_INSUMOS.map(item => ({
    id: item.nome,
    label: item.nome,
    value: `${(stats.pedidos * item.perPedido).toFixed(1)} ${item.unidade}`,
  }))

  return (
    <div>
      <PeriodFilter value={period} onChange={setPeriod} />

      <div className="ap-stat-grid">
        <StatCard
          icon={DollarSign}
          label="Faturamento"
          value={fmt(stats.faturado)}
          deltaPct={comparativo}
          variant="green"
        />
        <StatCard
          icon={Receipt}
          label="Pedidos"
          value={String(stats.pedidos)}
          deltaPct={comparativo - 2}
          variant="blue"
        />
        <StatCard
          icon={Ticket}
          label="Ticket médio"
          value={fmt(ticketMedio)}
          deltaPct={comparativo - 4}
          variant="gold"
        />
        <StatCard
          icon={Beer}
          label="Bebidas + cervejas"
          value={String(Math.round(stats.pedidos * 0.41))}
          deltaPct={comparativo + 3}
          variant="green"
        />
      </div>

      <div className="ap-charts-grid">
        <div className="ap-card">
          <div className="ap-card-title">Faturamento no período</div>
          <div className="ap-card-sub">{PERIOD_LABEL[period]}</div>
          <BarChart
            variant="gold"
            bars={revenueChart.map(b => ({
              label: b.label,
              value: b.faturado,
              title: `${b.label} — ${fmt(b.faturado)}`,
            }))}
          />
        </div>

        <div className="ap-card">
          <div className="ap-card-title">Horários de pico</div>
          <div className="ap-card-sub">Distribuição média de pedidos por hora</div>
          <BarChart
            variant="green"
            height={150}
            gap={3}
            bars={peakChart.map(b => ({
              label: `${b.label}h`,
              value: b.pedidos,
              title: `${b.label}h — ${b.pedidos} pedidos em média`,
            }))}
          />
        </div>
      </div>

      <div className="ap-panels-grid">
        <div className="ap-card">
          <div className="ap-card-title" style={{ marginBottom: 12 }}>
            Vendas por categoria
          </div>
          <CategoryBreakdown rows={CATEGORY_SHARE.map(c => ({ nome: c.nome, pct: Math.round(c.share * 100) }))} />
        </div>

        <div className="ap-card">
          <div className="ap-card-title" style={{ marginBottom: 12 }}>
            Pratos mais vendidos
          </div>
          <RankedList rows={topPratos} />
        </div>

        <div className="ap-card">
          <div className="ap-card-title" style={{ marginBottom: 12 }}>
            Consumo estimado de insumos
          </div>
          <RankedList rows={insumos} />
        </div>
      </div>
    </div>
  )
}
