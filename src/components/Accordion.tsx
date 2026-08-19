import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function Accordion({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [settled, setSettled] = useState(defaultOpen)

  function toggle() {
    setSettled(false)
    setOpen(prev => !prev)
  }

  return (
    <div className="ap-accordion">
      <button type="button" className="ap-accordion-header" onClick={toggle} aria-expanded={open}>
        <div>
          <div className="ap-accordion-title">{title}</div>
          {subtitle && <div className="ap-accordion-subtitle">{subtitle}</div>}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
          <ChevronDown size={17} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onAnimationComplete={() => setSettled(true)}
            style={{ overflow: settled ? 'visible' : 'hidden' }}
          >
            <div className="ap-accordion-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
