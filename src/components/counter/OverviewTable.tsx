import type { CounterOrder } from './types'
import { elapsedLabel } from './utils'
import { fmt } from '../../data/menu'

const STATUS_LABEL: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PREPARANDO: 'Preparando',
  PRONTO: 'Pronto',
  RETIRADO: 'Retirado',
  CANCELADO: 'Cancelado',
}

export default function OverviewTable({ orders, now }: { orders: CounterOrder[]; now: number }) {
  const sorted = [...orders].sort((a, b) => b.criadoEm - a.criadoEm)

  return (
    <div>
      <div className="counter-section-label">Visão geral · todos os pedidos</div>
      <table className="counter-overview-table">
        <thead>
          <tr>
            <th>Senha</th>
            <th>Cliente</th>
            <th>Mesa</th>
            <th>Itens</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Tempo</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(order => (
            <tr key={order.id}>
              <td className="counter-senha-cell">#{order.senha}</td>
              <td>{order.nome}</td>
              <td>{order.origem}</td>
              <td>{order.itens.reduce((s, i) => s + i.qty, 0)} item(ns)</td>
              <td>{fmt(order.valor)}</td>
              <td><span className={`counter-status-badge ${order.status}`}>{STATUS_LABEL[order.status]}</span></td>
              <td>{elapsedLabel(order.criadoEm, now)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
