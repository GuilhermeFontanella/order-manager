import { useEffect } from 'react'
import { io } from 'socket.io-client'
import type { Pedido } from './storefront'

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function usePedidosRealtime(token: string | null, onPedidoAtualizado: (pedido: Pedido) => void) {
  useEffect(() => {
    if (!token) return

    const socket = io(`${SOCKET_URL}/pedidos`, { auth: { token } })

    socket.on('pedido:atualizado', onPedidoAtualizado)

    return () => {
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])
}
