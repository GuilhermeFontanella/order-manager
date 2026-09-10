import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X } from 'lucide-react'

type SnackbarVariant = 'success' | 'info' | 'error'

type Props = {
  open: boolean
  message: string
  variant?: SnackbarVariant
  duration?: number
  onClose: () => void
}

const VARIANT_STYLES: Record<SnackbarVariant, { bg: string; color: string; Icon: typeof CheckCircle2 }> = {
  success: { bg: 'var(--ap-green-tint)', color: 'var(--ap-green-dark)', Icon: CheckCircle2 },
  info: { bg: 'var(--ap-gold-soft)', color: 'var(--ap-gold-dark)', Icon: Info },
  error: { bg: 'var(--ap-red-tint)', color: 'var(--ap-red)', Icon: Info },
}

export default function Snackbar({ open, message, variant = 'success', duration = 6000, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [open, duration, onClose])

  const { bg, color, Icon } = VARIANT_STYLES[variant]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          role="status"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 12,
            background: bg,
            color,
            boxShadow: 'var(--ap-shadow-md)',
            fontSize: 13.5,
            fontWeight: 600,
            maxWidth: 'min(92vw, 420px)',
          }}
        >
          <Icon size={17} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{message}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', display: 'flex', padding: 2, opacity: 0.7 }}
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
