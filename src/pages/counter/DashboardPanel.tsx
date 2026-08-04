import { useMemo, useState } from 'react'
import type { CounterOrder } from '../../components/counter/types'
import { PRODUTO_INSUMOS, HISTORICO_DIAS } from '../../components/counter/dashboardData'
import DayNav from '../../components/counter/DayNav'
import StatsRow from '../../components/counter/StatsRow'
import BreakdownList from '../../components/counter/BreakdownList'
import IngredientList from '../../components/counter/IngredientList'
import DashActions from '../../components/counter/DashActions'
import { fmt } from '../../data/menu'

type Props = {
  orders: CounterOrder[]
  produtoCategorias: Record<string, string>
  restaurantOpen: boolean
  onReabrir: () => void
}

function computeTodayData(orders: CounterOrder[], produtoCategorias: Record<string, string>) {
  const validos = orders.filter(o => o.status !== 'CANCELADO')
  const faturado = validos.reduce((s, o) => s + o.valor, 0)
  const pedidos = validos.length
  const categorias: Record<string, number> = {}
  const insumoTotais: Record<string, number> = {}

  validos.forEach(o => {
    o.itens.forEach(i => {
      const cat = produtoCategorias[i.produtoId] ?? 'Outros'
      categorias[cat] = (categorias[cat] || 0) + i.qty
      const insumos = PRODUTO_INSUMOS[i.nome]
      if (insumos) {
        insumos.forEach(ing => {
          const key = `${ing.insumo}|${ing.unidade}`
          insumoTotais[key] = (insumoTotais[key] || 0) + ing.qtd * i.qty
        })
      }
    })
  })

  const ingredientes = Object.entries(insumoTotais)
    .map(([key, qtd]) => {
      const [nome, unidade] = key.split('|')
      const qtdConvertida = unidade === 'g' ? qtd / 1000 : unidade === 'ml' ? qtd / 1000 : qtd
      const unidadeFinal = unidade === 'g' ? 'kg' : unidade === 'ml' ? 'L' : unidade
      return { nome, qtd: qtdConvertida, unidade: unidadeFinal }
    })
    .sort((a, b) => b.qtd - a.qtd)

  return {
    dateLabel: 'Hoje',
    sub: new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }),
    faturado,
    pedidos,
    categorias,
    ingredientes,
  }
}

export default function DashboardPanel({ orders, produtoCategorias, restaurantOpen, onReabrir }: Props) {
  const [dayIndex, setDayIndex] = useState(0)

  const todayData = useMemo(() => computeTodayData(orders, produtoCategorias), [orders, produtoCategorias])
  const data = dayIndex === 0 ? todayData : { ...HISTORICO_DIAS[dayIndex - 1], sub: '' }

  const ticketMedio = data.pedidos ? Math.round(data.faturado / data.pedidos) : 0
  const totalBebidasCervejas = (data.categorias['Bebidas'] || 0) + (data.categorias['Cervejas'] || 0)

  return (
    <div className="counter-content">
      <DayNav
        label={data.dateLabel}
        sub={data.sub}
        onPrev={() => setDayIndex(i => Math.min(i + 1, HISTORICO_DIAS.length))}
        onNext={() => setDayIndex(i => Math.max(i - 1, 0))}
        prevDisabled={dayIndex >= HISTORICO_DIAS.length}
        nextDisabled={dayIndex === 0}
      />

      <StatsRow
        gridClassName="counter-dash-grid"
        items={[
          { icon: '💰', label: 'Faturado no dia', value: fmt(data.faturado) },
          { icon: '🧾', label: 'Pedidos realizados', value: String(data.pedidos), variant: 'blue' },
          { icon: '📊', label: 'Ticket médio', value: fmt(ticketMedio), variant: 'gold' },
          { icon: '🍺', label: 'Bebidas + cervejas', value: String(totalBebidasCervejas) },
        ]}
      />

      <div className="counter-dash-section-title">Vendas por categoria</div>
      <BreakdownList categorias={data.categorias} />

      <div className="counter-dash-section-title">Consumo estimado de insumos</div>
      <IngredientList ingredientes={data.ingredientes} />

      <DashActions
        onGerarRelatorio={() => window.print()}
        showReabrir={dayIndex === 0 && !restaurantOpen}
        onReabrir={onReabrir}
      />
    </div>
  )
}
