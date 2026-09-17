import { useEffect, useMemo, useState } from 'react'
import { Maximize2, Pencil, Search } from 'lucide-react'
import Accordion from '../../../../components/Accordion'
import MultiSelectDropdown from '../../../../components/MultiSelectDropdown'
import Pagination from '../components/Pagination'
import PedidoDetalheModal from '../components/PedidoDetalheModal'
import { listPedidosPaginado, updatePedidoStatusManual, type StatusPedidoManual } from '../../../../services/pedidosStaff'
import { listMesas, type Mesa } from '../../../../services/mesas'
import { TIPO_ENTREGA_LABEL, type MetodoPagamento, type Pedido, type StatusPedido } from '../../../../services/storefront'
import { fmt } from '../../../../data/menu'
import { getApiErrorMessage } from '../../../../services/apiClient'

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
  GOOGLE_PAY: 'Google Pay',
  APPLE_PAY: 'Apple Pay',
  BALCAO: 'Pagar no balcão',
}

const PAGE_SIZE = 10
const BUSCA_DEBOUNCE_MS = 350

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
  const [page, setPage] = useState(1)

  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca.trim()), BUSCA_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [busca])

  useEffect(() => {
    listMesas()
      .then(list => setMesas(list))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
  }, [buscaDebounced, statusFiltro, metodosFiltro, mesasFiltro, dataDe, dataAte])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    listPedidosPaginado({
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
        setError(null)
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
  }, [page, buscaDebounced, statusFiltro, metodosFiltro, mesasFiltro, dataDe, dataAte])

  const mesasOptions = useMemo(
    () =>
      mesas
        .slice()
        .sort((a, b) => a.numero - b.numero)
        .map(mesa => ({ value: mesa.id, label: `Mesa ${mesa.numero}` })),
    [mesas],
  )

  const filtrosAtivosCount = [
    statusFiltro.size > 0,
    metodosFiltro.size > 0,
    mesasFiltro.size > 0,
    dataDe !== '',
    dataAte !== '',
  ].filter(Boolean).length

  const filtrosAtivos = filtrosAtivosCount > 0
  const buscaOuFiltrosAtivos = filtrosAtivos || busca.trim() !== ''

  function limparFiltros() {
    setStatusFiltro(new Set())
    setMetodosFiltro(new Set())
    setMesasFiltro(new Set())
    setDataDe('')
    setDataAte('')
  }

  function abrirDetalhePedido(pedido: Pedido) {
    setPedidoSelecionado(pedido)
    setModalError(null)
    setModalOpen(true)
  }

  async function handleAlterarStatusManual(status: StatusPedidoManual, motivo: string) {
    if (!pedidoSelecionado) return
    setSaving(true)
    setModalError(null)
    try {
      const atualizado = await updatePedidoStatusManual(pedidoSelecionado.id, status, motivo)
      setPedidos(prev => prev.map(p => (p.id === atualizado.id ? atualizado : p)))
      setModalOpen(false)
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Não foi possível alterar o status do pedido.'))
    } finally {
      setSaving(false)
    }
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
              onChange={setStatusFiltro}
              placeholder="Status..."
            />
          </div>

          <div className="ap-filter-field flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="ap-filter-label">Método de pagamento</span>
            <MultiSelectDropdown
              options={(Object.keys(METODO_LABEL) as MetodoPagamento[]).map(metodo => ({ value: metodo, label: METODO_LABEL[metodo] }))}
              selected={metodosFiltro}
              onChange={setMetodosFiltro}
              placeholder="Método..."
            />
          </div>

          <div className="ap-filter-field flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="ap-filter-label">Mesa</span>
            <MultiSelectDropdown
              options={mesasOptions}
              selected={mesasFiltro}
              onChange={setMesasFiltro}
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
              onChange={event => setDataDe(event.target.value)}
            />
          </div>

          <div className="ap-filter-field" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="ap-filter-label">Até</span>
            <input
              type="date"
              className="ap-input"
              value={dataAte}
              onChange={event => setDataAte(event.target.value)}
            />
          </div>
        </div>

        {filtrosAtivos && (
          <button type="button" className="ap-btn ap-btn-ghost" onClick={limparFiltros}>
            Limpar filtros
          </button>
        )}
      </Accordion>

      <div className="ap-card" style={{ marginTop: 16 }}>
        {loading ? (
          <p className="ap-card-sub" style={{ marginBottom: 0 }}>Carregando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p className="ap-card-sub" style={{ marginBottom: 0 }}>
            {buscaOuFiltrosAtivos ? 'Nenhum pedido encontrado para esses filtros.' : 'Nenhum pedido registrado ainda.'}
          </p>
        ) : (
          <>
            <div className="ap-table-wrap" style={{ overflowX: 'auto' }}>
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
                    <th aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map(pedido => (
                    <tr key={pedido.id}>
                      <td className="ap-table-label">#{pedido.numeroSequencial}</td>
                      <td className="ap-table-sub">{pedido.mesa ? `Mesa ${pedido.mesa.numero}` : TIPO_ENTREGA_LABEL[pedido.tipoEntrega]}</td>
                      <td className="ap-table-sub">{pedido.nomeCliente}</td>
                      <td className="ap-table-sub">
                        {pedido.itens.reduce((total, item) => total + item.quantidade, 0)} item(ns)
                      </td>
                      <td className="ap-ranked-value">{fmt(Math.round(parseFloat(pedido.valorTotal) * 100))}</td>
                      <td className="ap-table-sub">{pedido.pagamento ? METODO_LABEL[pedido.pagamento.metodo] : '—'}</td>
                      <td>
                        <span className={`ap-badge-status ap-badge-status-${pedido.status.toLowerCase()}`}>
                          {STATUS_LABEL[pedido.status]}
                        </span>
                      </td>
                      <td className="ap-table-sub">{horarioLabel(pedido.criadoEm)}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="ap-btn ap-btn-ghost ap-btn-icon"
                            onClick={() => abrirDetalhePedido(pedido)}
                            aria-label="Ver pedido"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ap-item-cards">
              {pedidos.map(pedido => (
                <div key={pedido.id} className="ap-item-card">
                  <div className="ap-item-card-header">
                    <div>
                      <div className="ap-item-card-title">#{pedido.numeroSequencial} · {pedido.mesa ? `Mesa ${pedido.mesa.numero}` : TIPO_ENTREGA_LABEL[pedido.tipoEntrega]}</div>
                      <div className="ap-item-card-price" style={{ marginTop: 6 }}>
                        <span className={`ap-badge-status ap-badge-status-${pedido.status.toLowerCase()}`}>
                          {STATUS_LABEL[pedido.status]}
                        </span>
                      </div>
                    </div>
                    <div className="ap-item-card-actions">
                      <button
                        type="button"
                        className="ap-btn ap-btn-ghost ap-btn-icon"
                        onClick={() => abrirDetalhePedido(pedido)}
                        aria-label="Ver pedido"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="ap-item-card-body">
                    <div className="ap-item-card-row">
                      <span className="ap-item-card-row-label">Cliente</span>
                      <span>{pedido.nomeCliente}</span>
                    </div>
                    <div className="ap-item-card-row">
                      <span className="ap-item-card-row-label">Itens</span>
                      <span>{pedido.itens.reduce((total, item) => total + item.quantidade, 0)} item(ns)</span>
                    </div>
                    <div className="ap-item-card-row">
                      <span className="ap-item-card-row-label">Total</span>
                      <span className="ap-ranked-value">{fmt(Math.round(parseFloat(pedido.valorTotal) * 100))}</span>
                    </div>
                    <div className="ap-item-card-row">
                      <span className="ap-item-card-row-label">Pagamento</span>
                      <span>{pedido.pagamento ? METODO_LABEL[pedido.pagamento.metodo] : '—'}</span>
                    </div>
                    <div className="ap-item-card-row">
                      <span className="ap-item-card-row-label">Horário</span>
                      <span>{horarioLabel(pedido.criadoEm)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <PedidoDetalheModal
        open={modalOpen}
        pedido={pedidoSelecionado}
        saving={saving}
        error={modalError}
        onSubmit={handleAlterarStatusManual}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
