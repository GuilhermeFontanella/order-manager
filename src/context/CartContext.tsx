import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Item } from '../data/menu'

type CartItem = {
  id: string
  item: Item
  qty: number
  obs?: string
}

type ConsentState = 'unknown' | 'accepted' | 'declined'

type CartContextType = {
  items: CartItem[]
  consent: ConsentState
  showRestoredNotice: boolean
  add: (item: Item, qty?: number, obs?: string) => void
  remove: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  acceptCookies: () => void
  declineCookies: () => void
  dismissRestoredNotice: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const COOKIE_NAME = 'order-manager-cart'
const CONSENT_NAME = 'order-manager-cookie-consent'

function readCartFromCookie(): CartItem[] {
  if (typeof document === 'undefined') return []

  const raw = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_NAME}=`))

  if (!raw) return []

  try {
    const value = decodeURIComponent(raw.split('=').slice(1).join('='))
    return JSON.parse(value) as CartItem[]
  } catch {
    return []
  }
}

function readConsentFromCookie(): ConsentState {
  if (typeof document === 'undefined') return 'unknown'

  const raw = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${CONSENT_NAME}=`))

  if (!raw) return 'unknown'

  return raw.split('=').slice(1).join('=') === 'accepted' ? 'accepted' : 'declined'
}

function writeCartCookie(items: CartItem[], consent: ConsentState) {
  if (typeof document === 'undefined') return

  if (consent !== 'accepted') {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/`
    return
  }

  const value = encodeURIComponent(JSON.stringify(items))
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 30}`
}

function writeConsentCookie(consent: ConsentState) {
  if (typeof document === 'undefined') return

  document.cookie = `${CONSENT_NAME}=${consent}; path=/; max-age=${60 * 60 * 24 * 365}`
}

function getInitialCartState(consent: ConsentState) {
  if (consent !== 'accepted') {
    return { items: [] as CartItem[], showRestoredNotice: false }
  }

  const items = readCartFromCookie()
  return { items, showRestoredNotice: items.length > 0 }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const initialConsent = readConsentFromCookie()
  const initialState = getInitialCartState(initialConsent)
  const [items, setItems] = useState<CartItem[]>(initialState.items)
  const [consent, setConsent] = useState<ConsentState>(initialConsent)
  const [showRestoredNotice, setShowRestoredNotice] = useState(initialState.showRestoredNotice)

  useEffect(() => {
    writeCartCookie(items, consent)
  }, [items, consent])

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
    setShowRestoredNotice(false)
  }

  function acceptCookies() {
    setConsent('accepted')
    writeConsentCookie('accepted')

    const savedItems = readCartFromCookie()
    if (savedItems.length > 0) {
      setItems(savedItems)
      setShowRestoredNotice(true)
      return
    }

    setShowRestoredNotice(false)
  }

  function declineCookies() {
    setConsent('declined')
    writeConsentCookie('declined')
    setItems([])
    setShowRestoredNotice(false)
    writeCartCookie([], 'declined')
  }

  function dismissRestoredNotice() {
    setShowRestoredNotice(false)
  }

  return (
    <CartContext.Provider value={{ items, consent, showRestoredNotice, add, remove, updateQty, clear, acceptCookies, declineCookies, dismissRestoredNotice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
