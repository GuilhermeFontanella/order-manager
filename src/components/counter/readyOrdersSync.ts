export type ReadyOrderSnapshotItem = {
  id: string
  senha: number
  nome: string
  origem: string
  prontoEm: number
}

export type ReadyOrdersSnapshot = {
  prontos: ReadyOrderSnapshotItem[]
  lastCall: { senha: number; nome: string; origem: string; calledAt: number } | null
}

export const READY_ORDERS_STORAGE_KEY = 'botequim:readyOrdersSnapshot'

const EMPTY_SNAPSHOT: ReadyOrdersSnapshot = { prontos: [], lastCall: null }

export function readReadyOrdersSnapshot(): ReadyOrdersSnapshot {
  try {
    const raw = localStorage.getItem(READY_ORDERS_STORAGE_KEY)
    if (!raw) return EMPTY_SNAPSHOT
    return JSON.parse(raw) as ReadyOrdersSnapshot
  } catch {
    return EMPTY_SNAPSHOT
  }
}

export function writeReadyOrdersSnapshot(snapshot: ReadyOrdersSnapshot) {
  localStorage.setItem(READY_ORDERS_STORAGE_KEY, JSON.stringify(snapshot))
}
