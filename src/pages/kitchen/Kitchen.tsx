import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './kitchen.css'
import KitchenHeader from '../../components/kitchen/KitchenHeader'
import KitchenColumn from '../../components/kitchen/KitchenColumn'
import type { KitchenOrder } from '../../components/kitchen/types'
import { useAuth } from '../../context/AuthContext'

const NOMES = ['Beatriz', 'Thiago', 'Camila', 'Diego', 'Larissa', 'Pedro', 'Fernanda']
const ITENS_MOCK = [
  { qty: 1, nome: 'X-Burger do Zé', opcoes: ['Médio'] },
  { qty: 1, nome: 'Isca de peixe crocante', opcoes: [] },
  { qty: 1, nome: 'Chopp artesanal', opcoes: ['400ml'] },
  { qty: 2, nome: 'Limonada suíça', opcoes: [] },
]

function seedOrders(): KitchenOrder[] {
  const now = Date.now()
  return [
    { id: 1, senha: 38, nome: 'Aline', criadoEm: now - 3 * 60000, status: 'fila_preparo',
      itens: [{ qty: 1, nome: 'X-Burger do Zé', opcoes: ['Grande', 'Bacon extra'] }], obs: 'Sem cebola' },
    { id: 2, senha: 39, nome: 'Rafael', criadoEm: now - 1 * 60000, status: 'fila_preparo',
      itens: [{ qty: 2, nome: 'Limonada suíça', opcoes: [] }], obs: null },
    { id: 3, senha: 36, nome: 'Carla', criadoEm: now - 6 * 60000, status: 'preparando',
      itens: [{ qty: 1, nome: 'Picanha na chapa', opcoes: ['Ao ponto'] }, { qty: 1, nome: 'Chopp artesanal', opcoes: ['600ml'] }], obs: null },
    { id: 4, senha: 35, nome: 'Marcos', criadoEm: now - 11 * 60000, status: 'preparando',
      itens: [{ qty: 1, nome: 'Bolinho de bacalhau', opcoes: ['Geleia de pimenta extra'] }], obs: 'Cliente com pressa' },
    { id: 5, senha: 33, nome: 'Juliana', criadoEm: now - 14 * 60000, status: 'pronto', prontoEm: now - 20 * 1000,
      itens: [{ qty: 1, nome: 'Filé à parmegiana', opcoes: [] }], obs: null },
    { id: 6, senha: 31, nome: 'Eduardo', criadoEm: now - 18 * 60000, status: 'pronto', prontoEm: now - 90 * 1000,
      itens: [{ qty: 2, nome: 'Pudim de leite', opcoes: [] }], obs: null },
  ]
}

export default function Kitchen() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<KitchenOrder[]>(seedOrders)
  const [nextSenha, setNextSenha] = useState(40)
  const [adminMode, setAdminMode] = useState(false)
  const [restaurantOpen, setRestaurantOpen] = useState(true)
  const [now, setNow] = useState(Date.now())
  const [newOrderId, setNewOrderId] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function iniciarPreparo(id: number) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'preparando' } : o)))
  }

  function finalizarPreparo(id: number) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'pronto', prontoEm: Date.now() } : o)))
  }

  function pegarDeVolta(id: number) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'preparando', prontoEm: null } : o)))
  }

  function cancelarPedido(id: number) {
    if (!confirm('Cancelar este pedido? Essa ação é exclusiva do usuário admin.')) return
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  function simularNovoPedido() {
    const id = Date.now()
    const senha = nextSenha
    setNextSenha(prev => prev + 1)
    setOrders(prev => [
      ...prev,
      {
        id,
        senha,
        nome: NOMES[Math.floor(Math.random() * NOMES.length)],
        criadoEm: Date.now(),
        status: 'fila_preparo',
        itens: [ITENS_MOCK[Math.floor(Math.random() * ITENS_MOCK.length)]],
        obs: Math.random() > 0.7 ? 'Capricha no ponto!' : null,
      },
    ])
    setNewOrderId(id)
    setTimeout(() => setNewOrderId(current => (current === id ? null : current)), 1400)
  }

  const fila = orders.filter(o => o.status === 'fila_preparo')
  const preparando = orders.filter(o => o.status === 'preparando')
  const pronto = orders.filter(o => o.status === 'pronto')

  return (
    <div className="kitchen-page w-full">
      <KitchenHeader
        clock={new Date(now).toLocaleTimeString('pt-BR')}
        adminMode={adminMode}
        onToggleAdmin={() => setAdminMode(prev => !prev)}
        restaurantOpen={restaurantOpen}
        onToggleRestaurantOpen={() => setRestaurantOpen(prev => !prev)}
        onSimularNovoPedido={simularNovoPedido}
        onLogout={handleLogout}
      />

      {!restaurantOpen && (
        <div className="kitchen-closed-banner">
          🚫 Restaurante fechado — nenhum pedido novo será recebido até o balcão abrir novamente. Os pedidos já em andamento continuam visíveis abaixo.
        </div>
      )}

      <div className="kitchen-board">
        <KitchenColumn
          title="Fila de preparo"
          variant="fila"
          orders={fila}
          now={now}
          adminMode={adminMode}
          newOrderId={newOrderId}
          onIniciarPreparo={iniciarPreparo}
          onFinalizarPreparo={finalizarPreparo}
          onPegarDeVolta={pegarDeVolta}
          onCancelarPedido={cancelarPedido}
        />
        <KitchenColumn
          title="Preparando"
          variant="preparando"
          live
          orders={preparando}
          now={now}
          adminMode={adminMode}
          newOrderId={newOrderId}
          onIniciarPreparo={iniciarPreparo}
          onFinalizarPreparo={finalizarPreparo}
          onPegarDeVolta={pegarDeVolta}
          onCancelarPedido={cancelarPedido}
        />
        <KitchenColumn
          title="Pronto"
          variant="pronto"
          orders={pronto}
          now={now}
          adminMode={adminMode}
          newOrderId={newOrderId}
          onIniciarPreparo={iniciarPreparo}
          onFinalizarPreparo={finalizarPreparo}
          onPegarDeVolta={pegarDeVolta}
          onCancelarPedido={cancelarPedido}
        />
      </div>
    </div>
  )
}
