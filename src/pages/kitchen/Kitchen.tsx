import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import './kitchen.css'
import KitchenHeader from '../../components/kitchen/KitchenHeader'
import KitchenColumn from '../../components/kitchen/KitchenColumn'
import type { KitchenOrder } from '../../components/kitchen/types'
import { useAuth } from '../../context/AuthContext'
import { listPedidos, updatePedidoStatus } from '../../services/pedidosStaff'
import { getApiErrorMessage } from '../../services/apiClient'
import { usePedidosRealtime } from '../../services/realtime'
import type { Pedido } from '../../services/storefront'
import ConfirmDialog from '../../components/ConfirmDialog'
import StaffThemeShell from '../../components/ember/StaffThemeShell'

function toKitchenOrder(pedido: Pedido): KitchenOrder | null {
  if (pedido.status !== 'PREPARANDO' && pedido.status !== 'PRONTO') return null

  return {
    id: pedido.id,
    senha: pedido.numeroSequencial,
    nome: pedido.nomeCliente,
    criadoEm: new Date(pedido.criadoEm).getTime(),
    prontoEm: pedido.prontoEm ? new Date(pedido.prontoEm).getTime() : null,
    status: pedido.status === 'PREPARANDO' ? 'preparando' : 'pronto',
    itens: pedido.itens.map(item => ({
      qty: item.quantidade,
      nome: item.nomeProduto,
      opcoes: item.opcoesSelecionadas.map(o => `${o.grupoOpcaoNome}: ${o.opcaoNome}`),
    })),
    obs: pedido.itens.map(item => item.observacao).filter(Boolean).join(' · ') || null,
  }
}

export default function Kitchen() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const token = localStorage.getItem('authToken')

  const [pedidos, setPedidos] = useState<Record<string, Pedido>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [restaurantOpen, setRestaurantOpen] = useState(true)
  const [now, setNow] = useState(Date.now())
  const [newOrderId, setNewOrderId] = useState<string | null>(null)
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null)
  const knownPreparandoIds = useRef(new Set<string>())

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
          if (p.status === 'PREPARANDO' || p.status === 'PRONTO') knownPreparandoIds.current.add(p.id)
        })
        setPedidos(Object.fromEntries(list.map(p => [p.id, p])))
      })
      .catch(() => {
        if (isMounted) setLoadError('Não foi possível carregar os pedidos.')
      })

    return () => {
      isMounted = false
    }
  }, [])

  usePedidosRealtime(token, pedido => {
    const isNewlyPreparando = pedido.status === 'PREPARANDO' && !knownPreparandoIds.current.has(pedido.id)
    knownPreparandoIds.current.add(pedido.id)

    setPedidos(prev => ({ ...prev, [pedido.id]: pedido }))

    if (isNewlyPreparando) {
      setNewOrderId(pedido.id)
      setTimeout(() => setNewOrderId(current => (current === pedido.id ? null : current)), 1400)
    }
  })

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  async function finalizarPreparo(id: string) {
    try {
      const updated = await updatePedidoStatus(id, 'PRONTO')
      setPedidos(prev => ({ ...prev, [id]: updated }))
    } catch (err) {
      alert(getApiErrorMessage(err, 'Não foi possível atualizar o pedido. Tente novamente.'))
    }
  }

  async function pegarDeVolta(id: string) {
    try {
      const updated = await updatePedidoStatus(id, 'PREPARANDO')
      setPedidos(prev => ({ ...prev, [id]: updated }))
    } catch (err) {
      alert(getApiErrorMessage(err, 'Não foi possível voltar o pedido para preparo. Tente novamente.'))
    }
  }

  function cancelarPedido(id: string) {
    setPendingCancelId(id)
  }

  async function confirmCancelarPedido() {
    const id = pendingCancelId
    if (!id) return
    setPendingCancelId(null)
    try {
      const updated = await updatePedidoStatus(id, 'CANCELADO')
      setPedidos(prev => ({ ...prev, [id]: updated }))
    } catch (err) {
      alert(getApiErrorMessage(err, 'Não foi possível cancelar o pedido. Tente novamente.'))
    }
  }

  const kitchenOrders = useMemo(
    () => Object.values(pedidos).map(toKitchenOrder).filter((o): o is KitchenOrder => o !== null),
    [pedidos]
  )
  const preparando = kitchenOrders.filter(o => o.status === 'preparando')
  const pronto = kitchenOrders.filter(o => o.status === 'pronto')

  return (
    <StaffThemeShell>
    <div className="kitchen-page w-full">
      <KitchenHeader
        clock={new Date(now).toLocaleTimeString('pt-BR')}
        papel={user?.papel}
        restaurantOpen={restaurantOpen}
        onToggleRestaurantOpen={() => setRestaurantOpen(prev => !prev)}
        onLogout={handleLogout}
      />

      {!restaurantOpen && (
        <div className="kitchen-closed-banner flex items-center gap-2">
          <CircleAlert className="h-4 w-4 shrink-0" />
          <span>Restaurante fechado — nenhum pedido novo será recebido até o balcão abrir novamente. Os pedidos já em andamento continuam visíveis abaixo.</span>
        </div>
      )}

      {loadError && (
        <div className="kitchen-closed-banner flex items-center gap-2">
          <CircleAlert className="h-4 w-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="kitchen-board">
        <KitchenColumn
          title="Preparando"
          variant="preparando"
          live
          orders={preparando}
          now={now}
          papel={user?.papel}
          newOrderId={newOrderId}
          onFinalizarPreparo={finalizarPreparo}
          onPegarDeVolta={pegarDeVolta}
          onCancelarPedido={cancelarPedido}
        />
        <KitchenColumn
          title="Pronto"
          variant="pronto"
          orders={pronto}
          now={now}
          papel={user?.papel}
          newOrderId={newOrderId}
          onFinalizarPreparo={finalizarPreparo}
          onPegarDeVolta={pegarDeVolta}
          onCancelarPedido={cancelarPedido}
        />
      </div>

      <ConfirmDialog
        open={pendingCancelId !== null}
        title="Cancelar este pedido?"
        confirmLabel="Cancelar pedido"
        destructive
        onConfirm={confirmCancelarPedido}
        onCancel={() => setPendingCancelId(null)}
      />
    </div>
    </StaffThemeShell>
  )
}
