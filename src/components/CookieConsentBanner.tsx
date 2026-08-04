import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const RESTORED_NOTICE_DURATION_MS = 7000

export default function CookieConsentBanner() {
  const { consent, showRestoredNotice, acceptCookies, declineCookies, dismissRestoredNotice, clear } = useCart()

  useEffect(() => {
    if (consent !== 'accepted' || !showRestoredNotice) return

    const timer = setTimeout(dismissRestoredNotice, RESTORED_NOTICE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [consent, showRestoredNotice, dismissRestoredNotice])

  return (
    <>
      <AnimatePresence>
        {consent === 'accepted' && showRestoredNotice && (
          <motion.div
            key="restored-notice"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-4 left-1/2 z-60 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-emerald-700 bg-emerald-950/95 px-4 py-3 text-white shadow-lg backdrop-blur sm:left-auto sm:right-4 sm:translate-x-0"
          >
            <div className="flex items-start gap-3">
              <p className="flex-1 text-sm text-emerald-100">
                Encontramos um carrinho salvo da sua última visita.
              </p>
              <button
                type="button"
                onClick={dismissRestoredNotice}
                aria-label="Fechar"
                className="shrink-0 text-emerald-300 transition hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  clear()
                  dismissRestoredNotice()
                }}
                className="rounded-full border border-emerald-700 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-emerald-900"
              >
                Começar do zero
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {consent === 'unknown' && (
        <div className="fixed inset-x-0 bottom-0 z-60 border-t border-slate-700 bg-slate-900/95 px-4 py-3 text-white shadow-lg backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-200">
              Usamos cookies para lembrar o seu carrinho e manter o último pedido não concluído disponível ao voltar.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={declineCookies}
                className="rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={acceptCookies}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Aceitar cookies
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
