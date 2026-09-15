import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/ember-theme.css'
import './counter.css'
import StaffThemeShell from '../../components/ember/StaffThemeShell'
import CounterHeader from '../../components/counter/CounterHeader'
import AdminNav from '../../components/counter/AdminNav'
import type { CounterOrder } from '../../components/counter/types'
import type { LastCall } from '../../components/counter/CallPanel'
import BalcaoPanel from './BalcaoPanel'
import DashboardPanel from './DashboardPanel'
import { useAuth } from '../../context/AuthContext'
import { writeReadyOrdersSnapshot } from '../../components/counter/readyOrdersSync'
import { listPedidos, updatePedidoStatus } from '../../services/pedidosStaff'
import { getApiErrorMessage } from '../../services/apiClient'
import { usePedidosRealtime } from '../../services/realtime'
import { listProdutos } from '../../services/produtos'
import { TIPO_ENTREGA_LABEL, type Pedido } from '../../services/storefront'
import ConfirmDialog from '../../components/ConfirmDialog'

const CHAMADA_COOLDOWN_MS = 8000

type CallState = { chamadas: number; cooldownUntil: number | null }

function toCounterOrder(pedido: Pedido, call: CallState | undefined): CounterOrder {
  return {
    id: pedido.id,
    senha: pedido.numeroSequencial,
    nome: pedido.nomeCliente,
    origem: pedido.mesa ? `Mesa ${pedido.mesa.numero}` : TIPO_ENTREGA_LABEL[pedido.tipoEntrega],
    valor: Math.round(parseFloat(pedido.valorTotal) * 100),
    criadoEm: new Date(pedido.criadoEm).getTime(),
    status: pedido.status,
    itens: pedido.itens.map(item => ({ qty: item.quantidade, nome: item.nomeProduto, produtoId: item.produtoId })),
    prontoEm: pedido.prontoEm ? new Date(pedido.prontoEm).getTime() : null,
    entregueEm: pedido.retiradoEm ? new Date(pedido.retiradoEm).getTime() : null,
    chamadas: call?.chamadas,
    cooldownUntil: call?.cooldownUntil ?? null,
  }
}

