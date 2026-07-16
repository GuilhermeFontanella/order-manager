import React, { createContext, useContext, useState } from 'react'
import type { Item } from '../data/menu'

type CartItem = {
  id: string
  item: Item
  qty: number
  obs?: string
}

type CartContextType = {
  items: CartItem[]
  add: (item: Item, qty?: number, obs?: string) => void
  remove: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])

  function add(item: Item, qty = 1, obs?: string) {
    setItems(prev => {
      const existing = prev.find(p => p.item.id === item.id)
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, qty: p.qty + qty } : p)
      }
      return [...prev, { id: `${item.id}-${Date.now()}`, item, qty, obs }]
    })
  }

  function remove(id: string) {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  function updateQty(id: string, qty: number) {
    setItems(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(0, qty) } : p).filter(p => p.qty > 0))
  }

  function clear() {
    setItems([])
  }

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
