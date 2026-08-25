import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Accordion from '../../../../components/Accordion'
import MultiSelectDropdown from '../../../../components/MultiSelectDropdown'
import Pagination from '../../../../components/Pagination'
import { listPedidosPaginados } from '../../../../services/pedidosStaff'
import { listMesas, type Mesa } from '../../../../services/mesas'
import type { MetodoPagamento, Pedido, StatusPedido } from '../../../../services/storefront'
import { fmt } from '../../../../data/menu'

const PAGE_SIZE = 20

const STATUS_LABEL: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PREPARANDO: 'Preparando',
  PRONTO: 'Pronto',
  RETIRADO: 'Retirado',
  CANCELADO: 'Cancelado',
}

const METODO_LABEL: Record<MetodoPagamento, string> = {
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
}

function horarioLabel(criadoEm: string): string {
  return new Date(criadoEm).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PedidosSection() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mesas, setMesas] = useState<Mesa[]>([])

  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<Set<string>>(new Set())
  const [metodosFiltro, setMetodosFiltro] = useState<Set<string>>(new Set())
  const [mesasFiltro, setMesasFiltro] = useState<Set<string>>(new Set())
  const [dataDe, setDataDe] = useState('')
  const [dataAte, setDataAte] = useState('')

  useEffect(() => {
    let isMounted = true
    listMesas()
      .then(list => {
        if (isMounted) setMesas(list)
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      setBuscaDebounced(busca.trim())
    }, 300)
    return () => clearTimeout(timeout)
  }, [busca])

  useEffect(() => {
    let isMounted = true
    // Loading indicator for a page/filter change, not just the initial mount — the canonical
    // fetch-in-effect pattern, allowed here same as react-hooks/exhaustive-deps elsewhere in the app.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    listPedidosPaginados({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      status: statusFiltro.size > 0 ? (Array.from(statusFiltro) as StatusPedido[]) : undefined,
      metodoPagamento: metodosFiltro.size > 0 ? (Array.from(metodosFiltro) as MetodoPagamento[]) : undefined,
      mesaId: mesasFiltro.size > 0 ? Array.from(mesasFiltro) : undefined,
      busca: buscaDebounced || undefined,
      dataDe: dataDe || undefined,
      dataAte: dataAte || undefined,
    })
      .then(result => {
        if (!isMounted) return
        setPedidos(result.data)
        setTotal(result.total)
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar os pedidos.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [page, statusFiltro, metodosFiltro, mesasFiltro, dataDe, dataAte, buscaDebounced])

  const mesasOptions = mesas
    .slice()
    .sort((a, b) => a.numero - b.numero)
    .map(mesa => ({ value: mesa.id, label: `Mesa ${mesa.numero}` }))

  const filtrosAtivosCount = [
    statusFiltro.size > 0,
    metodosFiltro.size > 0,
    mesasFiltro.size > 0,
    dataDe !== '',
    dataAte !== '',
  ].filter(Boolean).length

  const filtrosAtivos = filtrosAtivosCount > 0 || buscaDebounced !== ''

  function updateStatusFiltro(next: Set<string>) {
    setStatusFiltro(next)
    setPage(1)
  }

  function updateMetodosFiltro(next: Set<string>) {
    setMetodosFiltro(next)
    setPage(1)
  }

  function updateMesasFiltro(next: Set<string>) {
    setMesasFiltro(next)
    setPage(1)
  }

  function updateDataDe(value: string) {
    setDataDe(value)
    setPage(1)
  }

  function updateDataAte(value: string) {
    setDataAte(value)
    setPage(1)
  }

  function limparFiltros() {
    setStatusFiltro(new Set())
    setMetodosFiltro(new Set())
    setMesasFiltro(new Set())
    setDataDe('')
    setDataAte('')
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (loading && pedidos.length === 0) {
    return <p className="ap-card-sub">Carregando pedidos...</p>
  }

  return (
    <div>
      {error && (
        <p className="ap-card" style={{ marginBottom: 16, color: 'var(--ap-red)' }}>
          {error}
        </p>
      )}

      <div className="ap-search-row">
        <Search size={16} className="ap-search-icon" />
        <input
          className="ap-input ap-search-input"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder="Pesquisar por cliente ou número do pedido..."
        />
      </div>

      <Accordion title={!filtrosAtivos ? 'Filtro avançado' : `Filtros ativos (${filtrosAtivosCount})`}>
        <div className="ap-filter-row">
          <div className="ap-filter-field flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="ap-filter-label">Status</span>
            <MultiSelectDropdown
              options={(Object.keys(STATUS_LABEL) as StatusPedido[]).map(status => ({ value: status, label: STATUS_LABEL[status] }))}
              selected={statusFiltro}
              onChange={updateStatusFiltro}
              placeholder="Status..."
            />
          </div>

          <div className="ap-filter-field flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="ap-filter-label">Método de pagamento</span>
            <MultiSelectDropdown
              options={(Object.keys(METODO_LABEL) as MetodoPagamento[]).map(metodo => ({ value: metodo, label: METODO_LABEL[metodo] }))}
              selected={metodosFiltro}
              onChange={updateMetodosFiltro}
              placeholder="Método..."
            />
          </div>

          <div className="ap-filter-field flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="ap-filter-label">Mesa</span>
            <MultiSelectDropdown
              options={mesasOptions}
              selected={mesasFiltro}
              onChange={updateMesasFiltro}
              placeholder="Mesa..."
            />
          </div>
        </div>

        <div className="ap-filter-row">
          <div className="ap-filter-field" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="ap-filter-label">De</span>
            <input
              type="date"
              className="ap-input"
              value={dataDe}
              onChange={event => updateDataDe(event.target.value)}
            />
          </div>

          <div className="ap-filter-field" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="ap-filter-label">Até</span>
            <input
              type="date"
              className="ap-input"
              value={dataAte}
              onChange={event => updateDataAte(event.target.value)}
            />
          </div>
        </div>

        {filtrosAtivosCount > 0 && (
          <button type="button" className="ap-btn ap-btn-ghost" onClick={limparFiltros}>
            Limpar filtros
          </button>
        )}
      </Accordion>

      <div className="ap-card" style={{ marginTop: 16 }}>
        {pedidos.length === 0 ? (
          <p className="ap-card-sub" style={{ marginBottom: 0 }}>
            {filtrosAtivos ? 'Nenhum pedido encontrado para esses filtros.' : 'Nenhum pedido registrado ainda.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Mesa</th>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Horário</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <tr key={pedido.id}>
                    <td className="ap-table-label">#{pedido.numeroSequencial}</td>
                    <td className="ap-table-sub">Mesa {pedido.mesa.numero}</td>
                    <td className="ap-table-sub">{pedido.nomeCliente}</td>
                    <td className="ap-table-sub">
                      {pedido.itens.reduce((soma, item) => soma + item.quantidade, 0)} item(ns)
                    </td>
                    <td className="ap-ranked-value">{fmt(Math.round(parseFloat(pedido.valorTotal) * 100))}</td>
                    <td className="ap-table-sub">{pedido.pagamento ? METODO_LABEL[pedido.pagamento.metodo] : '—'}</td>
                    <td>
                      <span className={`ap-badge-status ap-badge-status-${pedido.status.toLowerCase()}`}>
                        {STATUS_LABEL[pedido.status]}
                      </span>
                    </td>
                    <td className="ap-table-sub">{horarioLabel(pedido.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
