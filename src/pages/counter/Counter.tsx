import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './counter.css'
import CounterHeader from '../../components/counter/CounterHeader'
import AdminNav from '../../components/counter/AdminNav'
import type { CounterOrder } from '../../components/counter/types'
import type { LastCall } from '../../components/counter/CallPanel'
import BalcaoPanel from './BalcaoPanel'
import DashboardPanel from './DashboardPanel'
import { useAuth } from '../../context/AuthContext'
import { writeReadyOrdersSnapshot } from '../../components/counter/readyOrdersSync'

const NOMES = ['Beatriz', 'Thiago', 'Camila', 'Diego', 'Larissa', 'Pedro', 'Fernanda']
const VALORES_MOCK = [1800, 2500, 3200, 3800, 6200]
const CHAMADA_COOLDOWN_MS = 8000

function seedOrders(): CounterOrder[] {
  const now = Date.now()
  return [
    { id: 1, senha: 33, nome: 'Juliana', mesa: 7, valor: 3800, criadoEm: now - 14 * 60000, status: 'pronto', prontoEm: now - 20 * 1000,
      itens: [{ qty: 1, nome: 'Filé à parmegiana' }] },
    { id: 2, senha: 31, nome: 'Eduardo', mesa: 3, valor: 3000, criadoEm: now - 18 * 60000, status: 'pronto', prontoEm: now - 90 * 1000,
      itens: [{ qty: 2, nome: 'Pudim de leite' }] },
    { id: 3, senha: 29, nome: 'Renata', mesa: 12, valor: 3700, criadoEm: now - 22 * 60000, status: 'pronto', prontoEm: now - 5 * 60000,
      itens: [{ qty: 1, nome: 'X-Burger do Zé' }, { qty: 1, nome: 'Limonada suíça' }] },
    { id: 4, senha: 38, nome: 'Aline', mesa: 5, valor: 2500, criadoEm: now - 3 * 60000, status: 'fila_preparo',
      itens: [{ qty: 1, nome: 'X-Burger do Zé' }] },
    { id: 5, senha: 36, nome: 'Carla', mesa: 9, valor: 6200, criadoEm: now - 6 * 60000, status: 'preparando',
      itens: [{ qty: 1, nome: 'Picanha na chapa' }] },
    { id: 6, senha: 27, nome: 'Bruno', mesa: 2, valor: 1800, criadoEm: now - 30 * 60000, status: 'entregue',
      prontoEm: now - 26 * 60000, entregueEm: now - 24 * 60000, itens: [{ qty: 1, nome: 'Chopp artesanal' }] },
    { id: 7, senha: 25, nome: 'Patrícia', mesa: 4, valor: 3200, criadoEm: now - 40 * 60000, status: 'cancelado',
      itens: [{ qty: 1, nome: 'Isca de peixe crocante' }] },
  ]
}

export default function Counter() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<CounterOrder[]>(seedOrders)
  const [nextSenha, setNextSenha] = useState(40)
  const [adminMode, setAdminMode] = useState(false)
  const [restaurantOpen, setRestaurantOpen] = useState(true)
  const [horaAbertura, setHoraAbertura] = useState('11:00')
  const [page, setPage] = useState<'balcao' | 'dashboard'>('balcao')
  const [now, setNow] = useState(Date.now())
  const [newOrderId, setNewOrderId] = useState<number | null>(null)
  const [lastCall, setLastCall] = useState<LastCall>(null)
  const [callFlash, setCallFlash] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const prontos = orders
      .filter(o => o.status === 'pronto' && o.prontoEm != null)
      .map(o => ({ id: o.id, senha: o.senha, nome: o.nome, mesa: o.mesa, prontoEm: o.prontoEm as number }))
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
    if (!confirm('Encerrar as atividades de hoje? O cardápio para de aceitar pedidos, a cozinha para de receber novos pedidos, e você vai ver o dashboard do dia.')) return
    setRestaurantOpen(false)
    setPage('dashboard')
  }

  function reabrirRestaurante() {
    setRestaurantOpen(true)
    setHoraAbertura(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    setPage('balcao')
  }

  function simularPedidoPronto() {
    const id = Date.now()
    const senha = nextSenha
    setNextSenha(prev => prev + 1)
    setOrders(prev => [
      ...prev,
      {
        id,
        senha,
        nome: NOMES[Math.floor(Math.random() * NOMES.length)],
        mesa: Math.floor(Math.random() * 14) + 1,
        valor: VALORES_MOCK[Math.floor(Math.random() * VALORES_MOCK.length)],
        criadoEm: Date.now() - 4 * 60000,
        status: 'pronto',
        prontoEm: Date.now(),
        itens: [{ qty: 1, nome: 'X-Burger do Zé' }],
      },
    ])
    setNewOrderId(id)
    setTimeout(() => setNewOrderId(current => (current === id ? null : current)), 1400)
  }

  function entregarPedido(id: number) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'entregue', entregueEm: Date.now() } : o)))
  }

  function chamarCliente(id: number) {
    setOrders(prev => {
      const order = prev.find(o => o.id === id)
      if (!order || (order.cooldownUntil && Date.now() < order.cooldownUntil)) return prev
      setLastCall({ senha: order.senha, nome: order.nome, mesa: order.mesa, calledAt: Date.now() })
      return prev.map(o =>
        o.id === id ? { ...o, chamadas: (o.chamadas || 0) + 1, cooldownUntil: Date.now() + CHAMADA_COOLDOWN_MS } : o
      )
    })
    setCallFlash(false)
    requestAnimationFrame(() => setCallFlash(true))
    setTimeout(() => setCallFlash(false), 1000)
  }

  function confirmarDevolucao(id: number, motivo: string) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'preparando', prontoEm: null, motivoDevolucao: motivo } : o)))
  }

  function reverterEntrega(id: number) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'pronto', prontoEm: Date.now(), entregueEm: null } : o)))
  }

  return (
    <div className="counter-page">
      <CounterHeader
        clock={new Date(now).toLocaleTimeString('pt-BR')}
        adminMode={adminMode}
        onToggleAdmin={toggleAdmin}
        restaurantOpen={restaurantOpen}
        onAbrirRestaurante={abrirRestaurante}
        onEncerrarAtividades={encerrarAtividades}
        onSimularPedidoPronto={simularPedidoPronto}
        onLogout={handleLogout}
      />

      {adminMode && <AdminNav page={page} onChange={setPage} />}

      {page === 'balcao' ? (
        <BalcaoPanel
          orders={orders}
          now={now}
          adminMode={adminMode}
          restaurantOpen={restaurantOpen}
          newOrderId={newOrderId}
          lastCall={lastCall}
          callFlash={callFlash}
          onEntregar={entregarPedido}
          onChamar={chamarCliente}
          onConfirmarDevolucao={confirmarDevolucao}
          onReverterEntrega={reverterEntrega}
          horaAbertura={horaAbertura}
          onAbrirPainelDeChamada={abrirPainelDeChamada}
        />
      ) : (
        <DashboardPanel orders={orders} restaurantOpen={restaurantOpen} onReabrir={reabrirRestaurante} />
      )}
    </div>
  )
}
