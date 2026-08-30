import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 text-left">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative w-full max-w-sm p-6"
            style={{
              borderRadius: 'var(--r-sheet, 28px)',
              background: 'var(--surface-sheet, #ffffff)',
              backdropFilter: 'var(--blur-glass, none)',
              WebkitBackdropFilter: 'var(--blur-glass, none)',
              boxShadow: 'var(--shadow-sheet, 0 24px 80px rgba(15,23,42,0.18))',
            }}
          >
            <h2 id="confirm-dialog-title" style={{ font: 'var(--text-title, 600 16px/1.3 system-ui, sans-serif)', color: 'var(--text-primary, #0f172a)' }}>
              {title}
            </h2>
            {description && (
              <p className="mt-2" style={{ font: 'var(--text-body, 400 14px/1.5 system-ui, sans-serif)', color: 'var(--text-secondary, #475569)' }}>
                {description}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 transition"
                style={{
                  borderRadius: 'var(--r-button, 16px)',
                  background: 'var(--surface-control, #f1f5f9)',
                  color: 'var(--text-primary, #334155)',
                  font: 'var(--text-label, 600 14px/1.35 system-ui, sans-serif)',
                }}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                autoFocus
                className="flex-1 px-4 py-3 transition"
                style={{
                  borderRadius: 'var(--r-button, 16px)',
                  font: 'var(--text-label, 600 14px/1.35 system-ui, sans-serif)',
                  background: destructive ? 'var(--danger, #e11d48)' : 'var(--gradient-cta, #0f172a)',
                  color: destructive ? '#fff' : 'var(--text-on-accent, #fff)',
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
