const TENANT_SLUG_KEY = 'tenantSlug'
const QR_TOKEN_KEY = 'mesaQrCodeToken'
const SAVED_AT_KEY = 'mesaSessionSavedAt'

// Uma visita ao restaurante não deveria durar mais que isso — passado esse tempo,
// tratamos a sessão como abandonada (ex: dispositivo compartilhado, cliente já foi embora).
export const MESA_SESSION_TTL_MS = 4 * 60 * 60 * 1000 // 4 horas

export type MesaSession = {
  tenantSlug: string
  // Ausente quando o cliente acessou o cardápio sem escanear o QR code da mesa
  // (fluxo de take away/delivery). Nesse caso o pedido não tem mesa vinculada.
  qrCodeToken?: string
}

export function saveMesaSession(session: MesaSession) {
  localStorage.setItem(TENANT_SLUG_KEY, session.tenantSlug)
  if (session.qrCodeToken) {
    localStorage.setItem(QR_TOKEN_KEY, session.qrCodeToken)
  } else {
    localStorage.removeItem(QR_TOKEN_KEY)
  }
  localStorage.setItem(SAVED_AT_KEY, String(Date.now()))
}

export function readMesaSession(): MesaSession | null {
  const tenantSlug = localStorage.getItem(TENANT_SLUG_KEY)
  const qrCodeToken = localStorage.getItem(QR_TOKEN_KEY)
  const savedAt = Number(localStorage.getItem(SAVED_AT_KEY))

  if (!tenantSlug) return null

  if (!savedAt || Date.now() - savedAt > MESA_SESSION_TTL_MS) {
    clearMesaSession()
    return null
  }

  return { tenantSlug, qrCodeToken: qrCodeToken ?? undefined }
}

export function clearMesaSession() {
  localStorage.removeItem(TENANT_SLUG_KEY)
  localStorage.removeItem(QR_TOKEN_KEY)
  localStorage.removeItem(SAVED_AT_KEY)
}

const MESA_LINK_PATTERN = /\/r\/([^/]+)\/mesa\/([^/?#]+)/

export function parseMesaLink(text: string): MesaSession | null {
  const match = text.match(MESA_LINK_PATTERN)
  if (!match) return null
  return { tenantSlug: match[1], qrCodeToken: match[2] }
}