export default function Counter() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const token = localStorage.getItem('authToken')

  const [pedidos, setPedidos] = useState<Record<string, Pedido>>({})
  const [callState, setCallState] = useState<Record<string, CallState>>({})
  const [produtoCategorias, setProdutoCategorias] = useState<Record<string, string>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [adminMode, setAdminMode] = useState(false)
  const [restaurantOpen, setRestaurantOpen] = useState(true)
  const [horaAbertura, setHoraAbertura] = useState('11:00')
  const [page, setPage] = useState<'balcao' | 'dashboard'>('balcao')
  const [now, setNow] = useState(Date.now())
  const [newOrderId, setNewOrderId] = useState<string | null>(null)
  const [lastCall, setLastCall] = useState<LastCall>(null)
  const [callFlash, setCallFlash] = useState(false)
  const [confirmEncerrar, setConfirmEncerrar] = useState(false)
  const knownProntoIds = useRef(new Set<string>())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let isMounted = true

    listPedidos()
      .then(list => {
        if (!isMounted) return
        list.forEach(p => {
          if (p.status === 'PRONTO') knownProntoIds.current.add(p.id)
        })
        setPedidos(Object.fromEntries(list.map(p => [p.id, p])))
      })
      .catch(() => {
        if (isMounted) setLoadError('Não foi possível carregar os pedidos.')
      })

    listProdutos()
      .then(produtos => {
        if (!isMounted) return
        setProdutoCategorias(Object.fromEntries(produtos.map(p => [p.id, p.categoria ?? 'Outros'])))
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  usePedidosRealtime(token, pedido => {
    const isNewlyPronto = pedido.status === 'PRONTO' && !knownProntoIds.current.has(pedido.id)
    if (pedido.status === 'PRONTO') knownProntoIds.current.add(pedido.id)

    setPedidos(prev => ({ ...prev, [pedido.id]: pedido }))

    if (isNewlyPronto) {
      setNewOrderId(pedido.id)
      setTimeout(() => setNewOrderId(current => (current === pedido.id ? null : current)), 1400)
    }
  })

  const orders = useMemo(
    () => Object.values(pedidos).map(p => toCounterOrder(p, callState[p.id])),
    [pedidos, callState]
  )

  useEffect(() => {
    const prontos = orders
      .filter(o => o.status === 'PRONTO' && o.prontoEm != null)
      .map(o => ({ id: o.id, senha: o.senha, nome: o.nome, origem: o.origem, prontoEm: o.prontoEm as number }))
    writeReadyOrdersSnapshot({ prontos, lastCall })
  }, [orders, lastCall])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function abrirPainelDeChamada() {
    window.open('/ready-orders', '_blank', 'noopener,noreferrer')
  }

  function toggleAdmin() {
    setAdminMode(prev => {
      const next = !prev
      if (!next) setPage('balcao')
      return next
    })
  }

  function abrirRestaurante() {
    setRestaurantOpen(true)
    setHoraAbertura(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
  }

  function encerrarAtividades() {
    setConfirmEncerrar(true)
  }

  function confirmEncerrarAtividades() {
    setConfirmEncerrar(false)
    setRestaurantOpen(false)
    setPage('dashboard')
  }

  function reabrirRestaurante() {
    setRestaurantOpen(true)
    setHoraAbertura(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    setPage('balcao')
  }

  async function entregarPedido(id: string) {
    try {
      const updated = await updatePedidoStatus(id, 'RETIRADO')
      setPedidos(prev => ({ ...prev, [id]: updated }))
    } catch (err) {
      alert(getApiErrorMessage(err, 'Não foi possível confirmar a entrega. Tente novamente.'))
    }
  }

  async function devolverParaCozinha(id: string) {
    try {
      const updated = await updatePedidoStatus(id, 'PREPARANDO')
      setPedidos(prev => ({ ...prev, [id]: updated }))
    } catch (err) {
      alert(getApiErrorMessage(err, 'Não foi possível devolver o pedido para a cozinha. Tente novamente.'))
    }
  }

  async function reverterEntrega(id: string) {
    try {
      const updated = await updatePedidoStatus(id, 'PRONTO')
      setPedidos(prev => ({ ...prev, [id]: updated }))
    } catch (err) {
      alert(getApiErrorMessage(err, 'Não foi possível reverter a entrega. Tente novamente.'))
    }
  }

  function chamarCliente(id: string) {
    const order = orders.find(o => o.id === id)
    if (!order) return
    if (order.cooldownUntil && Date.now() < order.cooldownUntil) return

    setCallState(prev => ({
      ...prev,
      [id]: { chamadas: (prev[id]?.chamadas ?? 0) + 1, cooldownUntil: Date.now() + CHAMADA_COOLDOWN_MS },
    }))
    setLastCall({ senha: order.senha, nome: order.nome, origem: order.origem, calledAt: Date.now() })
    setCallFlash(false)
    requestAnimationFrame(() => setCallFlash(true))
    setTimeout(() => setCallFlash(false), 1000)
  }

  return (
    <StaffThemeShell>
    <div className="counter-page">
      <CounterHeader
        clock={new Date(now).toLocaleTimeString('pt-BR')}
        adminMode={adminMode}
        onToggleAdmin={toggleAdmin}
        restaurantOpen={restaurantOpen}
        onAbrirRestaurante={abrirRestaurante}
        onEncerrarAtividades={encerrarAtividades}
        onLogout={handleLogout}
      />

      {adminMode && <AdminNav page={page} onChange={setPage} />}

      {loadError && <div className="counter-empty-state">{loadError}</div>}

      {page === 'balcao' ? (
        <BalcaoPanel
          orders={orders}
          now={now}
          papel={user?.papel}
          restaurantOpen={restaurantOpen}
          newOrderId={newOrderId}
          lastCall={lastCall}
          callFlash={callFlash}
          onEntregar={entregarPedido}
          onChamar={chamarCliente}
          onDevolverParaCozinha={devolverParaCozinha}
          onReverterEntrega={reverterEntrega}
          horaAbertura={horaAbertura}
          onAbrirPainelDeChamada={abrirPainelDeChamada}
        />
      ) : (
        <DashboardPanel orders={orders} produtoCategorias={produtoCategorias} restaurantOpen={restaurantOpen} onReabrir={reabrirRestaurante} />
      )}

      <ConfirmDialog
        open={confirmEncerrar}
        title="Encerrar as atividades de hoje?"
        description="O cardápio para de aceitar pedidos, a cozinha para de receber novos pedidos, e você vai ver o dashboard do dia."
        confirmLabel="Encerrar"
        destructive
        onConfirm={confirmEncerrarAtividades}
        onCancel={() => setConfirmEncerrar(false)}
      />
    </div>
    </StaffThemeShell>
  )
}
